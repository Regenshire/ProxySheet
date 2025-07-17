// electron-ui/helpers.js
const fs = require('fs');
const path = require('path');
const USER_CONFIGS_DIR = path.resolve(__dirname, '../USER_CONFIGS');
const xml2js = require('xml2js');
const CONFIG_INFO_PATH = path.join(USER_CONFIGS_DIR, 'configInfo.xml');
const TEMPLATE_INFO_PATH = path.resolve(__dirname, '../RE_Silhouette/templateInfo.xml');

const isValidName = (str, maxLength) => {
  const validPattern = /^[\w\s-]+$/;
  return typeof str === 'string' &&
         str.length > 0 &&
         str.length <= maxLength &&
         validPattern.test(str);
};

const buildJsxContent = (config, includePath) => {
  const lines = Object.entries(config).map(([key, val]) => {
    const safeVal = typeof val === 'string' ? JSON.stringify(val) : val;
    return `var ${key} = ${safeVal};`;
  });

  lines.push("\n// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE");
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
  const files = fs.readdirSync(directory).filter(name => name.endsWith('.jsx'));

  return files.map(file => {
    const fullPath = path.join(directory, file);
    const info = parseJsxVarsFromFile(fullPath);

    const infoText = [
      info.exportSingles ? "Exports Singles" : null,
      info.outputPDF ? "Exports PDF" : null,
      info.useSilhouette ? "Silhouette Enabled" : null
    ].filter(Boolean).join(", ");

    return {
      batchNumber: info.batchNumber,
      filePath: fullPath,
      date: info.date,
      layout: info.layout,
      cardFormat: info.cardFormat,
      dpi: info.dpi,
      infoText
    };
  }).sort((a, b) => b.batchNumber - a.batchNumber);
};

const listUserConfigs = (baseDir) => {
  if (!fs.existsSync(baseDir)) return [];
  const folderMeta = loadFolderMetadata();

  const folders = fs.readdirSync(baseDir).filter(f => {
    const full = path.join(baseDir, f);
    return fs.statSync(full).isDirectory();
  });

  return folders.map(folder => {
    const folderPath = path.join(baseDir, folder);
    const scripts = fs.readdirSync(folderPath)
      .filter(file => file.endsWith('.jsx'))
      .map(file => {
        const fullPath = path.join(folderPath, file);
        const info = parseJsxVarsFromFile(fullPath);
        const infoText = [
          info.exportSingles ? "Exports Singles" : null,
          info.outputPDF ? "Exports PDF" : null,
          info.useSilhouette ? "Silhouette Enabled" : null
        ].filter(Boolean).join(", ");

        return {
          fileName: file,
          filePath: fullPath,
          layout: info.layout,
          cardFormat: info.cardFormat,
          dpi: info.dpi,
          cardBack: info.cardBack,
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
  }).sort((a, b) => a.sortOrder - b.sortOrder);
};

const loadFolderMetadata = () => {
  if (!fs.existsSync(CONFIG_INFO_PATH)) return {};

  const xml = fs.readFileSync(CONFIG_INFO_PATH, 'utf-8');
  let meta = {};

  xml2js.parseString(xml, (err, result) => {
    if (err || !result?.configs?.folder) return;

    result.configs.folder.forEach(f => {
      const name = f.$.name;
      meta[name] = {
        sortOrder: f.sortOrder?.[0] || '999',
        description: f.description?.[0] || ''
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

    result.templates.template.forEach(t => {
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
  const nodes = templateList.map(entry => ({
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

const BATCH_HISTORY_DIR = path.resolve(__dirname, '../batchHistory');

const getBatchHistoryData = () => {
  return listBatchHistory(BATCH_HISTORY_DIR);
};

const getUserConfigData = () => listUserConfigs(USER_CONFIGS_DIR);

const saveFolderSortOrder = (sortedList) => {
  const existing = loadFolderMetadata();

  const builder = new xml2js.Builder({ headless: true, rootName: 'configs' });
  const folderNodes = sortedList.map(entry => ({
    $: { name: entry.name },
    sortOrder: entry.sortOrder.toString(),
    description: existing[entry.name]?.description || ''
  }));

  const xml = builder.buildObject({ folder: folderNodes });
  fs.writeFileSync(CONFIG_INFO_PATH, xml, 'utf-8');
};

const updateFolderDescription = (folderName, newDesc) => {
  const existing = loadFolderMetadata();

  const builder = new xml2js.Builder({ headless: true, rootName: 'configs' });

  const updated = Object.keys(existing).map(name => ({
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
  const dir = path.resolve(__dirname, '../RE_Silhouette');
  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter(f => f.endsWith('.studio') || f.endsWith('.studio3'));
  const meta = loadTemplateMetadata();

  return files.map((file, idx) => {
    const info = meta[file] || {};
    return {
      fileName: file,
      filePath: path.join(dir, file),
      sortOrder: info.sortOrder ?? 999,
      title: info.title || file,
      description: info.description || '',
      tags: info.tags || ''
    };
  }).sort((a, b) => a.sortOrder - b.sortOrder);
};


module.exports = {
  isValidName,
  buildJsxContent,
  parseJsxVarsFromFile,
  listBatchHistory,
  runJsxFile,
  getBatchHistoryData,
  getUserConfigData,
  saveFolderSortOrder,
  getSilhouetteTemplates,
  saveTemplateMetadata,
  updateFolderDescription
};
