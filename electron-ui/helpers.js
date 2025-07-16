// electron-ui/helpers.js
const fs = require('fs');
const path = require('path');
const USER_CONFIGS_DIR = path.resolve(__dirname, '../USER_CONFIGS');

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

    return {
      folder,
      scripts
    };
  });
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

module.exports = {
  isValidName,
  buildJsxContent,
  parseJsxVarsFromFile,
  listBatchHistory,
  runJsxFile,
  getBatchHistoryData,
  getUserConfigData
};
