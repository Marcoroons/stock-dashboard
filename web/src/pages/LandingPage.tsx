import { useRef } from 'react'
import { motion } from 'framer-motion'
import { UserCheck, BookOpen, PieChart, ArrowRight, ChevronDown, LogIn, Check } from 'lucide-react'
import { ShaderAnimation } from '@/components/ui/ShaderAnimation'

interface LandingPageProps {
  onGetStarted: () => void
  onLogin: () => void
}

const BENEFITS = [
  {
    icon: UserCheck,
    title: 'Know Your Investor Type',
    description: 'A 2-minute assessment reveals your unique investor DNA — risk profile, style, and the boundaries that keep you sleeping at night.',
  },
  {
    icon: BookOpen,
    title: 'Learn As You Invest',
    description: 'Plain-English insights, zero jargon. The Academy grows with you from first investment to confident portfolio builder.',
  },
  {
    icon: PieChart,
    title: 'Track & Grow Your Portfolio',
    description: 'Monitor your holdings, stress-test against real crashes, and get smart alerts tuned to your sectors and goals.',
  },
]

const TRUST = ['10-day free trial', 'No credit card required', 'Cancel anytime']

export function LandingPage({ onGetStarted, onLogin }: LandingPageProps) {
  const contentRef = useRef<HTMLElement>(null)

  function scrollToContent() {
    contentRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-[#F5F4F0]">

      {/* ── HERO ── dark, full-screen, shader behind everything ─────────────── */}
      <section className="relative h-screen overflow-hidden bg-[#080808]">

        {/* Shader fills the whole hero */}
        <div className="absolute inset-0">
          <ShaderAnimation className="w-full h-full" />
        </div>

        {/* Dark radial vignette — keeps center vibrant, edges dark */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.72) 100%)',
          }}
        />

        {/* Navbar */}
        <nav className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-10 py-5">
          <div className="flex items-center gap-3">
            {/* Logo — inverted to white on dark background */}
            <img
              src="/logo.png"
              alt="Mady Finance"
              className="w-8 h-8 object-contain"
              style={{ filter: 'invert(1)' }}
            />
            <span className="text-white font-semibold tracking-wide text-sm">
              Mady Finance
            </span>
          </div>
          <button
            onClick={onLogin}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" strokeWidth={2} />
            Log in
          </button>
        </nav>

        {/* Centered hero content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.9, ease: 'easeOut' }}
            className="flex flex-col items-center"
          >
            {/* Large logo mark */}
            <img
              src="/logo.png"
              alt="Mady Finance"
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain mb-8 select-none"
              style={{ filter: 'invert(1)' }}
              draggable={false}
            />

            {/* Brand name */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white tracking-[0.18em] uppercase mb-4 leading-none">
              Mady Finance
            </h1>

            {/* Tagline */}
            <p className="text-white/40 text-base sm:text-lg tracking-widest uppercase font-light">
              Built for beginner investors
            </p>
          </motion.div>
        </div>

        {/* Scroll-down indicator */}
        <button
          onClick={scrollToContent}
          aria-label="Scroll to content"
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors cursor-pointer group"
        >
          <span className="text-[11px] uppercase tracking-widest font-light">Explore</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
          </motion.div>
        </button>
      </section>

      {/* ── CONTENT ── bone/ceramic white ───────────────────────────────────── */}
      <section ref={contentRef} className="bg-[#F5F4F0] px-6 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto">

          {/* Headline block */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="text-center mb-14"
          >
            <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A9A9A] mb-5">
              Your investing companion
            </p>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#111111] leading-tight tracking-tight mb-5">
              Learn to Invest
              <br />
              <span className="text-[#444444]">with Confidence</span>
            </h2>
            <p className="text-[#6B6B6B] text-lg leading-relaxed max-w-xl mx-auto mb-10">
              A personalised platform built entirely around your investor profile.
              Understand your DNA, track your portfolio, and grow — one step at a time.
            </p>

            {/* Trust badges */}
            <div className="flex items-center justify-center gap-6 flex-wrap mb-10">
              {TRUST.map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs text-[#888888]">
                  <Check className="w-3.5 h-3.5 text-[#555555]" strokeWidth={2.5} />
                  {t}
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onGetStarted}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[#111111] text-white text-sm font-semibold min-w-[200px] min-h-[52px] cursor-pointer hover:bg-[#222222] transition-colors shadow-md shadow-black/10"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={onLogin}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl border border-[#CCCCCC] text-[#333333] text-sm font-semibold min-w-[160px] min-h-[52px] cursor-pointer hover:border-[#888888] hover:bg-[#EEEDE9] transition-all"
              >
                Log In
              </motion.button>
            </div>
          </motion.div>

          {/* Divider */}
          <div className="border-t border-[#E4E2DC] mb-14" />

          {/* Benefit cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {BENEFITS.map((b, i) => (
              <motion.div
                key={b.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                className="flex flex-col items-start p-7 rounded-2xl bg-white border border-[#E4E2DC] shadow-sm"
              >
                <div className="w-14 h-14 rounded-xl bg-[#F0EFEB] flex items-center justify-center mb-5">
                  <b.icon className="w-7 h-7 text-[#333333]" strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-[#111111] text-base mb-2">{b.title}</h3>
                <p className="text-sm text-[#777777] leading-relaxed">{b.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STRIP ─── dark accent ───────────────────────────────────────────── */}
      <section className="bg-[#111111] py-16 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-2xl font-semibold text-white mb-3 tracking-tight">
            Built for investors who are just getting started
          </p>
          <p className="text-[#888888] text-base max-w-lg mx-auto">
            No jargon. No overwhelming dashboards. Just the right tools, explained clearly,
            personalised to you.
          </p>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="bg-[#F5F4F0] border-t border-[#E4E2DC] py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2.5 mb-3">
          <img
            src="/logo.png"
            alt="Mady Finance"
            className="w-5 h-5 object-contain opacity-40"
            draggable={false}
          />
          <span className="text-[#AAAAAA] text-xs font-medium tracking-wide">Mady Finance</span>
        </div>
        <p className="text-[#BBBBBB] text-xs">
          © 2025 Mady Finance · Not financial advice · For educational purposes only
        </p>
      </footer>
    </div>
  )
}
