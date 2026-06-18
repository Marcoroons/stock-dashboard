import type { Easing } from 'framer-motion'
import { motion } from 'framer-motion'
import { UserCheck, BookOpen, PieChart, TrendingUp, ArrowRight, LogIn, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

const BENEFITS = [
  {
    icon: UserCheck,
    title: 'Know Your Investor Type',
    description: 'Complete a 2-minute assessment to discover your unique investor DNA — risk profile, style, and what actually keeps you up at night.',
  },
  {
    icon: BookOpen,
    title: 'Learn As You Invest',
    description: 'Plain-English insights, beginner-friendly explanations, and an Academy built to grow with you — not talk over your head.',
  },
  {
    icon: PieChart,
    title: 'Track & Grow Your Portfolio',
    description: 'Monitor holdings, stress-test your portfolio against real crashes, and get alerts tailored to your sectors and goals.',
  },
]

const TRUST_ITEMS = ['10-day free trial', 'No credit card required', 'Cancel anytime']

const E: Easing = 'easeOut'
const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.4, ease: E },
})

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center shadow-sm">
            <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-gray-900 dark:text-white text-sm">Investor OS</span>
        </div>
        <button
          onClick={onLogin}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          Log in
        </button>
      </header>

      <main className="flex-1">
        {/* Hero section */}
        <section className="flex flex-col items-center text-center px-6 pt-20 pb-16 max-w-3xl mx-auto">
          <motion.div {...fadeUp(0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-200 text-sky-700 dark:bg-sky-900/20 dark:border-sky-800 dark:text-sky-400 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              10-day free trial — no credit card needed
            </div>
          </motion.div>

          <motion.h1
            {...fadeUp(0.08)}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight mb-6"
          >
            Learn to Invest
            <br />
            <span className="text-sky-600 dark:text-sky-400">with Confidence</span>
          </motion.h1>

          <motion.p
            {...fadeUp(0.15)}
            className="text-lg sm:text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10 max-w-2xl"
          >
            A personalised investing companion built for beginners. Understand your investor DNA,
            track your portfolio, and grow — one step at a time.
          </motion.p>

          <motion.div {...fadeUp(0.22)} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" onClick={onGetStarted} className="min-w-[200px] shadow-md">
                Start Free Trial
                <ArrowRight className="w-5 h-5" strokeWidth={2} />
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button size="lg" variant="outline" onClick={onLogin} className="min-w-[160px]">
                Log In
              </Button>
            </motion.div>
          </motion.div>

          <motion.div {...fadeUp(0.3)} className="flex items-center justify-center gap-6 mt-6 flex-wrap">
            {TRUST_ITEMS.map(item => (
              <div key={item} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                <Check className="w-3.5 h-3.5 text-sky-500" strokeWidth={2.5} />
                {item}
              </div>
            ))}
          </motion.div>
        </section>

        {/* Benefit cards */}
        <section className="px-6 pb-20 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center text-center p-8 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
              >
                <div className="w-20 h-20 rounded-2xl bg-sky-50 dark:bg-sky-900/30 border border-sky-100 dark:border-sky-800 flex items-center justify-center mb-5">
                  <b.icon className="w-12 h-12 text-sky-600 dark:text-sky-400" strokeWidth={2} />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{b.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Social proof strip */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-sky-600 dark:bg-sky-700 text-white py-12 px-6 text-center"
        >
          <p className="text-2xl font-bold mb-2">Built for investors who are just getting started</p>
          <p className="text-sky-100 text-base max-w-xl mx-auto">
            No jargon. No overwhelming dashboards. Just the right tools, explained clearly, personalised to you.
          </p>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="text-center py-6 px-6 text-xs text-gray-400 dark:text-gray-600 border-t border-gray-100 dark:border-gray-900">
        © 2025 Investor OS · Not financial advice · For educational purposes only
      </footer>
    </div>
  )
}
