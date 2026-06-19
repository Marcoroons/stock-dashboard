import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle, ArrowLeft, ShieldCheck, BarChart3, Target } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/ui'
import { MadyLogo } from '@/components/ui/MadyLogo'
import { cn } from '@/lib/utils'

type Mode = 'signin' | 'signup' | 'email_sent'

const FEATURES = [
  {
    icon: BarChart3,
    title: 'Smart Portfolio Tracking',
    desc: 'Track all your holdings in one place with real-time prices.',
  },
  {
    icon: ShieldCheck,
    title: 'Investor DNA Profile',
    desc: 'Personalised risk analysis based on your financial goals.',
  },
  {
    icon: Target,
    title: 'Life Goals Planning',
    desc: 'Map your investments to your life milestones and targets.',
  },
]

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmedEmail, setConfirmedEmail] = useState('')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else if (mode === 'signup') {
        if (!fullName.trim()) { setError('Please enter your full name'); return }
        if (password.length < 8) { setError('Password must be at least 8 characters'); return }
        const { error, needsConfirmation } = await signUp(email, password, fullName)
        if (error) {
          setError(error.message)
        } else if (needsConfirmation) {
          setConfirmedEmail(email)
          setMode('email_sent')
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // ── Email confirmation screen ──────────────────────────────────────────────
  if (mode === 'email_sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F4F0] dark:bg-[#0A0A0A] p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-[#0C0A09] dark:text-white mb-3">
            Check your email
          </h2>
          <p className="text-base text-[#0C0A09]/50 dark:text-white/45 leading-relaxed mb-2">
            We sent a confirmation link to
          </p>
          <p className="text-base font-semibold text-[#0C0A09] dark:text-white mb-6 break-all">
            {confirmedEmail}
          </p>

          <div className={cn(
            'rounded-2xl p-5 text-left mb-8 space-y-4',
            'bg-white border border-[#0C0A09]/10 dark:bg-[#111] dark:border-white/10',
          )}>
            {[
              'Open the email from Mady Finance',
              'Click the "Confirm your account" link',
              "You'll be brought back here automatically",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                  'bg-[#0C0A09]/8 text-[#0C0A09]/70 dark:bg-white/8 dark:text-white/60',
                )}>
                  {i + 1}
                </span>
                <p className="text-sm text-[#0C0A09]/55 dark:text-white/45">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-[#0C0A09]/35 dark:text-white/30 mb-6">
            Can&apos;t find it? Check your spam folder. The link expires in 24 hours.
          </p>

          <button
            onClick={() => { setMode('signin'); setError(null) }}
            className="inline-flex items-center gap-2 text-sm text-[#0C0A09]/60 dark:text-white/50 hover:text-[#0C0A09] dark:hover:text-white font-medium transition-colors duration-200 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to sign in
          </button>
        </motion.div>
      </div>
    )
  }

  // ── Sign in / Sign up form ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#F5F4F0] dark:bg-[#0A0A0A]">

      {/* Left panel — always dark, brand hero */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden bg-[#080808]">
        {/* Subtle depth gradient */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 70% 50% at 25% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)',
          }}
        />

        {/* Logo + wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <MadyLogo className="w-9 h-9 text-white opacity-80" />
            <span className="text-white/70 text-xs tracking-[0.22em] uppercase font-light">
              Mady Finance
            </span>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-6">
            Your personal
            <br />
            <span className="text-white/50">investment</span>
            <br />
            <span className="text-white/50">operating system</span>
          </h1>
          <p className="text-base text-white/30 leading-relaxed">
            Institutional-grade analytics. Behavioural finance insights.
            Personalised to your investor profile.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(f => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/8 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-white/55" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white/80">{f.title}</p>
                <p className="text-sm text-white/35 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 bg-[#F5F4F0] dark:bg-[#0A0A0A]">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10 justify-center">
            <MadyLogo className="w-8 h-8 text-[#0C0A09] dark:text-white" />
            <span className="text-sm text-[#0C0A09] dark:text-white tracking-[0.2em] uppercase font-light">
              Mady Finance
            </span>
          </div>

          <h2 className="text-2xl font-bold text-[#0C0A09] dark:text-white mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-base text-[#0C0A09]/45 dark:text-white/40 mb-8">
            {mode === 'signin'
              ? 'Sign in to Mady Finance'
              : "Start building smarter decisions — it's free"}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'rounded-xl p-4 mb-5 border',
                'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
              )}
            >
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full name"
                placeholder="Your name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4" />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder={mode === 'signup' ? 'Create a password (8+ characters)' : 'Your password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              icon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="cursor-pointer transition-colors text-[#0C0A09]/35 dark:text-white/30 hover:text-[#0C0A09] dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Button
              type="submit"
              loading={loading}
              fullWidth
              size="lg"
              className="mt-6 !bg-[#0C0A09] !text-white hover:!opacity-90 dark:!bg-white dark:!text-[#0C0A09] !shadow-none focus-visible:!ring-[#0C0A09]/30 dark:focus-visible:!ring-white/30"
            >
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-[#0C0A09]/45 dark:text-white/40 mt-6">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(null) }}
                  className="text-[#0C0A09] dark:text-white font-semibold hover:opacity-60 transition-opacity duration-200 cursor-pointer"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(null) }}
                  className="text-[#0C0A09] dark:text-white font-semibold hover:opacity-60 transition-opacity duration-200 cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
