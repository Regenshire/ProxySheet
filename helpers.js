// electron-ui/helpers.js
const fs = require('fs');
const path = require('path');
const USER_CONFIGS_DIR = path.resolve(__dirname, 'USER_CONFIGS');
const xml2js = require('xml2js');
const CONFIG_INFO_PATH = path.join(USER_CONFIGS_DIR, 'configInfo.xml');
const TEMPLATE_INFO_PATH = path.resolve(__dirname, 'RE_Silhouette/templateInfo.xml');

const logPath = path.join(__dirname, 'logs', 'logs.txt');

function writeHelperLog(message) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] [helpers.js] ${message}\n`;

  try {
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, entry, 'utf8');
  } catch (err) {
    console.error('❌ Failed to write log from helpers.js:', err.message);
  }
}

const isValidName = (str, maxLength) => {
  const validPattern = /^[\w\s-]+$/;
  return typeof str === 'string' && str.length > 0 && str.length <= maxLength && validPattern.test(str);
};

const buildJsxContent = (config, includePath) => {
  const lines = Object.entries(config).map(([key, val]) => {
    const safeVal = typeof val === 'string' ? JSON.stringify(val) : val;
    return `var ${key} = ${safeVal};`;
  });

  lines.push('\n// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE');
  lines.push(`#include "${includePath}"`);
  return lines.join('\n');
};

const buildBatchJsxContent = (config, includePath, imageFiles, isBackPage, sheetPageNum, pdfExportPath, outputFile, nextConfigPath) => {
  const lines = [];

  lines.push(`// Auto-generated Batch Layout Page`);
  lines.push('// ' + new Date().toLocaleString());
  lines.push('\n// === CONFIG VALUES ===');

  Object.entries(config).forEach(([key, val]) => {
    if (val === '' || val == null) return;
    if (isBackPage && key === 'cardBack') return; // prevent conflicting cardBack assignments
    const safeVal = typeof val === 'string' ? JSON.stringify(val) : val;
    lines.push(`var ${key} = ${safeVal};`);
  });

  if (isBackPage) {
    lines.push('var cardBack = true;');
  }

  lines.push('\n// === Card Files ===');
  lines.push('var selectEachCard = false;');

  lines.push('\n// === Batch Mode File List ===');
  lines.push('var batchImagePaths = [');
  lines.push(...imageFiles.map((p) => `  "${p.replace(/\\/g, '\\\\')}",`));
  lines.push('];');

  lines.push('var selectEachCard = false;');

  const folderPath = imageFiles.length > 0 ? path.dirname(imageFiles[0]) : '';
  lines.push(`var batchImageDirectory = "${folderPath.replace(/\\/g, '\\\\')}";`);

  lines.push('var batchSkipPrompt = true;');
  lines.push('var batchLightMode = true;');

  lines.push('var outputPDF = true;');

  let fullNextPath = '';
  if (nextConfigPath && nextConfigPath.length > 0) {
    const absPath = path.resolve(__dirname, nextConfigPath);
    fullNextPath = absPath.replace(/\\/g, '\\\\');
  }
  lines.push(`var batchNextConfig = "${fullNextPath}";`);

  //writeHelperLog(` buildBatchJsxContent - nextConfigPath: ${nextConfigPath}`);
  //writeHelperLog(` buildBatchJsxContent - fullNextPath: ${fullNextPath}`);

  lines.push('var pdfExportPreset = "Press Quality";');
  lines.push(`var batchNumber = ${config.batchNumber};`);

  lines.push(`var sheetPageNum = ${sheetPageNum};`);

  const baseName = outputFile.replace(/\.jsx$/i, '').replace(/[^a-zA-Z0-9_]/g, '_');
  lines.push(`var exportBaseName = "${baseName}";`);

  if (pdfExportPath) {
    lines.push(`var pdfExportPath = "${pdfExportPath.replace(/\\/g, '\\\\')}";`);
  }

  lines.push('\n// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE');
  lines.push(`#include "${includePath}"`);

  return lines.join('\n');
};

const parseJsxVarsFromFile = (filePath) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const result = {
    batchNumber: null,
    layout: null,
    cardFormat: null,
    dpi: null,
    exportSingles: false,
    outputPDF: false,
    useSilhouette: false,
    cardBack: false,
    date: null
  };

  const match = (regex) => {
    const m = content.match(regex);
    return m ? m[1].trim() : null;
  };

  result.layout = match(/var\s+layout\s*=\s*\"([^\"]+)\"/);
  result.cardFormat = match(/var\s+cardFormat\s*=\s*\"([^\"]+)\"/);
  result.paperType = match(/var\s+paperType\s*=\s*"([^"]+)"/);
  result.dpi = match(/var\s+dpi\s*=\s*(\d+)/);

  result.exportSingles = /var\s+exportSingles\s*=\s*true/.test(content);
  result.outputPDF = /var\s+outputPDF\s*=\s*true/.test(content);
  result.useSilhouette = /var\s+useSilhouette\s*=\s*true/.test(content);
  result.cardBack = /var\s+cardBack\s*=\s*true/.test(content);

  result.date = match(/generated on ([^\n]+)/i) || '';

  const fileNameMatch = filePath.match(/Batch_(\d+)\.jsx$/);
  result.batchNumber = fileNameMatch ? parseInt(fileNameMatch[1], 10) : null;

  return result;
};

const listBatchHistory = (directory) => {
  if (!fs.existsSync(directory)) return [];
  const files = fs.readdirSync(directory).filter((name) => name.endsWith('.jsx'));

  return files
    .map((file) => {
      const fullPath = path.join(directory, file);
      const info = parseJsxVarsFromFile(fullPath);

      const infoText = [info.exportSingles ? 'Exports Singles' : null, info.outputPDF ? 'Exports PDF' : null, info.useSilhouette ? 'Silhouette Enabled' : null].filter(Boolean).join(', ');

      return {
        batchNumber: info.batchNumber,
        filePath: fullPath,
        date: info.date,
        layout: info.layout,
        cardFormat: info.cardFormat,
        dpi: info.dpi,
        infoText
      };
    })
    .sort((a, b) => b.batchNumber - a.batchNumber);
};

const listUserConfigs = (baseDir) => {
  if (!fs.existsSync(baseDir)) return [];
  const folderMeta = loadFolderMetadata();

  const folders = fs.readdirSync(baseDir).filter((f) => {
    const full = path.join(baseDir, f);
    return fs.statSync(full).isDirectory();
  });

  return folders
    .map((folder) => {
      const folderPath = path.join(baseDir, folder);
      const scripts = fs
        .readdirSync(folderPath)
        .filter((file) => file.endsWith('.jsx'))
        .map((file) => {
          const fullPath = path.join(folderPath, file);
          const info = parseJsxVarsFromFile(fullPath);
          const infoText = [info.exportSingles ? 'Exports Singles' : null, info.outputPDF ? 'Exports PDF' : null, info.useSilhouette ? 'Silhouette Enabled' : null].filter(Boolean).join(', ');

          return {
            fileName: file,
            filePath: fullPath,
            layout: info.layout,
            cardFormat: info.cardFormat,
            dpi: info.dpi,
            cardBack: info.cardBack,
            paperType: info.paperType || 'Custom',
            date: info.date,
            infoText
          };
        });

      const meta = folderMeta[folder] || {};

      return {
        folder,
        scripts,
        sortOrder: parseInt(meta.sortOrder || '999', 10),
        description: meta.description || ''
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

const loadFolderMetadata = () => {
  if (!fs.existsSync(CONFIG_INFO_PATH)) return {};

  const xml = fs.readFileSync(CONFIG_INFO_PATH, 'utf-8');
  let meta = {};

  xml2js.parseString(xml, (err, result) => {
    if (err || !result?.configs?.folder) return;

    result.configs.folder.forEach((f) => {
      const name = f.$.name;
      meta[name] = {
        sortOrder: f.sortOrder?.[0] || '999',
        description: f.description?.[0] || '',
        expanded: f.$.expanded === 'true'
      };
    });
  });

  return meta;
};

const loadTemplateMetadata = () => {
  if (!fs.existsSync(TEMPLATE_INFO_PATH)) return {};

  const xml = fs.readFileSync(TEMPLATE_INFO_PATH, 'utf-8');
  let meta = {};

  xml2js.parseString(xml, (err, result) => {
    if (err || !result?.templates?.template) return;

    result.templates.template.forEach((t) => {
      const fileName = t.$.fileName;
      meta[fileName] = {
        sortOrder: parseInt(t.sortOrder?.[0] || '999', 10),
        title: t.title?.[0] || '',
        description: t.description?.[0] || '',
        tags: t.tags?.[0] || ''
      };
    });
  });

  return meta;
};

const saveTemplateMetadata = (templateList) => {
  const builder = new xml2js.Builder({ headless: true, rootName: 'templates' });
  const nodes = templateList.map((entry) => ({
    $: { fileName: entry.fileName },
    sortOrder: entry.sortOrder.toString(),
    title: entry.title || '',
    description: entry.description || '',
    tags: entry.tags || ''
  }));

  const xml = builder.buildObject({ template: nodes });
  fs.writeFileSync(TEMPLATE_INFO_PATH, xml, 'utf-8');
};

const runJsxFile = (filePath) => {
  const { shell } = require('electron');
  return shell.openPath(filePath);
};

const BATCH_HISTORY_DIR = path.resolve(__dirname, 'batchHistory');

const getBatchHistoryData = () => {
  return listBatchHistory(BATCH_HISTORY_DIR);
};

const getUserConfigData = () => listUserConfigs(USER_CONFIGS_DIR);

const saveFolderSortOrder = (sortedList) => {
  const existing = loadFolderMetadata();

  const builder = new xml2js.Builder({ headless: true, rootName: 'configs' });
  const folderNodes = sortedList.map((entry) => ({
    $: {
      name: entry.name,
      sortOrder: entry.sortOrder.toString(),
      expanded: existing[entry.name]?.expanded ? 'true' : 'false'
    },
    description: existing[entry.name]?.description || ''
  }));

  const xml = builder.buildObject({ folder: folderNodes });
  fs.writeFileSync(CONFIG_INFO_PATH, xml, 'utf-8');
};

const updateFolderDescription = (folderName, newDesc) => {
  const existing = loadFolderMetadata();

  const builder = new xml2js.Builder({ headless: true, rootName: 'configs' });

  const updated = Object.keys(existing).map((name) => ({
    $: { name },
    sortOrder: existing[name].sortOrder || '999',
    description: name === folderName ? newDesc : existing[name].description || ''
  }));

  if (!existing[folderName]) {
    updated.push({
      $: { name: folderName },
      sortOrder: '999',
      description: newDesc
    });
  }

  const xml = builder.buildObject({ folder: updated });
  fs.writeFileSync(CONFIG_INFO_PATH, xml, 'utf-8');
};

const getSilhouetteTemplates = () => {
  const dir = path.resolve(__dirname, 'RE_Silhouette');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.studio') || f.endsWith('.studio3'));
  const meta = loadTemplateMetadata();

  return files
    .map((file, idx) => {
      const info = meta[file] || {};
      return {
        fileName: file,
        filePath: path.join(dir, file),
        sortOrder: info.sortOrder ?? 999,
        title: info.title || file,
        description: info.description || '',
        tags: info.tags || ''
      };
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
};

const updateFolderExpandedState = (folderName, isExpanded) => {
  const existing = loadFolderMetadata();

  const builder = new xml2js.Builder({ headless: true, rootName: 'configs' });

  const updated = Object.keys(existing).map((name) => ({
    $: {
      name,
      sortOrder: existing[name].sortOrder || '999',
      description: existing[name].description || '',
      expanded: name === folderName ? (isExpanded ? 'true' : 'false') : existing[name].expanded ? 'true' : 'false'
    }
  }));

  if (!existing[folderName]) {
    updated.push({
      $: {
        name: folderName,
        sortOrder: '999',
        description: '',
        expanded: isExpanded ? 'true' : 'false'
      }
    });
  }

  const xml = builder.buildObject({ folder: updated });
  fs.writeFileSync(CONFIG_INFO_PATH, xml, 'utf-8');
};

module.exports = {
  isValidName,
  buildJsxContent,
  buildBatchJsxContent,
  parseJsxVarsFromFile,
  listBatchHistory,
  runJsxFile,
  getBatchHistoryData,
  getUserConfigData,
  saveFolderSortOrder,
  getSilhouetteTemplates,
  saveTemplateMetadata,
  updateFolderExpandedState,
  updateFolderDescription
};
