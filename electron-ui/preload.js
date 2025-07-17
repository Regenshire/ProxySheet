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
  runUserConfigFile: (filePath) => ipcRenderer.invoke('run-user-config-file', filePath)  
});