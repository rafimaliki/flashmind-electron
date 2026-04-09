const { app } = require('electron')
const fs = require('fs')
const path = require('path')

const DATA_FILE = path.join(app.getPath('userData'), 'data.json')

const DEFAULT_DATA = {
  profiles: [],
  cards: {},     // card review state — populated in a later phase
  sessions: {},  // session state — populated in a later phase
}

function readData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeData(DEFAULT_DATA)
      return structuredClone(DEFAULT_DATA)
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    // Merge in any keys added in newer versions
    return { ...DEFAULT_DATA, ...parsed }
  } catch {
    return structuredClone(DEFAULT_DATA)
  }
}

function writeData(data) {
  const dir = path.dirname(DATA_FILE)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

module.exports = { readData, writeData }
