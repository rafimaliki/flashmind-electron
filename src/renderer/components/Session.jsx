import { useState, useEffect, useCallback } from 'react'
import {
  X, ChevronLeft, CheckCircle, BookOpen,
  Loader2, Frown, RotateCcw,
} from 'lucide-react'
import MarkdownCard from './MarkdownCard'

const api = window.electronAPI

// ── Helpers ───────────────────────────────────────────────────

function pluralDays(n) {
  return n === 1 ? '1 day' : `${n} days`
}

// ── Rating button ─────────────────────────────────────────────

const RATING_CONFIG = {
  hard: {
    label: 'Hard',
    shortcut: '1',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    border: 'rgba(248,113,113,0.25)',
    hoverBg: 'rgba(248,113,113,0.18)',
    hoverBorder: 'rgba(248,113,113,0.4)',
  },
  medium: {
    label: 'Medium',
    shortcut: '2',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.25)',
    hoverBg: 'rgba(245,158,11,0.18)',
    hoverBorder: 'rgba(245,158,11,0.4)',
  },
  easy: {
    label: 'Easy',
    shortcut: '3',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.2)',
    hoverBg: 'rgba(74,222,128,0.18)',
    hoverBorder: 'rgba(74,222,128,0.35)',
  },
}

function RatingButton({ rating, interval, onRate, disabled }) {
  const cfg = RATING_CONFIG[rating]
  const style = {
    color: cfg.color,
    background: cfg.bg,
    border: `1px solid ${cfg.border}`,
  }
  return (
    <button
      onClick={() => !disabled && onRate(rating)}
      disabled={disabled}
      className="flex-1 flex flex-col items-center gap-1 py-3 px-4 rounded-xl transition-all duration-100"
      style={style}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.background = cfg.hoverBg
          e.currentTarget.style.borderColor = cfg.hoverBorder
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = cfg.bg
        e.currentTarget.style.borderColor = cfg.border
      }}
    >
      <span className="text-sm font-semibold">{cfg.label}</span>
      <span className="text-[10px] font-mono opacity-70">
        {interval != null ? `+${pluralDays(interval)}` : '…'}
      </span>
      <span className="text-[9px] opacity-40 font-mono">[{cfg.shortcut}]</span>
    </button>
  )
}

// ── Card review screen ────────────────────────────────────────

function ReviewScreen({ card, current, total, onRate, onExit }) {
  const [intervals, setIntervals] = useState(null)
  const [rating, setRating] = useState(null) // currently being submitted

  const progress = (current - 1) / total

  useEffect(() => {
    setIntervals(null)
    setRating(null)
    api.cards.previewIntervals(card.profileId ?? '', card.path).then(setIntervals)
  }, [card.path])

  const handleRate = useCallback(async (r) => {
    if (rating) return
    setRating(r)
    await onRate(r)
    setRating(null)
  }, [rating, onRate])

  // Keyboard shortcuts: 1=hard, 2=medium, 3=easy
  useEffect(() => {
    const handler = (e) => {
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

      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-xs font-medium transition-colors"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
        >
          <ChevronLeft size={14} />
          End session
        </button>

        <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          {current} <span style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/</span> {total}
        </span>
      </div>

      {/* ── Progress bar ── */}
      <div className="h-0.5 flex-shrink-0" style={{ background: 'var(--bg-overlay)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress * 100}%`, background: 'var(--accent)' }}
        />
      </div>

      {/* ── Card content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-8">
          {/* File breadcrumb */}
          <p className="text-[11px] font-mono mb-5" style={{ color: 'var(--text-muted)' }}>
            {breadcrumb}
          </p>
          <MarkdownCard content={card.content} />
        </div>
      </div>

      {/* ── Rating footer ── */}
      <div
        className="flex-shrink-0 px-6 py-4"
        style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
      >
        <p className="text-xs text-center mb-3 font-medium" style={{ color: 'var(--text-muted)' }}>
          How well did you know this?
        </p>
        <div className="flex gap-3 max-w-md mx-auto">
          {['hard', 'medium', 'easy'].map(r => (
            <RatingButton
              key={r}
              rating={r}
              interval={intervals?.[r]}
              onRate={handleRate}
              disabled={!!rating}
            />
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

        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          Session complete
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {profileName}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { key: 'easy',   label: 'Easy',   color: '#4ade80', bg: 'rgba(74,222,128,0.08)'  },
            { key: 'medium', label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)'  },
            { key: 'hard',   label: 'Hard',   color: '#f87171', bg: 'rgba(248,113,113,0.08)' },
          ].map(({ key, label, color, bg }) => (
            <div key={key} className="rounded-xl py-3"
                 style={{ background: bg, border: `1px solid ${color}22` }}>
              <p className="stat-number text-2xl font-medium" style={{ color }}>
                {counts[key]}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <p className="text-xs mb-6 font-mono" style={{ color: 'var(--text-muted)' }}>
          {total} card{total !== 1 ? 's' : ''} reviewed
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onEnd}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            Dashboard
          </button>
          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid rgba(245,158,11,0.25)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.18)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-dim)' }}
          >
            <RotateCcw size={14} />
            Review again
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Empty state (nothing due) ─────────────────────────────────

function EmptyState({ profileName, onEnd }) {
  return (
    <div className="h-screen flex items-center justify-center dot-grid" style={{ background: 'var(--bg-base)' }}>
      <div className="text-center max-w-sm px-6 anim-item">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
             style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
          <BookOpen size={24} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 className="text-lg font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>
          All caught up
        </h2>
        <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>
          {profileName}
        </p>
        <p className="text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
          No cards due right now. Check back later — your schedule is on track.
        </p>
        <button
          onClick={onEnd}
          className="px-6 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
        >
          Back to dashboard
        </button>
      </div>
    </div>
  )
}

// ── Loading state ─────────────────────────────────────────────

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

// ── Main Session export ───────────────────────────────────────

export default function Session({ profile, onEnd }) {
  const [phase, setPhase] = useState('loading') // loading | empty | reviewing | complete
  const [cards, setCards] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [ratings, setRatings] = useState([])

  useEffect(() => {
    loadSession()
  }, [])

  async function loadSession() {
    setPhase('loading')
    setCurrentIndex(0)
    setRatings([])
    const result = await api.cards.getSession(profile.id)
    setCards(result.cards)
    setPhase(result.cards.length === 0 ? 'empty' : 'reviewing')
  }

  async function handleRate(rating) {
    const card = cards[currentIndex]
    await api.cards.rate(profile.id, card.path, rating)
    const newRatings = [...ratings, { cardPath: card.path, rating }]
    setRatings(newRatings)

    if (currentIndex + 1 >= cards.length) {
      setPhase('complete')
    } else {
      setCurrentIndex(i => i + 1)
    }
  }

  if (phase === 'loading') return <LoadingState />

  if (phase === 'empty') return <EmptyState profileName={profile.name} onEnd={onEnd} />

  if (phase === 'complete') {
    return (
      <CompletionScreen
        ratings={ratings}
        total={cards.length}
        profileName={profile.name}
        onEnd={onEnd}
        onRestart={loadSession}
      />
    )
  }

  return (
    <ReviewScreen
      card={cards[currentIndex]}
      current={currentIndex + 1}
      total={cards.length}
      onRate={handleRate}
      onExit={onEnd}
    />
  )
}
