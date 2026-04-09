import { useState, useEffect } from 'react'
import {
  BookOpen, TrendingUp, CheckCircle, Flame,
  PlayCircle, FolderPlus, ChevronRight, Loader2,
} from 'lucide-react'

const api = window.electronAPI

/* ── Helpers ─────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Still up late?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Good night'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

/* ── Stat card ───────────────────────────────────────────────── */

function StatCard({ label, value, icon: Icon, color, bg, loading, index }) {
  return (
    <div
      className="anim-item rounded-xl p-5 flex flex-col gap-3 cursor-default"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        animationDelay: `${0.05 + index * 0.05}s`,
        transition: 'border-color 0.15s, background 0.15s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = color + '40'
        e.currentTarget.style.background = `color-mix(in srgb, var(--bg-elevated) 94%, ${color} 6%)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border)'
        e.currentTarget.style.background = 'var(--bg-elevated)'
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {label}
        </span>
        <span className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: bg, color }}>
          <Icon size={13} />
        </span>
      </div>
      {loading ? (
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
        </div>
      ) : (
        <span className="stat-number text-3xl font-medium leading-none"
              style={{ color: 'var(--text-primary)' }}>
          {value}
        </span>
      )}
    </div>
  )
}

/* ── Action button ───────────────────────────────────────────── */

function ActionButton({ icon: Icon, title, subtitle, accent, onClick }) {
  const baseStyle = {
    background: accent ? 'var(--accent-dim)' : 'var(--bg-elevated)',
    border: accent ? '1px solid rgba(245,158,11,0.25)' : '1px solid var(--border)',
    color: accent ? 'var(--accent)' : 'var(--text-secondary)',
  }
  const hoverStyle = {
    background: accent ? 'rgba(245,158,11,0.16)' : 'var(--bg-overlay)',
    border: accent ? '1px solid rgba(245,158,11,0.40)' : '1px solid #333348',
  }

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-4 w-full rounded-xl p-4 text-left transition-all duration-150"
      style={baseStyle}
      onMouseEnter={e => Object.assign(e.currentTarget.style, hoverStyle)}
      onMouseLeave={e => Object.assign(e.currentTarget.style, baseStyle)}
    >
      <span className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: accent ? 'rgba(245,158,11,0.15)' : 'var(--bg-overlay)' }}>
        <Icon size={18} style={{ color: accent ? 'var(--accent)' : 'var(--text-secondary)' }} />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{title}</p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
      </div>
      <ChevronRight size={14} className="flex-shrink-0 opacity-30 group-hover:opacity-60 transition-opacity"
                   style={{ color: 'var(--text-secondary)' }} />
    </button>
  )
}

/* ── Step indicator ──────────────────────────────────────────── */

function Step({ number, text, done }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-px text-[10px] font-mono font-medium"
            style={{
              background: done ? 'var(--accent)' : 'var(--bg-overlay)',
              border: done ? '1px solid var(--accent)' : '1px solid var(--border)',
              color: done ? '#0a0a0d' : 'var(--text-muted)',
            }}>
        {done ? '✓' : number}
      </span>
      <p className="text-sm" style={{ color: done ? 'var(--text-secondary)' : 'var(--text-secondary)' }}>
        {text}
      </p>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-widest font-semibold font-mono mb-3"
       style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  )
}

/* ── Dashboard ───────────────────────────────────────────────── */

const DEFAULT_STATS = {
  totalCards: 0, struggling: 0, mastered: 0,
  streak: 0, studiedToday: 0, totalProfiles: 0,
}

export default function Dashboard({ onNavigate }) {
  const [stats, setStats] = useState(DEFAULT_STATS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    setLoading(true)
    try {
      const data = await api.dashboard.getStats()
      setStats(data)
    } catch {
      // Silently keep defaults if IPC fails (e.g. in browser dev mode)
    } finally {
      setLoading(false)
    }
  }

  const hasProfiles  = stats.totalProfiles > 0
  const hasFolders   = stats.totalCards > 0
  const hasStudied   = stats.studiedToday > 0

  const STAT_CARDS = [
    {
      label: 'Total Cards',
      value: stats.totalCards,
      icon: BookOpen,
      color: '#60a5fa',
      bg: 'rgba(96,165,250,0.12)',
    },
    {
      label: 'Struggling',
      value: stats.struggling,
      icon: TrendingUp,
      color: '#f87171',
      bg: 'rgba(248,113,113,0.12)',
    },
    {
      label: 'Mastered',
      value: stats.mastered,
      icon: CheckCircle,
      color: '#4ade80',
      bg: 'rgba(74,222,128,0.12)',
    },
    {
      label: 'Day Streak',
      value: stats.streak,
      icon: Flame,
      color: '#fb923c',
      bg: 'rgba(251,146,60,0.12)',
    },
  ]

  return (
    <div className="min-h-full p-8 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="mb-8 anim-item" style={{ animationDelay: '0s' }}>
        <p className="text-xs font-mono mb-2" style={{ color: 'var(--text-muted)' }}>
          {formatDate()}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>
          {getGreeting()}.
        </h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {!hasProfiles
            ? 'Create a profile to start building your knowledge base.'
            : hasStudied
              ? `You've reviewed cards today${stats.streak > 1 ? ` — ${stats.streak} day streak!` : '.'}`
              : 'Ready when you are.'}
        </p>
      </div>

      {/* ── Stat grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
        {STAT_CARDS.map((s, i) => (
          <StatCard key={s.label} {...s} loading={loading} index={i} />
        ))}
      </div>

      {/* ── Two-column lower section ── */}
      <div className="grid grid-cols-5 gap-4">

        {/* Quick Actions — 3 cols */}
        <div className="col-span-3 anim-item" style={{ animationDelay: '0.25s' }}>
          <SectionLabel>Quick Actions</SectionLabel>
          <div className="space-y-2">
            <ActionButton
              icon={PlayCircle}
              title="Start a Session"
              subtitle={hasProfiles ? 'Pick a profile and begin reviewing' : 'Create a profile first'}
              accent={hasProfiles}
              onClick={() => onNavigate?.('profiles')}
            />
            <ActionButton
              icon={FolderPlus}
              title="Manage Profiles"
              subtitle="Add folders or create a new profile"
              onClick={() => onNavigate?.('profiles')}
            />
          </div>
        </div>

        {/* Getting Started — 2 cols */}
        <div className="col-span-2 anim-item" style={{ animationDelay: '0.30s' }}>
          <SectionLabel>Getting Started</SectionLabel>
          <div className="rounded-xl p-5 space-y-3"
               style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
            <Step number="1" text="Create a profile" done={hasProfiles} />
            <div style={{ height: 1, background: 'var(--border-soft)' }} />
            <Step number="2" text="Add folders with .md files" done={hasFolders} />
            <div style={{ height: 1, background: 'var(--border-soft)' }} />
            <Step number="3" text="Complete your first session" done={hasStudied} />
          </div>
        </div>

      </div>

      {/* ── Status bar ── */}
      <div className="mt-4 anim-item" style={{ animationDelay: '0.35s' }}>
        <div className="flex items-center gap-3 rounded-xl px-5 py-3.5"
             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: hasStudied ? '#4ade80' : 'var(--text-muted)' }} />
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            {!hasProfiles
              ? 'No profiles — add one to get started'
              : hasStudied
                ? `${stats.studiedToday} profile${stats.studiedToday > 1 ? 's' : ''} reviewed today`
                : 'No sessions today yet'}
          </p>
          {stats.streak > 0 && (
            <span className="ml-auto text-xs font-mono flex items-center gap-1.5"
                  style={{ color: '#fb923c' }}>
              <Flame size={11} />
              {stats.streak} day{stats.streak > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

    </div>
  )
}
