import { useId } from 'react'
import { motion } from 'framer-motion'
import { Dna, BarChart3, BookOpen, ArrowRight, ChevronDown } from 'lucide-react'
import { ShaderAnimation } from '@/components/ui/ShaderAnimation'
import { cn } from '@/lib/utils'

// ─── Props ────────────────────────────────────────────────────────────────────

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

// ─── Inline logo ──────────────────────────────────────────────────────────────
// Bunny/skull silhouette — no external file needed.
// Uses SVG mask so currentColor controls the shape and holes are truly transparent.

function MadyLogo({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '-')
  return (
    <svg
      viewBox="0 0 100 112"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Mady Finance logo"
    >
      <defs>
        <mask id={id}>
          {/* Filled white = visible region */}
          <ellipse cx="28" cy="27" rx="22" ry="26" fill="white" />
          <ellipse cx="72" cy="27" rx="22" ry="26" fill="white" />
          <ellipse cx="50" cy="75" rx="45" ry="35" fill="white" />
          {/* Black = transparent holes (eye sockets + diamond nose) */}
          <path d="M13,77 C17,67 29,63 39,69 C36,80 23,83 13,77Z" fill="black" />
          <path d="M87,77 C83,67 71,63 61,69 C64,80 77,83 87,77Z" fill="black" />
          <polygon points="50,87 54,91 50,95 46,91" fill="black" />
        </mask>
      </defs>
      <rect width="100" height="112" fill="currentColor" mask={`url(#${id})`} />
    </svg>
  )
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

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-[#080808] text-white selection:bg-white/20">

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — HERO (shader + brand)
      ════════════════════════════════════════════════════════════════════ */}
      <section className="relative h-screen overflow-hidden">

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
          <button
            onClick={onLogin}
            className="text-white/40 hover:text-white text-xs tracking-widest uppercase transition-colors cursor-pointer font-light"
          >
            Log in
          </button>
        </nav>

        {/* Centre brand statement */}
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

        {/* Scroll cue */}
        <button
          onClick={() => scrollTo('pain')}
          aria-label="Scroll down"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 text-white/25 hover:text-white/50 transition-colors cursor-pointer"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
          </motion.div>
        </button>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — PAIN POINTS
      ════════════════════════════════════════════════════════════════════ */}
      <section
        id="pain"
        className="min-h-screen flex flex-col items-start justify-center px-8 sm:px-16 lg:px-28 py-32 bg-[#050505]"
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
                dim ? 'text-white/20' : 'text-white',
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
            <p key={line} className="text-white/30 text-base sm:text-lg font-light tracking-wide">
              {line}
            </p>
          ))}
          <p className="text-white/70 text-base sm:text-lg font-medium tracking-wide pt-1">
            Let&apos;s fix that.
          </p>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — VALUE PROP + PRIMARY CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center justify-center px-8 py-32 bg-[#0A0A0A] text-center">
        <motion.p
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="text-white/30 text-xs tracking-[0.3em] uppercase mb-6"
        >
          How it works
        </motion.p>

        <motion.h2
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="text-[clamp(2rem,5vw,3.8rem)] font-black text-white leading-tight tracking-tight max-w-2xl mb-6"
        >
          Built Around
          <br />
          Your Personality.
        </motion.h2>

        <motion.p
          {...fadeUp}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="text-white/40 text-lg leading-relaxed max-w-xl mb-14"
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
          className="flex items-center gap-3 px-10 py-5 rounded-2xl bg-white text-[#080808] font-bold text-base tracking-tight cursor-pointer shadow-2xl shadow-white/10 hover:bg-white/90 transition-colors"
        >
          Try Free Trial Now
          <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>

        <motion.p
          {...fadeUp}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-white/20 text-xs mt-5 tracking-wider"
        >
          10 days free · no credit card
        </motion.p>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — FEATURES (one by one)
      ════════════════════════════════════════════════════════════════════ */}
      {FEATURES.map((feat, i) => {
        const Icon    = feat.icon
        const isEven  = i % 2 === 0
        const sectionBg = i === 1 ? 'bg-[#0D0D0D]' : 'bg-[#080808]'

        return (
          <section
            key={feat.n}
            className={cn(
              'flex flex-col md:flex-row items-center gap-16 px-8 sm:px-16 lg:px-24 py-28 md:py-36',
              sectionBg,
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
                <div className="absolute w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                {/* Container */}
                <div className="relative w-52 h-52 rounded-[2.5rem] border border-white/8 bg-white/[0.03] flex items-center justify-center backdrop-blur-sm">
                  <Icon className="w-24 h-24 text-white/60" strokeWidth={1} />
                </div>
              </div>
            </motion.div>

            {/* Text */}
            <div className="flex-1 max-w-lg">
              <motion.p
                {...fadeUp}
                transition={{ delay: 0.05, duration: 0.5 }}
                className="text-white/20 text-sm font-mono tracking-[0.2em] mb-5"
              >
                {feat.n}
              </motion.p>
              <motion.h3
                {...fadeUp}
                transition={{ delay: 0.12, duration: 0.6 }}
                className="text-[clamp(1.8rem,3.5vw,2.8rem)] font-black text-white leading-tight tracking-tight mb-5"
              >
                {feat.head}
              </motion.h3>
              <motion.p
                {...fadeUp}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-white/40 text-lg leading-relaxed"
              >
                {feat.body}
              </motion.p>
            </div>
          </section>
        )
      })}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — FINAL CTA
      ════════════════════════════════════════════════════════════════════ */}
      <section className="flex flex-col items-center justify-center text-center px-8 py-32 bg-[#050505]">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-8"
        >
          <MadyLogo className="w-8 h-8 text-white/60" />
          <span className="text-white/40 text-xs tracking-[0.3em] uppercase">Mady Finance</span>
        </motion.div>

        <motion.h2
          {...fadeUp}
          transition={{ delay: 0.1, duration: 0.7 }}
          className="text-[clamp(2rem,5vw,3.5rem)] font-black text-white leading-tight tracking-tight mb-4 max-w-xl"
        >
          Your first step starts here.
        </motion.h2>

        <motion.p
          {...fadeUp}
          transition={{ delay: 0.18, duration: 0.6 }}
          className="text-white/30 text-lg mb-12 max-w-md leading-relaxed"
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
            className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl bg-white text-[#080808] font-bold text-sm cursor-pointer hover:bg-white/90 transition-colors min-w-[200px] min-h-[52px]"
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
            className="flex items-center justify-center gap-2.5 px-9 py-4 rounded-xl border border-white/15 text-white/60 hover:text-white hover:border-white/30 font-medium text-sm cursor-pointer transition-all min-w-[160px] min-h-[52px]"
          >
            Log In
          </motion.button>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════════ */}
      <footer className="border-t border-white/[0.06] px-8 py-8 bg-[#050505] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <MadyLogo className="w-5 h-5 text-white/30" />
          <span className="text-white/25 text-xs tracking-widest uppercase">Mady Finance</span>
        </div>
        <p className="text-white/20 text-xs">
          © 2025 · Not financial advice · Educational use only
        </p>
      </footer>

    </div>
  )
}
