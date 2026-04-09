const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  platform: process.platform,

  profiles: {
    getAll:       ()                      => ipcRenderer.invoke('profiles:get-all'),
    create:       (data)                  => ipcRenderer.invoke('profiles:create', data),
    update:       (profileId, changes)    => ipcRenderer.invoke('profiles:update', { profileId, changes }),
    delete:       (profileId)             => ipcRenderer.invoke('profiles:delete', profileId),
    addFolder:    (profileId, folderPath) => ipcRenderer.invoke('profiles:add-folder', { profileId, folderPath }),
    removeFolder: (profileId, folderPath) => ipcRenderer.invoke('profiles:remove-folder', { profileId, folderPath }),
    scan:         (profileId)             => ipcRenderer.invoke('profiles:scan', profileId),
  },

  cards: {
    getSession:       (profileId)                    => ipcRenderer.invoke('cards:get-session', profileId),
    rate:             (profileId, cardPath, rating)  => ipcRenderer.invoke('cards:rate', { profileId, cardPath, rating }),
    previewIntervals: (profileId, cardPath)          => ipcRenderer.invoke('cards:preview-intervals', { profileId, cardPath }),
  },

  dialog: {
    openFolder: () => ipcRenderer.invoke('dialog:open-folder'),
  },
})
