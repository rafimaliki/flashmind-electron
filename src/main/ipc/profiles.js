const { ipcMain, dialog, BrowserWindow } = require('electron')
const { randomUUID } = require('crypto')
const { readData, writeData } = require('../store')
const { scanProfile } = require('../scanner')

function registerProfileHandlers() {
  ipcMain.handle('profiles:get-all', () => {
    return readData().profiles
  })

  ipcMain.handle('profiles:create', (_, { name, cardsPerSession }) => {
    const data = readData()
    const profile = {
      id: randomUUID(),
      name: name.trim(),
      cardsPerSession: Number(cardsPerSession) || 20,
      folders: [],
      createdAt: new Date().toISOString(),
    }
    data.profiles.push(profile)
    writeData(data)
    return profile
  })

  ipcMain.handle('profiles:update', (_, { profileId, changes }) => {
    const data = readData()
    const profile = data.profiles.find(p => p.id === profileId)
    if (!profile) throw new Error('Profile not found')
    const allowed = ['name', 'cardsPerSession']
    for (const key of allowed) {
      if (key in changes) profile[key] = changes[key]
    }
    writeData(data)
    return profile
  })

  ipcMain.handle('profiles:delete', (_, profileId) => {
    const data = readData()
    data.profiles = data.profiles.filter(p => p.id !== profileId)
    delete data.cards[profileId]
    delete data.sessions[profileId]
    writeData(data)
    return { success: true }
  })

  ipcMain.handle('profiles:add-folder', (_, { profileId, folderPath }) => {
    const data = readData()
    const profile = data.profiles.find(p => p.id === profileId)
    if (!profile) throw new Error('Profile not found')
    if (!profile.folders.includes(folderPath)) {
      profile.folders.push(folderPath)
    }
    writeData(data)
    return profile
  })

  ipcMain.handle('profiles:remove-folder', (_, { profileId, folderPath }) => {
    const data = readData()
    const profile = data.profiles.find(p => p.id === profileId)
    if (!profile) throw new Error('Profile not found')
    profile.folders = profile.folders.filter(f => f !== folderPath)
    writeData(data)
    return profile
  })

  ipcMain.handle('profiles:scan', (_, profileId) => {
    const data = readData()
    const profile = data.profiles.find(p => p.id === profileId)
    if (!profile) return { count: 0, cards: [] }
    const cards = scanProfile(profile)
    return { count: cards.length, cards }
  })

  ipcMain.handle('dialog:open-folder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
      title: 'Select a folder containing Markdown files',
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })
}

module.exports = { registerProfileHandlers }
