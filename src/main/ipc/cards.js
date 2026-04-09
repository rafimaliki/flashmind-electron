const { ipcMain } = require('electron')
const fs = require('fs')
const { readData, writeData } = require('../store')
const { scanProfile } = require('../scanner')

// ── Weight-based frequency system ────────────────────────────
//
// Each card carries a weight (1–10, default 5).
// Session cards are drawn by weighted random sampling — no date
// restrictions, so users can study again immediately.
//
//   Hard   → weight +2  (card surfaces more often)
//   Medium → no change  (frequency stays the same)
//   Easy   → weight -2  (card surfaces less often)

const MIN_WEIGHT = 1
const MAX_WEIGHT = 10
const DEFAULT_WEIGHT = 5

function applyRating(state, rating) {
  const weight = state?.weight ?? DEFAULT_WEIGHT
  const totalReviews = (state?.totalReviews ?? 0) + 1

  let newWeight
  if (rating === 'hard') {
    newWeight = Math.min(MAX_WEIGHT, weight + 2)
  } else if (rating === 'medium') {
    newWeight = weight
  } else {
    newWeight = Math.max(MIN_WEIGHT, weight - 2)
  }

  return {
    weight: newWeight,
    totalReviews,
    lastRating: rating,
    lastReview: new Date().toISOString(),
  }
}

// Weighted random sampling without replacement.
// Higher weight → more likely to be picked each draw.
function weightedSample(pool, n) {
  const items = pool.slice()
  const result = []

  for (let i = 0; i < Math.min(n, items.length); i++) {
    const total = items.reduce((s, c) => s + c.weight, 0)
    let rand = Math.random() * total
    for (let j = 0; j < items.length; j++) {
      rand -= items[j].weight
      if (rand <= 0) {
        result.push(items[j])
        items.splice(j, 1)
        break
      }
    }
  }

  // Shuffle result so high-weight cards don't always front-load the session
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

// ── IPC handlers ──────────────────────────────────────────────

function registerCardHandlers() {
  ipcMain.handle('cards:get-session', (_, profileId) => {
    const data = readData()
    const profile = data.profiles.find(p => p.id === profileId)
    if (!profile) return { cards: [], totalInProfile: 0 }

    const allCards = scanProfile(profile)
    const cardStates = data.cards[profileId] || {}

    // Attach weights for sampling
    const pool = allCards.map(card => ({
      ...card,
      state: cardStates[card.path] ?? null,
      weight: cardStates[card.path]?.weight ?? DEFAULT_WEIGHT,
    }))

    const selected = weightedSample(pool, profile.cardsPerSession)

    // Read file contents
    const cards = []
    for (const card of selected) {
      try {
        const content = fs.readFileSync(card.path, 'utf-8')
        cards.push({ ...card, content })
      } catch {
        // Skip unreadable files silently
      }
    }

    return { cards, totalInProfile: allCards.length }
  })

  ipcMain.handle('cards:rate', (_, { profileId, cardPath, rating }) => {
    const data = readData()
    if (!data.cards[profileId]) data.cards[profileId] = {}

    const existing = data.cards[profileId][cardPath] ?? null
    const updated = applyRating(existing, rating)
    data.cards[profileId][cardPath] = updated
    writeData(data)

    return updated
  })
}

module.exports = { registerCardHandlers }
