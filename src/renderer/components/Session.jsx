import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft, CheckCircle, BookOpen,
  Loader2, RotateCcw, TrendingUp, Minus, TrendingDown,
} from 'lucide-react'
import MarkdownCard from './MarkdownCard'

const api = window.electronAPI

// ── Rating config ─────────────────────────────────────────────

const RATING_CONFIG = {
  hard: {
    label: 'Hard',     shortcut: '1', sublabel: 'More often',
    Icon: TrendingUp,  color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',  border: 'rgba(248,113,113,0.25)',
    hoverBg: 'rgba(248,113,113,0.18)', hoverBorder: 'rgba(248,113,113,0.4)',
  },
  medium: {
    label: 'Medium',   shortcut: '2', sublabel: 'Same',
    Icon: Minus,       color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.25)',
    hoverBg: 'rgba(245,158,11,0.18)',  hoverBorder: 'rgba(245,158,11,0.4)',
  },
  easy: {
    label: 'Easy',     shortcut: '3', sublabel: 'Less often',
    Icon: TrendingDown, color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',   border: 'rgba(74,222,128,0.2)',
    hoverBg: 'rgba(74,222,128,0.18)',  hoverBorder: 'rgba(74,222,128,0.35)',
  },
}

// ── Rating button ─────────────────────────────────────────────

function RatingButton({ rating, onRate, disabled }) {
  const cfg = RATING_CONFIG[rating]
  const { Icon } = cfg
  const base = { color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}`, opacity: disabled ? 0.5 : 1 }

  return (
    <button
      onClick={() => !disabled && onRate(rating)}
      disabled={disabled}
      className="flex-1 flex flex-col items-center gap-1.5 py-3 px-3 rounded-xl transition-all duration-100"
      style={base}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = cfg.hoverBg; e.currentTarget.style.borderColor = cfg.hoverBorder } }}
      onMouseLeave={e => { e.currentTarget.style.background = cfg.bg; e.currentTarget.style.borderColor = cfg.border }}
    >
      <Icon size={16} />
      <span className="text-sm font-semibold leading-none">{cfg.label}</span>
      <span className="text-[10px] opacity-60 leading-none">{cfg.sublabel}</span>
      <span className="text-[9px] opacity-30 font-mono">[{cfg.shortcut}]</span>
    </button>
  )
}

// ── Card review screen ────────────────────────────────────────

function ReviewScreen({ card, globalCurrent, globalTotal, onRate, onExit }) {
  const [submitting, setSubmitting] = useState(false)
  const progress = (globalCurrent - 1) / globalTotal

  const handleRate = useCallback(async (r) => {
    if (submitting) return
    setSubmitting(true)
    await onRate(r)
    setSubmitting(false)
  }, [submitting, onRate])

  useEffect(() => {
    const handler = (e) => {
      if (e.target.tagName === 'INPUT') return
      if (e.key === '1') handleRate('hard')
      else if (e.key === '2') handleRate('medium')
      else if (e.key === '3') handleRate('easy')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRate])

  const breadcrumb = card.path.replace(/\\/g, '/').split('/').slice(-2).join(' / ')

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
           style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} />
          Save & exit
        </button>

        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {globalCurrent}
          <span style={{ opacity: 0.4 }}> / </span>
          {globalTotal}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-0.5 flex-shrink-0" style={{ background: 'var(--bg-overlay)' }}>
        <div className="h-full transition-all duration-500"
             style={{ width: `${progress * 100}%`, background: 'var(--accent)' }} />
      </div>

      {/* Card content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          <p className="text-[11px] font-mono mb-5" style={{ color: 'var(--text-muted)' }}>
            {breadcrumb}
          </p>
          <MarkdownCard content={card.content} />
        </div>
      </div>

      {/* Rating footer */}
      <div className="flex-shrink-0 px-6 py-4"
           style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
        <p className="text-xs text-center mb-3" style={{ color: 'var(--text-muted)' }}>
          How well did you know this?
        </p>
        <div className="flex gap-3 max-w-sm mx-auto">
          {['hard', 'medium', 'easy'].map(r => (
            <RatingButton key={r} rating={r} onRate={handleRate} disabled={submitting} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Completion screen ─────────────────────────────────────────

function CompletionScreen({ ratings, total, profileName, onEnd, onRestart }) {
  const counts = { easy: 0, medium: 0, hard: 0 }
  for (const { rating } of ratings) counts[rating]++

  return (
    <div className="h-screen flex items-center justify-center dot-grid" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center max-w-sm w-full px-6 anim-item">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style={{ background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)' }}>
          <CheckCircle size={26} style={{ color: '#4ade80' }} />
        </div>
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Session complete</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{profileName}</p>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {[
            { key: 'hard',   label: 'Hard',   Icon: TrendingUp,   color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
            { key: 'medium', label: 'Medium', Icon: Minus,        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
            { key: 'easy',   label: 'Easy',   Icon: TrendingDown, color: '#4ade80', bg: 'rgba(74,222,128,0.08)'  },
          ].map(({ key, label, Icon, color, bg }) => (
            <div key={key} className="rounded-xl py-3 px-2"
                 style={{ background: bg, border: `1px solid ${color}22` }}>
              <Icon size={14} style={{ color, margin: '0 auto 4px' }} />
              <p className="stat-number text-2xl font-medium" style={{ color }}>{counts[key]}</p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        <p className="text-xs mb-6 font-mono" style={{ color: 'var(--text-muted)' }}>
          {total} card{total !== 1 ? 's' : ''} reviewed
        </p>

        <div className="flex gap-3">
          <button onClick={onEnd}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}>
            Dashboard
          </button>
          <button onClick={onRestart}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(245,158,11,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}>
            <RotateCcw size={14} />
            Study again
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Empty / Loading states ────────────────────────────────────

function EmptyState({ profileName, onEnd }) {
  return (
    <div className="h-screen flex items-center justify-center dot-grid" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center max-w-sm px-6 anim-item">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <BookOpen size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No cards found</h2>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{profileName}</p>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          Add folders with Markdown files to this profile to start reviewing.
        </p>
        <button onClick={onEnd}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}>
          Back to dashboard
        </button>
      </div>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)' }}>
      <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
        <Loader2 size={18} className="animate-spin" />
        <span className="text-sm font-mono">Loading session…</span>
      </div>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────

export default function Session({ profile, isResume, onEnd }) {
  const [phase, setPhase]               = useState('loading')
  const [cards, setCards]               = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ratings, setRatings]           = useState([])

  // Session-level metadata — stable once loaded
  const [meta, setMeta] = useState({ initialRated: 0, total: 0, startedAt: null })

  useEffect(() => {
    if (isResume) {
      resumeSession()
    } else {
      loadFreshSession()
    }
  }, [])

  // ── Loaders ──────────────────────────────────────────────────

  async function loadFreshSession() {
    setPhase('loading')
    const result = await api.cards.getSession(profile.id)
    if (!result.cards.length) { setPhase('empty'); return }

    const startedAt = new Date().toISOString()
    const sessionMeta = { initialRated: 0, total: result.cards.length, startedAt }

    setCards(result.cards)
    setCurrentIndex(0)
    setRatings([])
    setMeta(sessionMeta)

    // Persist initial session state so exit on card 1 is still resumable
    api.sessions.saveProgress({
      profileId: profile.id,
      remainingPaths: result.cards.map(c => c.path),
      ratedCount: 0,
      totalCards: result.cards.length,
      startedAt,
    }).catch(() => {})

    setPhase('reviewing')
  }

  async function resumeSession() {
    setPhase('loading')
    const result = await api.sessions.resume(profile.id)

    if (!result || !result.cards.length) {
      // No valid files remaining — start fresh instead
      await loadFreshSession()
      return
    }

    setCards(result.cards)
    setCurrentIndex(0)
    setRatings([])
    setMeta({ initialRated: result.ratedCount, total: result.totalCards, startedAt: result.startedAt })
    setPhase('reviewing')
  }

  // ── Rating handler ────────────────────────────────────────────

  async function handleRate(rating) {
    const card = cards[currentIndex]
    await api.cards.rate(profile.id, card.path, rating)
    const newRatings = [...ratings, { cardPath: card.path, rating }]
    setRatings(newRatings)

    const totalRatedSoFar = meta.initialRated + newRatings.length

    if (currentIndex + 1 >= cards.length) {
      // All cards in this batch done → complete
      await api.sessions.clearActive(profile.id)
      api.sessions.record(profile.id, totalRatedSoFar).catch(() => {})
      setPhase('complete')
    } else {
      const nextIndex = currentIndex + 1
      // Persist remaining so closing the app now is safe
      api.sessions.saveProgress({
        profileId: profile.id,
        remainingPaths: cards.slice(nextIndex).map(c => c.path),
        ratedCount: totalRatedSoFar,
        totalCards: meta.total,
        startedAt: meta.startedAt,
      }).catch(() => {})
      setCurrentIndex(nextIndex)
    }
  }

  // ── Render ────────────────────────────────────────────────────

  if (phase === 'loading')  return <LoadingState />
  if (phase === 'empty')    return <EmptyState profileName={profile.name} onEnd={onEnd} />
  if (phase === 'complete') {
    return (
      <CompletionScreen
        ratings={ratings}
        total={meta.initialRated + ratings.length}
        profileName={profile.name}
        onEnd={onEnd}
        onRestart={loadFreshSession}
      />
    )
  }

  return (
    <ReviewScreen
      card={cards[currentIndex]}
      globalCurrent={meta.initialRated + currentIndex + 1}
      globalTotal={meta.total}
      onRate={handleRate}
      onExit={onEnd}
    />
  )
}
