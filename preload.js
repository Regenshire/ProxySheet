// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  generateJSX: (config) => ipcRenderer.invoke('generate-jsx', config),
  saveUserConfig: (folderName, configName, config) =>
    ipcRenderer.invoke('save-user-config', { folderName, configName, config }),
  listUserConfigFolders: () =>
    ipcRenderer.invoke('list-user-config-folders'),
  getBatchHistory: () => ipcRenderer.invoke('get-batch-history'),  
  runBatchFile: (filePath) => ipcRenderer.invoke('run-batch-file', filePath),
    getUserConfigs: () => ipcRenderer.invoke('get-user-configs'),
  updateFolderSortOrder: (order) => ipcRenderer.invoke('update-folder-sort-order', order),
  updateFolderDescription: (folder, description) => ipcRenderer.invoke('update-folder-description', { folder, description }),
    getSilhouetteTemplates: () => ipcRenderer.invoke('get-silhouette-templates'),
  saveSilhouetteTemplateMetadata: (list) => ipcRenderer.invoke('save-silhouette-template-metadata', list),
  buildBatchJsx: (filePaths, config, includePath, isBackPage, sheetPageNum, pdfExportPath, outputFile, nextConfigPath) =>
    ipcRenderer.invoke('build-batch-jsx', filePaths, config, includePath, isBackPage, sheetPageNum, pdfExportPath, outputFile, nextConfigPath),
  selectCardImageFolder: () => ipcRenderer.invoke('select-card-folder'),
  selectCardBackImage: () => ipcRenderer.invoke('select-card-back'),
  getCardImageFiles: (folderPath) => ipcRenderer.invoke('get-card-image-files', folderPath),
  mergePDFs: (inputPaths, outputPath) => ipcRenderer.invoke('merge-pdfs', { inputPaths, outputPath }),
  cleanupBatchTemp: () => ipcRenderer.invoke('cleanup-batch-temp'),
  writeLog: (msg) => ipcRenderer.invoke('write-log', msg),
  readSentinelFile: (path) => ipcRenderer.invoke('read-file-content', path),
  deleteFile: (path) => ipcRenderer.invoke('delete-file', path),
  readDirFiltered: (folder, ext) => ipcRenderer.invoke('read-dir-filtered', folder, ext),
  fileExists: (path) => ipcRenderer.invoke('file-exists', path),
  runUserConfigFile: (filePath) => ipcRenderer.invoke('run-user-config-file', filePath)  
});