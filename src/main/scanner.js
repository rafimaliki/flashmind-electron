const fs = require('fs')
const path = require('path')

// Recursively find all .md files in a folder (up to MAX_DEPTH levels deep).
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

// Scan all folders in a profile and deduplicate results.
function scanProfile(profile) {
  const cards = []
  for (const folder of profile.folders) {
    cards.push(...scanFolder(folder))
  }
  const seen = new Set()
  return cards.filter(c => {
    if (seen.has(c.path)) return false
    seen.add(c.path)
    return true
  })
}

module.exports = { scanFolder, scanProfile }
