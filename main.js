// electron-ui/main.js
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers');
const { Menu } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 1200,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    title: `ProxySheet - Photoshop Proxy Layout Tool - v${app.getVersion()}`,
    icon: path.join(__dirname, 'assets', 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

Menu.setApplicationMenu(
  Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [{ role: 'quit' }]
    },
    {
      label: 'View',
      submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' }, { type: 'separator' }, { role: 'togglefullscreen' }]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'GitHub',
          click: async () => {
            const { shell } = require('electron');
            await shell.openExternal('https://github.com/Regenshire/MTGPhotoshopLayout');
          }
        }
      ]
    }
  ])
);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

ipcMain.handle('generate-jsx', async (_, config) => {
  const configDir = path.resolve(__dirname, 'TempConfig');
  const outputPath = path.join(configDir, 'MTG_Generated.jsx');

  // Add default values if missing
  if (!('batchHistory' in config)) config.batchHistory = true;
  if (!('displayBatchNumber' in config)) config.displayBatchNumber = false;

  const jsx = helpers.buildJsxContent(config, '../RE_PhotoEngine/RE_PhotoEngine.jsx');

  try {
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir);
    }

    fs.writeFileSync(outputPath, jsx);
    await shell.openPath(outputPath);

    return { success: true, path: outputPath };
  } catch (err) {
    return { success: false, message: '❌ Failed to launch JSX: ' + err.message };
  }
});

ipcMain.handle('save-user-config', async (_, { folderName, configName, config }) => {
  try {
    if (!helpers.isValidName(folderName, 40)) {
      throw new Error('Invalid folder name. Use only letters, numbers, spaces, dashes, and underscores.');
    }

    if (!helpers.isValidName(configName, 100)) {
      throw new Error('Invalid config name. Use only letters, numbers, spaces, dashes, and underscores.');
    }

    const baseDir = path.resolve(__dirname, 'USER_CONFIGS');
    const targetDir = path.join(baseDir, folderName);
    const outputPath = path.join(targetDir, `${configName}.jsx`);

    if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir);

    const now = new Date();
    config.configCreateDate = now.toISOString();

    const lines = [];
    lines.push(`// ${folderName} > ${configName}`);
    lines.push('\n// === CONFIG - You can edit these values ===\n');

    lines.push('// --- Layout ---');
    lines.push(`var layout = \"${config.layout}\";`);
    lines.push(`var pageWidthInches = ${config.pageWidthInches};`);
    lines.push(`var pageHeightInches = ${config.pageHeightInches};`);
    lines.push(`var dpi = ${config.dpi};`);

    lines.push(`var paperType = "${config.paperType || 'Custom'}";`);

    lines.push('\n// --- Card Format ---');
    const skipCardWidth = config.cardFormat === 'NoBleed' && config.useSilhouette === true;

    lines.push(`var cardFormat = \"${config.cardFormat}\";`);
    if (!skipCardWidth && config.cardWidthMM !== '') {
      lines.push(`var cardWidthMM = ${config.cardWidthMM};`);
    }
    if (!skipCardWidth && config.cardHeightMM !== '') {
      lines.push(`var cardHeightMM = ${config.cardHeightMM};`);
    }

    lines.push('\n// --- Cut & Bleed ---');
    const skipCutSettings = config.cardFormat === 'NoBleed' && config.useSilhouette === true;

    if (!skipCutSettings && config.cutMarkSize !== '') {
      lines.push(`var cutMarkSize = ${config.cutMarkSize};`);
    }

    if (!skipCutSettings && config.cropBleed !== '') {
      lines.push(`var cropBleed = ${config.cropBleed};`);
    }

    if (!skipCutSettings && config.cutOffset !== '') {
      lines.push(`var cutOffset = ${config.cutOffset};`);
    }

    if (!skipCutSettings && config.cardGap !== '') {
      lines.push(`var cardGap = ${config.cardGap};`);
    }

    if (skipCutSettings) {
      lines.push(`var showCropMarks = false;`);
    } else {
      lines.push(`var showCropMarks = ${config.showCropMarks};`);
    }

    lines.push('\n// --- Color Adjustments ---');
    if (config.bright !== '' && config.bright != null) lines.push(`var bright = ${config.bright};`);
    if (config.contr !== '' && config.contr != null) lines.push(`var contr = ${config.contr};`);
    if (config.vib !== '' && config.vib != null) lines.push(`var vib = ${config.vib};`);
    if (config.sat !== '' && config.sat != null) lines.push(`var sat = ${config.sat};`);
    if (config.gmm !== '' && config.gmm != null) lines.push(`var gmm = ${config.gmm};`);
    if (config.whitepoint !== '' && config.whitepoint != null) lines.push(`var whitepoint = ${config.whitepoint};`);
    if (config.blackpoint !== '' && config.blackpoint != null) lines.push(`var blackpoint = ${config.blackpoint};`);

    const addAdj = typeof config.addPerCardAdjustLayer === 'undefined' ? true : !!config.addPerCardAdjustLayer;
    lines.push(`var addPerCardAdjustLayer = ${addAdj};`);

    lines.push('\n// --- Back Alignment ---');
    lines.push(`var cardBack = ${config.cardBack};`);
    lines.push(`var backOffsetXmm = ${config.backOffsetXmm};`);
    lines.push(`var backOffsetYmm = ${config.backOffsetYmm};`);
    lines.push(`var selectEachCard = ${config.selectEachCard};`);

    if (config.excludeCardSlots && config.excludeCardSlots.trim() !== '') {
      lines.push(`var excludeCardSlots = "${config.excludeCardSlots.trim()}";`);
    }

    lines.push('\n// --- Silhouette ---');
    lines.push(`var useSilhouette = ${config.useSilhouette};`);
    lines.push(`var useMagicVersion = ${Boolean(config.useMagicVersion)};`);

    lines.push('\n// --- Batch PDF Settings ---');
    lines.push(`var batchMultiPage = ${config.batchMultiPage};`);
    lines.push(`var noBackImage = ${config.noBackImage};`);
    lines.push(`var separateBackPDF = ${config.separateBackPDF};`);

    lines.push('\n// --- Notes ---');
    lines.push(`var notesOn = ${config.notesOn};`);
    lines.push(`var noteFontSize = ${config.noteFontSize};`);
    lines.push(`var manualNote = ${JSON.stringify(config.manualNote)};`);

    lines.push('\n// --- Meta Info ---');
    lines.push(`var configCreateDate = \"${config.configCreateDate}\";`);

    lines.push('\n// === END CONFIG ===\n');
    lines.push('// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE');
    lines.push('#include "../../RE_PhotoEngine/RE_PhotoEngine.jsx"');

    fs.writeFileSync(outputPath, lines.join('\n'));

    return { success: true, path: outputPath };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle('list-user-config-folders', async () => {
  const dir = path.resolve(__dirname, 'USER_CONFIGS');
  try {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter((f) => fs.lstatSync(path.join(dir, f)).isDirectory());
  } catch (err) {
    return [];
  }
});

ipcMain.handle('get-batch-history', async () => {
  const helpers = require('./helpers');
  return helpers.getBatchHistoryData();
});

ipcMain.handle('run-batch-file', async (_, filePath) => {
  const helpers = require('./helpers');
  return helpers.runJsxFile(filePath);
});

ipcMain.handle('get-user-configs', async () => {
  return helpers.getUserConfigData();
});

ipcMain.handle('get-silhouette-templates', async () => {
  return helpers.getSilhouetteTemplates();
});

ipcMain.handle('save-silhouette-template-metadata', async (_, updatedList) => {
  return helpers.saveTemplateMetadata(updatedList);
});

ipcMain.handle('run-user-config-file', async (_, filePath) => {
  return helpers.runJsxFile(filePath);
});

ipcMain.handle('update-folder-sort-order', async (_, order) => {
  return helpers.saveFolderSortOrder(order);
});

ipcMain.handle('update-folder-description', async (_, { folder, description }) => {
  return helpers.updateFolderDescription(folder, description);
});

ipcMain.handle('update-folder-expanded', async (_, { folder, expanded }) => {
  return helpers.updateFolderExpandedState(folder, expanded);
});

ipcMain.handle('build-batch-jsx', async (_, filePaths, config, includePath, isBackPage, sheetPageNum, pdfExportPath, outputFile, nextConfigPath) => {
  const jsx = helpers.buildBatchJsxContent(config, includePath, filePaths, isBackPage, sheetPageNum, pdfExportPath, outputFile, nextConfigPath);
  const configDir = path.resolve(__dirname, 'TempConfig');
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir);
  const outPath = path.resolve(configDir, outputFile);
  fs.writeFileSync(outPath, jsx, 'utf-8');
  return outPath;
});

ipcMain.handle('select-card-folder', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select Your Card Image Folder',
    buttonLabel: 'Use this Folder',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  return { path: result.filePaths[0] };
});

ipcMain.handle('get-card-image-files', async (_, folderPath) => {
  const fs = require('fs');
  const path = require('path');

  try {
    const files = fs
      .readdirSync(folderPath)
      //.filter(name => /\.(jpg|jpeg|png)$/i.test(name))
      .filter((name) => name.match(/\.(jpg|jpeg|png|webp|tif|tiff|eps|bmp|gif|heic|heif|svg)$/i))
      .map((name) => ({
        name,
        path: path.join(folderPath, name)
      }));

    return { success: true, files };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle('select-card-back', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select Default Back Image',
    buttonLabel: 'Use this Card Back',
    properties: ['openFile'],
    filters: [{ name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp', 'tif', 'tiff', 'eps', 'bmp', 'gif', 'heic', 'heif', 'svg'] }]
  });

  if (result.canceled || !result.filePaths.length) {
    return { canceled: true };
  }

  return { path: result.filePaths[0], name: path.basename(result.filePaths[0]) };
});

ipcMain.handle('write-log', async (_, message) => {
  try {
    const logDir = path.resolve(__dirname, 'logs');
    const logFile = path.join(logDir, 'logs.txt');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}\n`;
    fs.appendFileSync(logFile, entry, 'utf8');
  } catch (err) {
    console.error('⚠️ Failed to write log:', err.message);
  }
});

ipcMain.handle('read-file-content', async (_, relativePath) => {
  const fullPath = path.resolve(__dirname, relativePath);
  try {
    const content = fs.readFileSync(fullPath, 'utf-8');
    return { success: true, content };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle('delete-file', async (_, relativePath) => {
  const fullPath = path.resolve(__dirname, relativePath);
  try {
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    return { success: true };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

const { pdfMerge } = require('./pdf-utils');

ipcMain.handle('merge-pdfs', async (_, { inputPaths, outputPath }) => {
  const resolvedOutput = path.resolve(__dirname, outputPath);
  const resolvedInputs = inputPaths.map((p) => path.resolve(__dirname, p));
  const success = await pdfMerge(resolvedInputs, resolvedOutput);
  return { success };
});

const { cleanupBatchTemp } = require('./pdf-utils');

ipcMain.handle('cleanup-batch-temp', async () => {
  return cleanupBatchTemp();
});

ipcMain.handle('read-dir-filtered', async (_, folder, ext = '') => {
  const dirPath = path.resolve(__dirname, folder);
  try {
    const files = fs.readdirSync(dirPath).filter((f) => f.endsWith(ext));
    return { success: true, files };
  } catch (err) {
    return { success: false, message: err.message };
  }
});

ipcMain.handle('file-exists', async (_, relativePath) => {
  const fullPath = path.resolve(__dirname, relativePath);
  return fs.existsSync(fullPath);
});

ipcMain.handle('open-pdf-output-folder', async () => {
  const outDir = path.resolve(__dirname, 'PDFOutput');

  try {
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    await shell.openPath(outDir);
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to open PDFOutput folder:', err.message);
    return { success: false, message: err.message };
  }
});

ipcMain.handle('open-file-with-default-app', async (_, relativePath) => {
  const { shell } = require('electron');
  const fullPath = path.resolve(__dirname, relativePath);

  try {
    await shell.openPath(fullPath);
    return { success: true };
  } catch (err) {
    console.error('❌ Failed to open file:', err.message);
    return { success: false, message: err.message };
  }
});

ipcMain.handle('apply-offset-to-all-configs', async (_, { offsetX, offsetY }) => {
  try {
    const configRoot = path.resolve(__dirname, 'USER_CONFIGS');
    const folders = fs.readdirSync(configRoot).filter((f) => fs.statSync(path.join(configRoot, f)).isDirectory());

    let updatedFiles = 0;

    for (const folder of folders) {
      const folderPath = path.join(configRoot, folder);
      const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.jsx'));

      for (const file of files) {
        const fullPath = path.join(folderPath, file);
        let content = fs.readFileSync(fullPath, 'utf-8');

        // Replace backOffsetXmm and backOffsetYmm if they exist
        const hasBackX = /var\s+backOffsetXmm\s*=/.test(content);
        const hasBackY = /var\s+backOffsetYmm\s*=/.test(content);

        if (!hasBackX && !hasBackY) continue;

        if (hasBackX) {
          content = content.replace(/var\s+backOffsetXmm\s*=\s*[-.\d]+;/, `var backOffsetXmm = ${offsetX};`);
        }
        if (hasBackY) {
          content = content.replace(/var\s+backOffsetYmm\s*=\s*[-.\d]+;/, `var backOffsetYmm = ${offsetY};`);
        }

        fs.writeFileSync(fullPath, content, 'utf-8');
        updatedFiles++;
      }
    }

    return { success: true, updated: updatedFiles };
  } catch (err) {
    return { success: false, message: err.message };
  }
});
