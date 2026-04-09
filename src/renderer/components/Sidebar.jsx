import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profiles',  label: 'Profiles',  icon: FolderKanban },
  { id: 'settings',  label: 'Settings',  icon: Settings },
]

function Logo() {
  return (
    <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
      {/* Icon mark */}
      <div
        className="relative flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0"
        style={{ background: 'var(--accent-dim)', border: '1px solid rgba(245,158,11,0.25)' }}
      >
        <Zap size={15} style={{ color: 'var(--accent)' }} fill="currentColor" />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-semibold leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
          FlashMind
        </p>
        <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
          Knowledge System
        </p>
      </div>
    </div>
  )
}

function NavItem({ item, isActive, onClick }) {
  const Icon = item.icon

  return (
    <button
      onClick={() => onClick(item.id)}
      className="relative w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group"
      style={{
        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        background: isActive ? 'var(--accent-dim)' : 'transparent',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.color = 'var(--text-primary)'
          e.currentTarget.style.background = 'var(--bg-overlay)'
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.background = 'transparent'
        }
      }}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full"
          style={{ background: 'var(--accent)' }}
        />
      )}
      <Icon size={16} />
      <span>{item.label}</span>
    </button>
  )
}

export default function Sidebar({ activeView, onNavigate }) {
  const [version, setVersion] = useState('1.0.0')

  useEffect(() => {
    if (window.electronAPI?.getAppVersion) {
      window.electronAPI.getAppVersion().then(v => setVersion(v))
    }
  }, [])

  return (
    <aside
      className="w-56 flex flex-col flex-shrink-0 h-screen"
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
      }}
    >
      <Logo />

      {/* Section label */}
      <div className="px-5 pt-5 pb-1.5">
        <span
          className="text-[10px] font-semibold uppercase tracking-widest font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          Navigate
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.id}
            item={item}
            isActive={activeView === item.id}
            onClick={onNavigate}
          />
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-3"
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
          v{version}
        </span>
      </div>
    </aside>
  )
}
