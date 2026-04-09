# FlashMind

A markdown-based recall system that turns your local `.md` files into a spaced-repetition review tool — built as a native desktop app.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Electron 33 |
| UI framework | React 18 + Vite 6 |
| Styling | Tailwind CSS 3 |
| Icons | Lucide React |
| Packaging | electron-builder |

---

## Features (planned across phases)

- **Profiles** — group folders of Markdown files into named knowledge bases
- **Card system** — each `.md` file becomes a reviewable card with full Markdown rendering and syntax-highlighted code blocks
- **Spaced repetition** — Easy / Medium / Hard rating drives how often cards resurface
- **Sessions** — configurable card count, continuable across the day
- **Dashboard** — streak tracking, due/overdue counters, session status
- **Dark theme** — readable and focused by default

---

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Install & run in development

```bash
git clone https://github.com/your-username/flashmind-electron.git
cd flashmind-electron
npm install
npm run dev
```

This starts the Vite dev server and launches the Electron window automatically.

> **Note:** Outfit and JetBrains Mono fonts load from Google Fonts — an internet connection is needed during development.

---

## Build (generate installer)

```bash
npm run build
```

Output lands in `release/`. On Windows this produces an NSIS installer (`.exe`).

### Platform-specific builds

```bash
npx electron-builder --win    # Windows
npx electron-builder --mac    # macOS
npx electron-builder --linux  # Linux
```

### App icons (required for production)

Place the following in `assets/` before building:

| File | Platform | Size |
|---|---|---|
| `icon.ico` | Windows | 256 × 256 |
| `icon.icns` | macOS | 512 × 512 |
| `icon.png` | Linux | 512 × 512 |

---

## Folder Structure

```
flashmind-electron/
├── assets/               # App icons (ico / icns / png)
├── src/
│   ├── main/             # Electron main process (Node.js / CommonJS)
│   │   ├── index.js      # Window creation, IPC handlers
│   │   └── preload.js    # Secure contextBridge to renderer
│   ├── renderer/         # React app (Vite-bundled)
│   │   ├── components/   # UI components
│   │   ├── App.jsx       # Root component + view routing
│   │   ├── main.jsx      # React entry point
│   │   └── index.css     # Tailwind + CSS custom properties
│   └── shared/           # Metadata shared across processes
│       └── version.js    # App name / description constants
├── index.html            # Vite HTML entry point
├── vite.config.js        # Vite configuration (renderer)
├── tailwind.config.js    # Tailwind theme extensions
├── postcss.config.js
├── electron-builder.yml  # Installer / packaging configuration
└── package.json          # Version, scripts, dependencies
```

---

## Versioning

The canonical version lives in `package.json → "version"`.
To release a new version, bump that field and run `npm run build`.
The version number is read at runtime via `app.getVersion()` and shown in the sidebar.

---

## License

MIT
