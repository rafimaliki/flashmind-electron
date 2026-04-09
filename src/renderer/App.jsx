import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Profiles from './components/Profiles'
import Session from './components/Session'

// Views that manage their own layout internally (no outer dot-grid or overflow-auto)
const CUSTOM_LAYOUT_VIEWS = ['profiles', 'session']

function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [sessionProfile, setSessionProfile] = useState(null)

  function startSession(profile) {
    setSessionProfile(profile)
    setActiveView('session')
  }

  function endSession() {
    setSessionProfile(null)
    setActiveView('dashboard')
  }

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveView} />
      case 'profiles':
        return <Profiles onStartSession={startSession} />
      case 'session':
        return <Session profile={sessionProfile} onEnd={endSession} />
      case 'settings':
        return <Placeholder title="Settings" description="Configure FlashMind to your preferences." />
      default:
        return <Dashboard onNavigate={setActiveView} />
    }
  }

  const isCustomLayout = CUSTOM_LAYOUT_VIEWS.includes(activeView)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* Hide sidebar during session for a focused review experience */}
      {activeView !== 'session' && (
        <Sidebar activeView={activeView} onNavigate={setActiveView} />
      )}
      <main className={`flex-1 ${isCustomLayout ? 'overflow-hidden' : 'overflow-auto dot-grid'}`}>
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
