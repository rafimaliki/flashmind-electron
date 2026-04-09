import { BookOpen, CalendarCheck, AlertCircle, Flame, PlayCircle, FolderPlus, ChevronRight } from 'lucide-react'

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
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ── Stat Card ───────────────────────────────────────────────── */

const STATS = [
  {
    key: 'total',
    label: 'Total Cards',
    value: '0',
    icon: BookOpen,
    color: '#60a5fa',   // blue-400
    glow: 'rgba(96, 165, 250, 0.08)',
    border: 'rgba(96, 165, 250, 0.18)',
  },
  {
    key: 'due',
    label: 'Due Today',
    value: '0',
    icon: CalendarCheck,
    color: '#f59e0b',   // amber
    glow: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.18)',
  },
  {
    key: 'overdue',
    label: 'Overdue',
    value: '0',
    icon: AlertCircle,
    color: '#f87171',   // red-400
    glow: 'rgba(248, 113, 113, 0.08)',
    border: 'rgba(248, 113, 113, 0.18)',
  },
  {
    key: 'streak',
    label: 'Day Streak',
    value: '0',
    icon: Flame,
    color: '#fb923c',   // orange-400
    glow: 'rgba(251, 146, 60, 0.08)',
    border: 'rgba(251, 146, 60, 0.18)',
  },
]

function StatCard({ stat, index }) {
  const Icon = stat.icon
  return (
    <div
      className="anim-item rounded-xl p-5 flex flex-col gap-3 transition-all duration-200 cursor-default"
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid var(--border)`,
        animationDelay: `${0.05 + index * 0.05}s`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.border = `1px solid ${stat.border}`
        e.currentTarget.style.background = `color-mix(in srgb, var(--bg-elevated) 95%, ${stat.color} 5%)`
      }}
      onMouseLeave={e => {
        e.currentTarget.style.border = '1px solid var(--border)'
        e.currentTarget.style.background = 'var(--bg-elevated)'
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {stat.label}
        </span>
        <span
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${stat.color}18`, color: stat.color }}
        >
          <Icon size={13} />
        </span>
      </div>

      <span
        className="stat-number text-3xl font-medium leading-none"
        style={{ color: 'var(--text-primary)' }}
      >
        {stat.value}
      </span>
    </div>
  )
}

/* ── Action Button ───────────────────────────────────────────── */

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
      <span
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-150"
        style={{ background: accent ? 'rgba(245,158,11,0.15)' : 'var(--bg-overlay)' }}
      >
        <Icon size={18} style={{ color: accent ? 'var(--accent)' : 'var(--text-secondary)' }} />
      </span>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
          {title}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
          {subtitle}
        </p>
      </div>

      <ChevronRight
        size={14}
        className="flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity"
        style={{ color: 'var(--text-secondary)' }}
      />
    </button>
  )
}

/* ── Getting Started Step ────────────────────────────────────── */

function Step({ number, text, done }) {
  return (
    <div className="flex items-start gap-3">
      <span
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-px text-[10px] font-mono font-medium"
        style={{
          background: done ? 'var(--accent)' : 'var(--bg-overlay)',
          border: done ? '1px solid var(--accent)' : '1px solid var(--border)',
          color: done ? '#0a0a0d' : 'var(--text-muted)',
        }}
      >
        {number}
      </span>
      <p className="text-sm" style={{ color: done ? 'var(--text-secondary)' : 'var(--text-secondary)' }}>
        {text}
      </p>
    </div>
  )
}

/* ── Dashboard ───────────────────────────────────────────────── */

export default function Dashboard() {
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
          Your knowledge base is ready when you are.
        </p>
      </div>

      {/* ── Stat Grid ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-8">
        {STATS.map((stat, i) => (
          <StatCard key={stat.key} stat={stat} index={i} />
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
              subtitle="Pick a profile and begin reviewing cards"
              accent
            />
            <ActionButton
              icon={FolderPlus}
              title="Create a Profile"
              subtitle="Point FlashMind to a folder of Markdown files"
            />
          </div>
        </div>

        {/* Getting Started — 2 cols */}
        <div className="col-span-2 anim-item" style={{ animationDelay: '0.30s' }}>
          <SectionLabel>Getting Started</SectionLabel>
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
          >
            <Step number="1" text="Create a profile" />
            <div style={{ height: 1, background: 'var(--border-soft)' }} />
            <Step number="2" text="Add folders with .md files" />
            <div style={{ height: 1, background: 'var(--border-soft)' }} />
            <Step number="3" text="Start your first session" />
          </div>
        </div>

      </div>

      {/* ── Status Bar ── */}
      <div className="mt-8 anim-item" style={{ animationDelay: '0.35s' }}>
        <div
          className="flex items-center gap-3 rounded-xl px-5 py-3.5"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#4ade80' }}
          />
          <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
            No active session — create a profile to begin
          </p>
        </div>
      </div>

    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <p
      className="text-[10px] uppercase tracking-widest font-semibold font-mono mb-3"
      style={{ color: 'var(--text-muted)' }}
    >
      {children}
    </p>
  )
}
