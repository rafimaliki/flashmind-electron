const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { registerProfileHandlers } = require('./ipc/profiles')
const { registerCardHandlers } = require('./ipc/cards')
const { registerDashboardHandlers } = require('./ipc/dashboard')

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: '#0a0a0d',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    show: false,
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
  }
}

ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

registerProfileHandlers()
registerCardHandlers()
registerDashboardHandlers()

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
