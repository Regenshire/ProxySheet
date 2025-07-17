// electron-ui/main.js
const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const helpers = require('./helpers');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    resizable: true,
    title: 'MTG Proxy Layout Tool',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  win.loadFile('index.html');
}

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
      throw new Error("Invalid folder name. Use only letters, numbers, spaces, dashes, and underscores.");
    }

    if (!helpers.isValidName(configName, 100)) {
      throw new Error("Invalid config name. Use only letters, numbers, spaces, dashes, and underscores.");
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
    lines.push("\n// === CONFIG - You can edit these values ===\n");

    lines.push("// --- Layout ---");
    lines.push(`var layout = \"${config.layout}\";`);
    lines.push(`var pageWidthInches = ${config.pageWidthInches};`);
    lines.push(`var pageHeightInches = ${config.pageHeightInches};`);
    lines.push(`var dpi = ${config.dpi};`);

    lines.push("\n// --- Card Format ---");
    const skipCardWidth = config.cardFormat === "NoBleed" && config.useSilhouette === true;

    lines.push(`var cardFormat = \"${config.cardFormat}\";`);
    if (!skipCardWidth && config.cardWidthMM  !== '') {
      lines.push(`var cardWidthMM = ${config.cardWidthMM};`);
    }
    if (!skipCardWidth && config.cardHeightMM  !== '') {
      lines.push(`var cardHeightMM = ${config.cardHeightMM};`);
    }

    lines.push("\n// --- Cut & Bleed ---");
    const skipCutSettings = config.cardFormat === "NoBleed" && config.useSilhouette === true;

    if (!skipCutSettings && config.cutMarkSize !== '') {
      lines.push(`var cutMarkSize = ${config.cutMarkSize};`);
    }

    if (!skipCutSettings && config.cutOffset !== '') {
      lines.push(`var cutOffset = ${config.cutOffset};`);
    }

    if (skipCutSettings) {
      lines.push(`var showCropMarks = false;`);
    } else {
      lines.push(`var showCropMarks = ${config.showCropMarks};`);
    }



    lines.push("\n// --- Color Adjustments ---");
    lines.push(`var bright = ${config.bright};`);
    lines.push(`var contr = ${config.contr};`);
    lines.push(`var vib = ${config.vib};`);
    lines.push(`var sat = ${config.sat};`);
    lines.push(`var gmm = ${config.gmm};`);
    lines.push(`var whitepoint = ${config.whitepoint};`);
    lines.push(`var blackpoint = ${config.blackpoint};`);

    lines.push("\n// --- Back Alignment ---");
    lines.push(`var cardBack = ${config.cardBack};`);
    lines.push(`var backOffsetXmm = ${config.backOffsetXmm};`);
    lines.push(`var backOffsetYmm = ${config.backOffsetYmm};`);
    lines.push(`var selectEachCard = ${config.selectEachCard};`);

    lines.push("\n// --- Silhouette ---");
    lines.push(`var useSilhouette = ${config.useSilhouette};`);

    lines.push("\n// --- Notes ---");
    lines.push(`var notesOn = ${config.notesOn};`);
    lines.push(`var noteFontSize = ${config.noteFontSize};`);
    lines.push(`var manualNote = ${JSON.stringify(config.manualNote)};`);

    lines.push("\n// --- Meta Info ---");
    lines.push(`var configCreateDate = \"${config.configCreateDate}\";`);

    lines.push("\n// === END CONFIG ===\n");
    lines.push("// INCLUDE THE RE_PhotoEngine.jsx FILE - DO NOT REMOVE");
    lines.push("#include \"../../RE_PhotoEngine/RE_PhotoEngine.jsx\"");

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
    return fs.readdirSync(dir).filter(f =>
      fs.lstatSync(path.join(dir, f)).isDirectory()
    );
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

