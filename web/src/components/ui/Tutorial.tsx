import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from './Button'

interface TutorialStep {
  icon: string
  title: string
  description: string
}

const STEPS: TutorialStep[] = [
  {
    icon: '🎉',
    title: 'Welcome to your Investor Intelligence OS!',
    description:
      "You've just unlocked a platform built entirely around your unique investor profile. Take 60 seconds for a quick tour — or skip if you're feeling adventurous.",
  },
  {
    icon: '📊',
    title: 'Your Dashboard',
    description:
      "This is your command center. See your portfolio health score, personalized market insights, and smart alerts — all tailored to your investor DNA. Everything updates as markets move.",
  },
  {
    icon: '💼',
    title: 'Portfolio & Analysis Tools',
    description:
      'Track your holdings, run a Portfolio Doctor health check, stress-test your positions against historical crashes, and deep-dive into individual stocks — all in one place.',
  },
  {
    icon: '👀',
    title: 'Watchlists & Opportunities',
    description:
      "Build personal watchlists and let our Opportunity Scanner surface investments that match your style and sector interests. Less noise, more signal.",
  },
  {
    icon: '🧬',
    title: 'Your Investor DNA',
    description:
      "Your DNA profile powers everything on this platform. Visit the DNA Profile page any time from the sidebar to review your investor archetype, behavioral traits, and risk profile.",
  },
  {
    icon: '🔔',
    title: 'Smart Alerts & News',
    description:
      "Get notified when your holdings make significant moves, and read market news filtered to your sectors of interest. No clutter — just what matters to you.",
  },
  {
    icon: '✨',
    title: "You're all set!",
    description:
      "Start by exploring your dashboard or heading to the Portfolio page. Remember: this is your personal investing companion. Take it at your own pace, and enjoy the journey.",
  },
]

interface TutorialProps {
  onComplete: () => void
}

export function Tutorial({ onComplete }: TutorialProps) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(9, 9, 15, 0.82)', backdropFilter: 'blur(6px)' }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.18 }}
            className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-2xl p-7 w-full max-w-md relative"
          >
            {/* Close / skip */}
            <button
              onClick={onComplete}
              className="absolute top-4 right-4 text-[#334155] hover:text-[#64748b] transition-colors"
              aria-label="Skip tour"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="text-4xl mb-5 select-none">{current.icon}</div>

            {/* Text */}
            <h3 className="text-xl font-bold text-[#f1f5f9] mb-3 pr-8">{current.title}</h3>
            <p className="text-[#94a3b8] text-sm leading-relaxed mb-7">{current.description}</p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-6">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'bg-[#3b82f6] w-6' : 'bg-[#1e1e3a] w-1.5'
                  }`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              {step > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => setStep(s => s - 1)}
                  className="flex-shrink-0 px-3"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              <Button fullWidth onClick={() => (isLast ? onComplete() : setStep(s => s + 1))}>
                {isLast ? 'Get started!' : 'Next'}
                {!isLast && <ChevronRight className="w-4 h-4 ml-1" />}
              </Button>
            </div>

            {!isLast && (
              <button
                onClick={onComplete}
                className="w-full text-center text-xs text-[#334155] hover:text-[#64748b] mt-4 transition-colors"
              >
                Skip tour
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
