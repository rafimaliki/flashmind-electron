const { ipcMain } = require('electron')
const { readData, writeData } = require('../store')
const { scanProfile } = require('../scanner')

// ── Date helpers ──────────────────────────────────────────────

function dateStr(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().split('T')[0] // YYYY-MM-DD
}

// ── Streak logic ──────────────────────────────────────────────

// Returns the validated current streak (resets if a day was missed).
function validatedStreak(streak) {
  if (!streak?.lastStudyDate) return 0
  const today = dateStr(0)
  const yesterday = dateStr(-1)
  // If last study was before yesterday, streak is broken
  if (streak.lastStudyDate !== today && streak.lastStudyDate !== yesterday) return 0
  return streak.current
}

// Increments the streak for today (idempotent — safe to call multiple times).
function incrementStreak(data) {
  if (!data.streak) data.streak = { current: 0, lastStudyDate: null, longest: 0 }

  const today = dateStr(0)
  const yesterday = dateStr(-1)
  const last = data.streak.lastStudyDate

  if (last === today) return // already counted today

  data.streak.current = (last === yesterday) ? data.streak.current + 1 : 1
  data.streak.lastStudyDate = today
  data.streak.longest = Math.max(data.streak.current, data.streak.longest || 0)
}

// ── IPC handlers ──────────────────────────────────────────────

function registerDashboardHandlers() {
  ipcMain.handle('dashboard:get-stats', () => {
    const data = readData()

    let totalCards  = 0
    let struggling  = 0  // weight >= 7
    let mastered    = 0  // weight <= 2

    for (const profile of data.profiles) {
      const cards = scanProfile(profile)
      totalCards += cards.length

      const cardStates = data.cards[profile.id] || {}
      for (const card of cards) {
        const state = cardStates[card.path]
        if (!state) continue
        if (state.weight >= 7) struggling++
        else if (state.weight <= 2) mastered++
      }
    }

    const streak = validatedStreak(data.streak)
    const today  = dateStr(0)
    const todaySessions = data.sessions?.[today] ?? {}
    const studiedToday  = Object.keys(todaySessions).length

    return {
      totalCards,
      struggling,
      mastered,
      streak,
      studiedToday,
      totalProfiles: data.profiles.length,
    }
  })

  ipcMain.handle('sessions:record', (_, { profileId, cardsReviewed }) => {
    const data = readData()
    const today = dateStr(0)

    if (!data.sessions)        data.sessions = {}
    if (!data.sessions[today]) data.sessions[today] = {}

    data.sessions[today][profileId] = {
      cardsReviewed,
      completedAt: new Date().toISOString(),
    }

    incrementStreak(data)
    writeData(data)
    return { success: true }
  })
}

module.exports = { registerDashboardHandlers }
