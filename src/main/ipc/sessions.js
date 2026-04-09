const { ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const { readData, writeData } = require('../store')

function registerSessionHandlers() {
  // Returns the in-progress session for a profile, or null.
  ipcMain.handle('sessions:get-active', (_, profileId) => {
    const data = readData()
    return data.activeSessions?.[profileId] ?? null
  })

  // Persist current session progress (called after each card rating and on session start).
  ipcMain.handle('sessions:save-progress', (_, { profileId, remainingPaths, ratedCount, totalCards, startedAt }) => {
    const data = readData()
    if (!data.activeSessions) data.activeSessions = {}
    data.activeSessions[profileId] = {
      remainingPaths,
      ratedCount,
      totalCards,
      startedAt,
      savedAt: new Date().toISOString(),
    }
    writeData(data)
    return { success: true }
  })

  // Remove the active session for a profile (called on completion or "Start Fresh").
  ipcMain.handle('sessions:clear-active', (_, profileId) => {
    const data = readData()
    if (data.activeSessions) delete data.activeSessions[profileId]
    writeData(data)
    return { success: true }
  })

  // Load card content for remaining paths in an active session.
  ipcMain.handle('sessions:resume', (_, profileId) => {
    const data = readData()
    const active = data.activeSessions?.[profileId]
    if (!active) return null

    const cards = []
    for (const cardPath of active.remainingPaths) {
      try {
        const content = fs.readFileSync(cardPath, 'utf-8')
        cards.push({
          id: cardPath,
          path: cardPath,
          name: path.basename(cardPath, '.md'),
          folder: path.dirname(cardPath),
          content,
        })
      } catch {
        // File moved or deleted — skip silently
      }
    }

    return {
      cards,
      ratedCount: active.ratedCount,
      totalCards: active.totalCards,
      startedAt: active.startedAt,
    }
  })
}

module.exports = { registerSessionHandlers }
