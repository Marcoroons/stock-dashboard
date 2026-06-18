import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft, LayoutDashboard, Briefcase, Dna, Target, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from './Button'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

// ─── Tour step definitions ────────────────────────────────────────────────────

interface TourStep {
  icon: React.FC<{ className?: string; strokeWidth?: number }>
  title: string
  description: string
  selector?: string
}

const STEPS: TourStep[] = [
  {
    icon: Sparkles,
    title: "Welcome to your Investor OS!",
    description: "You've just unlocked a platform built entirely around your investor DNA. Take 60 seconds for a quick tour — or press Escape to skip.",
  },
  {
    icon: LayoutDashboard,
    title: 'Your Command Center',
    description: 'The Dashboard shows your portfolio health score, DNA-powered insights, and smart alerts — all updated as markets move. Everything is personalised to you.',
    selector: 'a[href="/dashboard"]',
  },
  {
    icon: Briefcase,
    title: 'Portfolio & Analysis Tools',
    description: 'Track your holdings, run a Portfolio Doctor health check, stress-test against real market crashes, and deep-dive into individual stocks — all in one place.',
    selector: 'a[href="/portfolio"]',
  },
  {
    icon: Dna,
    title: 'Your Investor DNA',
    description: 'Your DNA profile powers every recommendation on this platform. Visit the DNA Profile page any time to review your archetype, behavioral traits, and risk profile.',
    selector: 'a[href="/dna"]',
  },
  {
    icon: Target,
    title: 'Life Goals & Planning',
    description: "Set financial goals — a house, retirement, a rainy-day fund — and see exactly how to get there. Projections are built around your risk profile and time horizon.",
    selector: 'a[href="/goals"]',
  },
  {
    icon: TrendingUp,
    title: "You're all set!",
    description: "Start by exploring your dashboard or heading to the Portfolio page. This is your personal investing companion — take it at your own pace, and enjoy the journey.",
  },
]

// ─── Spotlight calculation ────────────────────────────────────────────────────

function useSpotlight(selector: string | undefined) {
  const [rect, setRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    if (!selector) { setRect(null); return }

    function update() {
      const el = document.querySelector(selector!)
      setRect(el ? el.getBoundingClientRect() : null)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [selector])

  return rect
}

// ─── Spotlight overlay ────────────────────────────────────────────────────────

const PAD = 8

function SpotlightOverlay({ rect }: { rect: DOMRect | null }) {
  if (!rect) {
    return <div className="absolute inset-0 bg-black/70" />
  }

  const x = rect.left - PAD
  const y = rect.top - PAD
  const w = rect.width + PAD * 2
  const h = rect.height + PAD * 2

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <mask id="tour-spotlight-mask">
          <rect width="100%" height="100%" fill="white" />
          <rect x={x} y={y} width={w} height={h} rx="10" fill="black" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="rgba(0,0,0,0.72)" mask="url(#tour-spotlight-mask)" />
      {/* Glow ring around spotlight */}
      <rect
        x={x - 1} y={y - 1} width={w + 2} height={h + 2}
        rx="11" fill="none"
        stroke="rgba(56,189,248,0.5)"
        strokeWidth="2"
      />
    </svg>
  )
}

// ─── Tour card positioning ────────────────────────────────────────────────────

function getCardPosition(rect: DOMRect | null): React.CSSProperties {
  if (!rect) {
    return { position: 'fixed', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }
  }

  const CARD_W = 360
  const CARD_H = 260
  const vw = window.innerWidth
  const vh = window.innerHeight
  const margin = 16

  let left = rect.right + margin
  let top  = rect.top + rect.height / 2 - CARD_H / 2

  // Not enough space on right → try left
  if (left + CARD_W > vw - margin) {
    left = rect.left - CARD_W - margin
  }
  // Not enough on left either → center horizontally, go below or above
  if (left < margin) {
    left = Math.max(margin, Math.min(vw - CARD_W - margin, rect.left + rect.width / 2 - CARD_W / 2))
    top  = rect.bottom + margin
    if (top + CARD_H > vh - margin) {
      top = rect.top - CARD_H - margin
    }
  }

  // Clamp vertically
  top = Math.max(margin, Math.min(vh - CARD_H - margin, top))

  return { position: 'fixed', left, top }
}

// ─── Main component ───────────────────────────────────────────────────────────

interface ProductTourProps {
  onComplete: () => void
}

export function ProductTour({ onComplete }: ProductTourProps) {
  const { user } = useAuth()
  const [step, setStep] = useState(0)
  const current  = STEPS[step]
  const isFirst  = step === 0
  const isLast   = step === STEPS.length - 1
  const spotRect = useSpotlight(current.selector)

  const dismiss = useCallback(async () => {
    onComplete()
    if (user) {
      // Persist to Supabase profiles (silently; column may not exist yet)
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('profiles') as any)
          .update({ tour_completed: true })
          .eq('id', user.id)
      } catch { /* no-op */ }
    }
  }, [onComplete, user])

  const goNext = useCallback(() => {
    if (isLast) { dismiss(); return }
    setStep(s => s + 1)
  }, [isLast, dismiss])

  const goPrev = useCallback(() => {
    if (!isFirst) setStep(s => s - 1)
  }, [isFirst])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')     dismiss()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft')  goPrev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [dismiss, goNext, goPrev])

  const cardStyle = getCardPosition(spotRect)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50"
        style={{ pointerEvents: 'all' }}
        aria-modal="true"
        role="dialog"
        aria-label="Product tour"
      >
        {/* Spotlight overlay — not pointer-blocking */}
        <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
          <SpotlightOverlay rect={spotRect} />
        </div>

        {/* Tour card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2 }}
            style={cardStyle}
            className="w-[min(360px,calc(100vw-32px))] bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl p-6"
          >
            {/* Close */}
            <button
              onClick={dismiss}
              aria-label="Close tour"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 flex items-center justify-center mb-4">
              <current.icon className="w-6 h-6 text-sky-600 dark:text-sky-400" strokeWidth={2} />
            </div>

            {/* Text */}
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 pr-6 leading-snug">
              {current.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              {current.description}
            </p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'bg-sky-500 w-5'
                      : i < step
                      ? 'bg-sky-200 dark:bg-sky-800 w-1.5'
                      : 'bg-gray-200 dark:bg-gray-700 w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              {!isFirst && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={goPrev}
                  className="flex-shrink-0"
                  aria-label="Previous step"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button size="sm" fullWidth onClick={goNext}>
                {isLast ? 'Get started!' : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>

            {!isLast && (
              <button
                onClick={dismiss}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mt-3 transition-colors cursor-pointer"
              >
                Skip tour
              </button>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Click backdrop to dismiss (only when no spotlight) */}
        {!spotRect && (
          <div
            className="absolute inset-0 -z-[1]"
            onClick={dismiss}
            aria-hidden="true"
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
