import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, TrendingUp } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, MetricCard } from '@/components/ui'

type Mode = 'signin' | 'signup' | 'reset'

export function AuthPage() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      } else if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name')
          setLoading(false)
          return
        }
        const { error } = await signUp(email, password, fullName)
        if (error) setError(error.message)
        else setSuccess('Account created. Check your email to verify, or sign in now.')
      }
    } finally {
      setLoading(false)
    }
  }

  const HERO_METRICS = [
    { label: 'Portfolio Score', value: '84/100', color: '#10b981' },
    { label: 'Sharpe Ratio', value: '1.82', color: '#3b82f6' },
    { label: 'Opportunities', value: '12 Found', color: '#06b6d4' },
    { label: 'Risk Level', value: 'Moderate', color: '#f59e0b' },
  ]

  return (
    <div className="min-h-screen flex bg-[#09090f]">
      {/* Left panel - Hero section */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.4) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(6,182,212,0.3) 0%, transparent 50%)',
          }}
        />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-xl bg-[#3b82f6] flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[#f1f5f9]">Investor Intelligence OS</span>
          </div>

          {/* Hero text */}
          <div>
            <h1 className="text-5xl font-bold text-[#f1f5f9] leading-tight mb-6">
              Your personal
              <br />
              <span className="gradient-text">investment</span>
              <br />
              <span className="gradient-text">operating system</span>
            </h1>
            <p className="text-[#64748b] text-lg leading-relaxed">
              Institutional-grade analytics. Behavioral finance insights. Personalized to your investor DNA.
            </p>
          </div>
        </div>

        {/* Hero metrics */}
        <div className="relative z-10 grid grid-cols-2 gap-4">
          {HERO_METRICS.map(item => (
            <MetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              className="bg-[rgba(15,15,26,0.8)] border-[rgba(255,255,255,0.05)]"
            />
          ))}
        </div>
      </div>

      {/* Right panel - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10 justify-center">
            <div className="w-8 h-8 rounded-xl bg-[#3b82f6] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#f1f5f9]">Investor OS</span>
          </div>

          {/* Form title */}
          <h2 className="text-2xl font-bold text-[#f1f5f9] mb-2">
            {mode === 'signin'
              ? 'Welcome back'
              : mode === 'signup'
                ? 'Create your account'
                : 'Reset password'}
          </h2>
          <p className="text-[#64748b] text-sm mb-8">
            {mode === 'signin'
              ? 'Sign in to your Investor Intelligence OS'
              : mode === 'signup'
                ? 'Start building smarter investment decisions'
                : "We'll send a reset link to your email"}
          </p>

          {/* Error alert */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[10px] p-3 mb-5 border"
              style={{
                background: 'rgba(239,68,68,0.1)',
                borderColor: 'rgba(239,68,68,0.3)',
              }}
            >
              <p className="text-[#ef4444] text-sm">{error}</p>
            </motion.div>
          )}

          {/* Success alert */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[10px] p-3 mb-5 border"
              style={{
                background: 'rgba(16,185,129,0.1)',
                borderColor: 'rgba(16,185,129,0.3)',
              }}
            >
              <p className="text-[#10b981] text-sm">{success}</p>
            </motion.div>
          )}

          {/* Form */}
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

            {mode !== 'reset' && (
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
                    className="cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
              />
            )}

            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('reset')
                    setError(null)
                  }}
                  className="text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-6">
              {mode === 'signin'
                ? 'Sign in'
                : mode === 'signup'
                  ? 'Create account'
                  : 'Send reset link'}
            </Button>
          </form>

          {/* Mode toggle */}
          <p className="text-center text-sm text-[#64748b] mt-6">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup')
                    setError(null)
                  }}
                  className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signin')
                    setError(null)
                  }}
                  className="text-[#3b82f6] hover:text-[#60a5fa] font-medium transition-colors"
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
