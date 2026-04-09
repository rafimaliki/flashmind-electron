import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

function App() {
  const [activeView, setActiveView] = useState('dashboard')

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />
      case 'profiles':
        return <Placeholder title="Profiles" description="Create and manage your knowledge profiles here." />
      case 'settings':
        return <Placeholder title="Settings" description="Configure FlashMind to your preferences." />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />
      <main className="flex-1 overflow-auto dot-grid">
        {renderView()}
      </main>
    </div>
  )
}

function Placeholder({ title, description }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center anim-item">
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>{description}</p>
        <p className="text-xs mt-2 font-mono" style={{ color: 'var(--text-muted)' }}>
          — coming in a future phase —
        </p>
      </div>
    </div>
  )
}

export default App
