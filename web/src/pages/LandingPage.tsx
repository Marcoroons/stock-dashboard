import { useState, useEffect } from 'react'
import { motion, MotionConfig, AnimatePresence } from 'framer-motion'
import {
  Dna, BarChart3, BookOpen, ArrowRight, ChevronDown,
  Sun, Moon, Check, Zap, Shield, Sparkles,
} from 'lucide-react'
import { ShaderAnimation } from '@/components/ui/ShaderAnimation'
import { MadyLogo } from '@/components/ui/MadyLogo'
import { useTheme } from '@/context/ThemeContext'
import { cn } from '@/lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

// ─── Shared animation helpers ─────────────────────────────────────────────────

const fadeUp = {
  initial:    { opacity: 0, y: 32 },
  whileInView:{ opacity: 1, y: 0 },
  viewport:   { once: true as const, amount: 0.25 },
}

const springBounce = {
  type: 'spring' as const,
  stiffness: 180,
  damping: 14,
  mass: 0.7,
}

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    n:    '01',
    icon: Dna,
    head: 'Psychometric Assessment',
    body: 'We decode your relationship with risk, time, and money — building a complete investor archetype before you place a single trade.',
  },
  {
    n:    '02',
    icon: BarChart3,
    head: 'Portfolio Tracking',
    body: 'One dashboard for your holdings. Run health checks, stress-test against real market crashes, and watch your wealth grow in real time.',
  },
  {
    n:    '03',
    icon: BookOpen,
    head: 'Learn as You Invest',
    body: 'Every decision comes with a plain-English explanation. The academy levels up with you — from first trade to confident portfolio builder.',
  },
]

// ─── Pricing data (self-contained, no Stripe/router hooks) ───────────────────

interface LPlan {
  id: string
  name: string
  tagline: string
  monthly: number
  yearly: number
  icon: React.FC<{ className?: string; strokeWidth?: number }>
  popular: boolean
  features: string[]
}

const LP_PLANS: LPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Essential tools for getting started',
    monthly: 9,
    yearly: 7,
    icon: Sparkles,
    popular: false,
    features: [
      'Investor DNA Assessment',
      'Portfolio Tracking',
      'Stock Analysis (10/day)',
      'Portfolio Doctor',
      'Life Goals Planner',
      'Academy Access',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Deeper insights for active investors',
    monthly: 19,
    yearly: 15,
    icon: Zap,
    popular: true,
    features: [
      'Everything in Basic',
      'Unlimited Stock Analysis',
      'AI Portfolio Builder',
      'Discovery Engine',
      'News Intelligence',
      'Fund Analysis',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Institutional-grade for serious investors',
    monthly: 39,
    yearly: 31,
    icon: Shield,
    popular: false,
    features: [
      'Everything in Pro',
      'Smart Alerts & Watchlists',
      'Portfolio Stress Testing',
      'Insider Activity Tracker',
      'AI Coach',
      'Priority Support',
    ],
  },
]

// ─── Landing pricing sub-components ──────────────────────────────────────────

function LandingBillingToggle({
  yearly,
  onChange,
}: {
  yearly: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <span
        className={cn(
          'text-sm font-medium transition-colors',
          !yearly
            ? 'text-[#0C0A09] dark:text-white'
            : 'text-[#0C0A09]/35 dark:text-white/30',
        )}
      >
        Monthly
      </span>
      <button
        role="switch"
        aria-checked={yearly}
        onClick={() => onChange(!yearly)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0C0A09]/40 dark:focus-visible:ring-white/40 focus-visible:ring-offset-2',
          yearly
            ? 'bg-[#0C0A09] dark:bg-white'
            : 'bg-[#0C0A09]/15 dark:bg-white/20',
        )}
      >
        <motion.span
          layout
          className="absolute top-1 w-4 h-4 rounded-full shadow-sm bg-white dark:bg-[#0C0A09]"
          animate={{ left: yearly ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </button>
      <span
        className={cn(
          'text-sm font-medium transition-colors flex items-center gap-1.5',
          yearly
            ? 'text-[#0C0A09] dark:text-white'
            : 'text-[#0C0A09]/35 dark:text-white/30',
        )}
      >
        Yearly
        <span className="text-[11px] font-bold text-[#0C0A09]/60 dark:text-white/50 bg-[#0C0A09]/8 dark:bg-white/10 px-2 py-0.5 rounded-full">
          Save 20%
        </span>
      </span>
    </div>
  )
}

function LandingPlanCard({
  plan,
  yearly,
  onGetStarted,
  delay,
}: {
  plan: LPlan
  yearly: boolean
  onGetStarted: () => void
  delay: number
}) {
  const price = yearly ? plan.yearly : plan.monthly

  return (
    <motion.div
      {...fadeUp}
      transition={{ delay, duration: 0.45 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        'relative flex flex-col rounded-2xl border overflow-hidden transition-shadow duration-200',
        'bg-white dark:bg-[#111]',
        plan.popular
          ? 'border-[#0C0A09]/25 dark:border-white/25 shadow-md dark:shadow-none'
          : 'border-[#0C0A09]/10 dark:border-white/10 shadow-sm dark:shadow-none',
      )}
      style={{ cursor: 'default' }}
    >
      {/* Popular accent line */}
      {plan.popular && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#0C0A09]/40 dark:via-white/40 to-transparent" />
      )}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-[#0C0A09] dark:bg-white text-white dark:text-[#0C0A09] shadow-sm">
          Most Popular
        </div>
      )}

      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-[#0C0A09] dark:text-white mb-0.5">{plan.name}</h3>
            <p className="text-xs text-[#0C0A09]/45 dark:text-white/40">{plan.tagline}</p>
          </div>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#0C0A09]/[0.06] dark:bg-white/[0.06]">
            <plan.icon className="w-5 h-5 text-[#0C0A09]/70 dark:text-white/70" strokeWidth={2} />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-end gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={price}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="text-4xl font-bold text-[#0C0A09] dark:text-white"
              >
                ${price}
              </motion.span>
            </AnimatePresence>
            <span className="text-[#0C0A09]/35 dark:text-white/30 pb-1.5 text-sm">/month</span>
          </div>
          {yearly && (
            <p className="text-xs text-[#0C0A09]/50 dark:text-white/40 mt-1 font-medium">
              Billed ${price * 12}/year
            </p>
          )}
        </div>

        <ul className="space-y-2.5">
          {plan.features.map(feat => (
            <li key={feat} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#0C0A09]/[0.06] dark:bg-white/[0.06]">
                <Check className="w-2.5 h-2.5 text-[#0C0A09]/60 dark:text-white/60" strokeWidth={3} />
              </div>
              <span className="text-xs text-[#0C0A09]/55 dark:text-white/45 leading-relaxed">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={onGetStarted}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold',
            'transition-all duration-150 cursor-pointer active:scale-[0.98]',
            plan.popular
              ? 'bg-[#0C0A09] dark:bg-white text-white dark:text-[#0C0A09] hover:opacity-90'
              : 'bg-[#0C0A09]/8 dark:bg-white/10 text-[#0C0A09] dark:text-white hover:bg-[#0C0A09]/14 dark:hover:bg-white/18',
          )}
        >
          Start free trial
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

function LandingPricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="px-8 sm:px-16 py-28 bg-[#EEECEA] dark:bg-[#050505]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="text-center text-[#0C0A09]/35 dark:text-white/30 text-xs tracking-[0.3em] uppercase mb-5"
        >
          Pricing
        </motion.p>
        <motion.h2
          {...fadeUp}
          transition={{ delay: 0.08, duration: 0.6 }}
          className="text-center text-[clamp(1.8rem,4vw,3rem)] font-black text-[#0C0A09] dark:text-white tracking-tight leading-tight mb-3"
        >
          Simple, honest pricing.
        </motion.h2>
        <motion.p
          {...fadeUp}
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-center text-[#0C0A09]/45 dark:text-white/40 text-base max-w-md mx-auto leading-relaxed mb-10"
        >
          Start with a 10-day free trial. No credit card required.
        </motion.p>

        <motion.div
          {...fadeUp}
          transition={{ delay: 0.22, duration: 0.5 }}
          className="mb-10"
        >
          <LandingBillingToggle yearly={yearly} onChange={setYearly} />
        </motion.div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
          {LP_PLANS.map((plan, i) => (
            <LandingPlanCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
              onGetStarted={onGetStarted}
              delay={0.28 + i * 0.07}
            />
          ))}
        </div>

        <motion.p
          {...fadeUp}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-[#0C0A09]/25 dark:text-white/20 text-xs mt-8 tracking-wider"
        >
          10 days free · cancel anytime · no credit card
        </motion.p>
      </div>
    </section>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="text-[#0C0A09] dark:text-white selection:bg-[#0C0A09]/15 dark:selection:bg-white/20">

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 1 — HERO (always dark — shader fills this entirely)
        ════════════════════════════════════════════════════════════════════ */}
        <section className="relative h-screen overflow-hidden bg-[#080808]">

          {/* Shader animation fills the entire hero */}
          <div className="absolute inset-0">
            <ShaderAnimation className="w-full h-full" />
          </div>

          {/* Vignette — darkens edges, preserves centre colour */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.80) 100%)',
            }}
          />

          {/* Minimal nav */}
          <nav className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-8 py-6">
            <div className="flex items-center gap-3">
              <MadyLogo className="w-7 h-7 text-white opacity-90" />
              <span className="text-white/70 text-xs tracking-[0.22em] uppercase font-light">
                Mady Finance
              </span>
            </div>
            <div className="flex items-center gap-5">
              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                className="text-white/40 hover:text-white/80 transition-colors duration-200 cursor-pointer"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4" strokeWidth={1.5} />
                  : <Moon className="w-4 h-4" strokeWidth={1.5} />
                }
              </button>
              <button
                onClick={onLogin}
                className="text-white/40 hover:text-white text-xs tracking-widest uppercase transition-colors duration-200 cursor-pointer font-light"
              >
                Log in
              </button>
            </div>
          </nav>

          {/* Centre brand statement — LOGO + ANIMATION ARE FINAL, DO NOT MODIFY */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
              className="flex flex-col items-center gap-5"
            >
              <MadyLogo className="w-20 h-20 sm:w-24 sm:h-24 text-white" />

              <h1 className="text-[clamp(2.8rem,8vw,6rem)] font-black text-white tracking-[0.15em] uppercase leading-none">
                Mady Finance
              </h1>

              <p className="text-white/40 text-sm sm:text-base tracking-[0.3em] uppercase font-light">
                Investing for Beginners
              </p>
            </motion.div>
          </div>

          {/* Scroll cue — fades out after user scrolls */}
          <motion.div
            animate={{ opacity: scrolled ? 0 : 1 }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
            style={{ pointerEvents: scrolled ? 'none' : 'auto' }}
          >
            <button
              onClick={() => scrollTo('pain')}
              aria-label="Scroll down"
              className="flex flex-col items-center gap-2 text-white/25 hover:text-white/55 transition-colors duration-200 cursor-pointer"
            >
              <motion.div
                animate={{ y: [0, 7, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
              </motion.div>
            </button>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 2 — PAIN POINTS
        ════════════════════════════════════════════════════════════════════ */}
        <section
          id="pain"
          className="min-h-screen flex flex-col items-start justify-center px-8 sm:px-16 lg:px-28 py-32 bg-[#F5F4F0] dark:bg-[#050505]"
        >
          <div className="max-w-3xl space-y-4">
            {[
              { text: 'No investing experience?', dim: false, delay: 0 },
              { text: 'Good.',                     dim: true,  delay: 0.18 },
              { text: "We'll meet you",            dim: false, delay: 0.36 },
              { text: 'where you are.',            dim: false, delay: 0.52 },
            ].map(({ text, dim, delay }) => (
              <motion.p
                key={text}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay, duration: 0.65, ease: 'easeOut' }}
                className={cn(
                  'font-black leading-none',
                  'text-[clamp(2.4rem,6.5vw,5rem)]',
                  dim
                    ? 'text-[#0C0A09]/20 dark:text-white/20'
                    : 'text-[#0C0A09] dark:text-white',
                )}
              >
                {text}
              </motion.p>
            ))}
          </div>

          {/* Supporting micro-lines */}
          <motion.div
            {...fadeUp}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="mt-16 space-y-3 pl-1"
          >
            {[
              'Unsure where to start?',
              'Money sitting in savings?',
              'Stock apps too overwhelming?',
            ].map(line => (
              <p key={line} className="text-[#0C0A09]/30 dark:text-white/30 text-base sm:text-lg font-light tracking-wide">
                {line}
              </p>
            ))}
            <p className="text-[#0C0A09]/70 dark:text-white/70 text-base sm:text-lg font-medium tracking-wide pt-1">
              Let&apos;s fix that.
            </p>
          </motion.div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 3 — VALUE PROP + PRIMARY CTA
        ════════════════════════════════════════════════════════════════════ */}
        <section className="flex flex-col items-center justify-center px-8 py-32 bg-[#EEECEA] dark:bg-[#0A0A0A] text-center">
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="text-[#0C0A09]/35 dark:text-white/30 text-xs tracking-[0.3em] uppercase mb-6"
          >
            How it works
          </motion.p>

          <motion.h2
            {...fadeUp}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-[clamp(2rem,5vw,3.8rem)] font-black text-[#0C0A09] dark:text-white leading-tight tracking-tight max-w-2xl mb-6"
          >
            Built Around
            <br />
            Your Personality.
          </motion.h2>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-[#0C0A09]/45 dark:text-white/40 text-lg leading-relaxed max-w-xl mb-14"
          >
            No jargon. No guesswork.
            <br />
            Uncover your investing style — receive guidance designed specifically for you.
          </motion.p>

          {/* Spring-bounce CTA */}
          <motion.button
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={springBounce}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onGetStarted}
            className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-[#0C0A09] dark:bg-white text-white dark:text-[#080808] font-bold text-base tracking-tight cursor-pointer shadow-xl shadow-[#0C0A09]/10 dark:shadow-white/10 hover:opacity-90 transition-opacity duration-150"
          >
            Try Free Trial Now
            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
          </motion.button>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-[#0C0A09]/20 dark:text-white/20 text-xs mt-5 tracking-wider"
          >
            10 days free · no credit card
          </motion.p>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 4 — FEATURES (one by one)
        ════════════════════════════════════════════════════════════════════ */}
        {FEATURES.map((feat, i) => {
          const Icon   = feat.icon
          const isEven = i % 2 === 0
          const bg     = i === 1
            ? 'bg-[#EEECEA] dark:bg-[#0D0D0D]'
            : 'bg-[#F5F4F0] dark:bg-[#080808]'

          return (
            <section
              key={feat.n}
              className={cn(
                'flex flex-col md:flex-row items-center gap-16 px-8 sm:px-16 lg:px-24 py-28 md:py-36',
                bg,
                !isEven && 'md:flex-row-reverse',
              )}
            >
              {/* Icon visual */}
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.7 }}
                className="flex-shrink-0 flex items-center justify-center w-full md:w-2/5"
              >
                <div className="relative flex items-center justify-center">
                  {/* Outer glow */}
                  <div className="absolute w-64 h-64 rounded-full bg-[#0C0A09]/5 dark:bg-white/5 blur-3xl" />
                  {/* Container */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-52 h-52 rounded-[2.5rem] border border-[#0C0A09]/8 dark:border-white/8 bg-[#0C0A09]/[0.03] dark:bg-white/[0.03] flex items-center justify-center backdrop-blur-sm cursor-default"
                  >
                    <Icon className="w-24 h-24 text-[#0C0A09]/55 dark:text-white/60" strokeWidth={1} />
                  </motion.div>
                </div>
              </motion.div>

              {/* Text */}
              <div className="flex-1 max-w-lg">
                <motion.p
                  {...fadeUp}
                  transition={{ delay: 0.05, duration: 0.5 }}
                  className="text-[#0C0A09]/20 dark:text-white/20 text-sm font-mono tracking-[0.2em] mb-5"
                >
                  {feat.n}
                </motion.p>
                <motion.h3
                  {...fadeUp}
                  transition={{ delay: 0.12, duration: 0.6 }}
                  className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black text-[#0C0A09] dark:text-white leading-tight tracking-tight mb-5"
                >
                  {feat.head}
                </motion.h3>
                <motion.p
                  {...fadeUp}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-[#0C0A09]/45 dark:text-white/40 text-lg leading-relaxed"
                >
                  {feat.body}
                </motion.p>
              </div>
            </section>
          )
        })}

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 5 — PRICING (embedded, scroll flow)
        ════════════════════════════════════════════════════════════════════ */}
        <LandingPricingSection onGetStarted={onGetStarted} />

        {/* ════════════════════════════════════════════════════════════════════
            SECTION 6 — FINAL CTA
        ════════════════════════════════════════════════════════════════════ */}
        <section className="flex flex-col items-center justify-center text-center px-8 py-32 bg-[#F5F4F0] dark:bg-[#050505]">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-8"
          >
            <MadyLogo className="w-8 h-8 text-[#0C0A09]/55 dark:text-white/60" />
            <span className="text-[#0C0A09]/40 dark:text-white/40 text-xs tracking-[0.3em] uppercase">Mady Finance</span>
          </motion.div>

          <motion.h2
            {...fadeUp}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-[clamp(2rem,5vw,3.5rem)] font-black text-[#0C0A09] dark:text-white leading-tight tracking-tight mb-4 max-w-xl"
          >
            Your first step starts here.
          </motion.h2>

          <motion.p
            {...fadeUp}
            transition={{ delay: 0.18, duration: 0.6 }}
            className="text-[#0C0A09]/30 dark:text-white/30 text-lg mb-12 max-w-md leading-relaxed"
          >
            Join thousands of beginners who finally understand their money.
          </motion.p>

          {/* Bounce-in buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <motion.button
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ ...springBounce, delay: 0 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onGetStarted}
              className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-[#0C0A09] dark:bg-white text-white dark:text-[#080808] font-bold text-sm cursor-pointer hover:opacity-90 transition-opacity duration-150 min-w-[200px] min-h-[52px]"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ ...springBounce, delay: 0.12 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={onLogin}
              className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl border border-[#0C0A09]/15 dark:border-white/15 text-[#0C0A09]/55 dark:text-white/60 hover:text-[#0C0A09] dark:hover:text-white hover:border-[#0C0A09]/30 dark:hover:border-white/30 font-medium text-sm cursor-pointer transition-all duration-200 min-w-[160px] min-h-[52px]"
            >
              Log In
            </motion.button>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════
            FOOTER
        ════════════════════════════════════════════════════════════════════ */}
        <footer className="border-t border-[#0C0A09]/[0.06] dark:border-white/[0.06] px-8 py-8 bg-[#EEECEA] dark:bg-[#050505] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <MadyLogo className="w-5 h-5 text-[#0C0A09]/30 dark:text-white/30" />
            <span className="text-[#0C0A09]/25 dark:text-white/25 text-xs tracking-widest uppercase">Mady Finance</span>
          </div>
          <p className="text-[#0C0A09]/20 dark:text-white/20 text-xs">
            © 2025 · Not financial advice · Educational use only
          </p>
        </footer>

      </div>
    </MotionConfig>
  )
}
