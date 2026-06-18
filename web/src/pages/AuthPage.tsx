import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, TrendingUp, CheckCircle, ArrowLeft, ShieldCheck, BarChart3, Target } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/ui'
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
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>

          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-3">
            Check your email
          </h2>
          <p className="text-base text-stone-500 dark:text-stone-400 leading-relaxed mb-2">
            We sent a confirmation link to
          </p>
          <p className="text-base font-semibold text-stone-900 dark:text-stone-100 mb-6 break-all">
            {confirmedEmail}
          </p>

          <div className={cn(
            'rounded-2xl p-5 text-left mb-8 space-y-4',
            'bg-white border border-stone-200 dark:bg-stone-900 dark:border-stone-800',
          )}>
            {[
              'Open the email from Investor Intelligence OS',
              'Click the "Confirm your account" link',
              "You'll be brought back here automatically",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5',
                  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-400',
                )}>
                  {i + 1}
                </span>
                <p className="text-sm text-stone-600 dark:text-stone-300">{step}</p>
              </div>
            ))}
          </div>

          <p className="text-sm text-stone-400 dark:text-stone-500 mb-6">
            Can't find it? Check your spam folder. The link expires in 24 hours.
          </p>

          <button
            onClick={() => { setMode('signin'); setError(null) }}
            className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors cursor-pointer"
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
    <div className="min-h-screen flex bg-stone-50 dark:bg-stone-950">

      {/* Left panel — Brand hero */}
      <div className={cn(
        'hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden',
        'bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800',
      )}>
        {/* Subtle warm gradient background */}
        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            background:
              'radial-gradient(ellipse at 20% 40%, rgba(2,132,199,0.15) 0%, transparent 60%),' +
              'radial-gradient(ellipse at 80% 80%, rgba(8,145,178,0.12) 0%, transparent 50%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">
              Investor Intelligence OS
            </span>
          </div>

          <h1 className="text-4xl font-bold text-stone-900 dark:text-stone-50 leading-tight mb-6">
            Your personal
            <br />
            <span className="gradient-text">investment</span>
            <br />
            <span className="gradient-text">operating system</span>
          </h1>
          <p className="text-base text-stone-500 dark:text-stone-400 leading-relaxed">
            Institutional-grade analytics. Behavioural finance insights.
            Personalised to your investor profile.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-4">
          {FEATURES.map(f => (
            <div key={f.title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{f.title}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10">
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-stone-900 dark:text-stone-100">Investor OS</span>
          </div>

          <h2 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-base text-stone-500 dark:text-stone-400 mb-8">
            {mode === 'signin'
              ? 'Sign in to your Investor Intelligence OS'
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
                  className="cursor-pointer transition-colors text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              required
            />

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-6">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-sm text-stone-500 dark:text-stone-400 mt-6">
            {mode === 'signin' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(null) }}
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors cursor-pointer"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => { setMode('signin'); setError(null) }}
                  className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-semibold transition-colors cursor-pointer"
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
