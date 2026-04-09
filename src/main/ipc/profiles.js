const { ipcMain, dialog, BrowserWindow } = require('electron')
const { randomUUID } = require('crypto')
const fs = require('fs')
const path = require('path')
const { readData, writeData } = require('../store')

// ── File scanning ─────────────────────────────────────────────

function scanFolder(folderPath, depth = 0) {
  const MAX_DEPTH = 8
  if (depth > MAX_DEPTH) return []
  try {
    if (!fs.existsSync(folderPath)) return []
    const entries = fs.readdirSync(folderPath, { withFileTypes: true })
    const cards = []
    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue
      const fullPath = path.join(folderPath, entry.name)
      if (entry.isFile() && entry.name.endsWith('.md')) {
        const stat = fs.statSync(fullPath)
        cards.push({
          id: fullPath,
          path: fullPath,
          name: entry.name.replace(/\.md$/, ''),
          folder: folderPath,
          modifiedAt: stat.mtime.toISOString(),
        })
      } else if (entry.isDirectory()) {
        cards.push(...scanFolder(fullPath, depth + 1))
      }
    }
    return cards
  } catch {
    return []
  }
}

function scanProfile(profile) {
  const cards = []
  for (const folder of profile.folders) {
    cards.push(...scanFolder(folder))
  }
  // Deduplicate by path (edge case: overlapping folder paths)
  const seen = new Set()
  return cards.filter(c => {
    if (seen.has(c.path)) return false
    seen.add(c.path)
    return true
  })
}

// ── IPC handlers ──────────────────────────────────────────────

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
    // Clean up card/session state for this profile
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
