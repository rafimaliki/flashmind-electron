const { ipcMain } = require('electron')
const fs = require('fs')
const { readData, writeData } = require('../store')
const { scanProfile } = require('../scanner')

// ── Spaced Repetition ─────────────────────────────────────────
//
// Simplified SM-2-inspired algorithm:
//   Hard   → reset interval to 1 day, lower ease factor
//   Medium → grow interval slowly (×1.3)
//   Easy   → grow by ease factor, raise ease factor slightly
//
// Intervals are capped at 90 days.

function applyRating(state, rating) {
  let { interval = 0, easeFactor = 2.5, totalReviews = 0 } = state || {}

  if (interval === 0) {
    // First review of this card
    if (rating === 'easy')   interval = 4
    else if (rating === 'medium') interval = 2
    else                     interval = 1
  } else {
    if (rating === 'hard') {
      interval = 1
      easeFactor = Math.max(1.3, easeFactor - 0.2)
    } else if (rating === 'medium') {
      interval = Math.max(1, Math.round(interval * 1.3))
    } else {
      interval = Math.max(1, Math.round(interval * easeFactor))
      easeFactor = Math.min(3.0, easeFactor + 0.1)
    }
  }

  interval = Math.min(interval, 90)

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + interval)
  nextReview.setHours(0, 0, 0, 0)

  return {
    interval,
    easeFactor,
    nextReview: nextReview.toISOString(),
    totalReviews: totalReviews + 1,
    lastRating: rating,
    lastReview: new Date().toISOString(),
  }
}

// Preview next interval without mutating state
function previewInterval(state, rating) {
  const result = applyRating(state, rating)
  return result.interval
}

// ── Session card selection ────────────────────────────────────

function selectSessionCards(profile, cardStates) {
  const allCards = scanProfile(profile)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const overdue = []
  const dueToday = []
  const newCards = []

  for (const card of allCards) {
    const state = cardStates[card.path]
    if (!state) {
      newCards.push({ ...card, state: null })
    } else {
      const next = new Date(state.nextReview)
      if (next <= now) {
        // Overdue = next review was before today
        const isOverdue = next < now
        if (isOverdue) overdue.push({ ...card, state })
        else dueToday.push({ ...card, state })
      }
    }
  }

  // Prioritize: overdue (oldest first) → due today → new
  overdue.sort((a, b) => new Date(a.state.nextReview) - new Date(b.state.nextReview))

  return [...overdue, ...dueToday, ...newCards].slice(0, profile.cardsPerSession)
}

// ── IPC handlers ──────────────────────────────────────────────

function registerCardHandlers() {
  ipcMain.handle('cards:get-session', (_, profileId) => {
    const data = readData()
    const profile = data.profiles.find(p => p.id === profileId)
    if (!profile) return { cards: [], totalInProfile: 0 }

    const cardStates = data.cards[profileId] || {}
    const selected = selectSessionCards(profile, cardStates)

    // Read file content for each selected card
    const cards = []
    for (const card of selected) {
      try {
        const content = fs.readFileSync(card.path, 'utf-8')
        cards.push({ ...card, content })
      } catch {
        // Skip unreadable files silently
      }
    }

    const allCards = scanProfile(profile)
    return {
      cards,
      totalInProfile: allCards.length,
    }
  })

  ipcMain.handle('cards:rate', (_, { profileId, cardPath, rating }) => {
    const data = readData()
    if (!data.cards[profileId]) data.cards[profileId] = {}

    const existing = data.cards[profileId][cardPath] || null
    const updated = applyRating(existing, rating)
    data.cards[profileId][cardPath] = updated
    writeData(data)

    return updated
  })

  // Returns intervals (days) for each rating option given the current card state.
  // Used by the UI to preview impact before rating.
  ipcMain.handle('cards:preview-intervals', (_, { profileId, cardPath }) => {
    const data = readData()
    const state = (data.cards[profileId] || {})[cardPath] || null
    return {
      hard:   previewInterval(state, 'hard'),
      medium: previewInterval(state, 'medium'),
      easy:   previewInterval(state, 'easy'),
    }
  })
}

module.exports = { registerCardHandlers }
