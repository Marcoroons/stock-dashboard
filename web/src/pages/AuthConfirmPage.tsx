import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, MotionConfig } from 'framer-motion'
import { CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { MadyLogo } from '@/components/ui/MadyLogo'
import { cn } from '@/lib/utils'

type Status = 'loading' | 'success' | 'error'

export function AuthConfirmPage() {
  const navigate = useNavigate()
  const [status, setStatus] = useState<Status>('loading')
  const [countdown, setCountdown] = useState(4)
  const [errorMsg, setErrorMsg] = useState('')

  // Handle the Supabase email confirmation callback.
  // Supabase supports two flows:
  //   PKCE:     ?code=xxx  → exchangeCodeForSession
  //   Implicit: #access_token=xxx  → picked up automatically by onAuthStateChange
  //   New OTP:  ?token_hash=xxx&type=email → verifyOtp
  useEffect(() => {
    let cancelled = false

    async function confirm() {
      try {
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const tokenHash = params.get('token_hash')
        const type = params.get('type') as 'signup' | 'email' | null

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) throw error
        } else if (tokenHash && type) {
          const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
          if (error) throw error
        } else {
          // Implicit flow — Supabase JS automatically parses the hash fragment.
          // Wait briefly for onAuthStateChange to fire.
          await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('No session established')), 6000)
            const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
              if (session) {
                clearTimeout(timeout)
                subscription.unsubscribe()
                resolve()
              }
            })
            // Also check if session is already present (hash already consumed)
            supabase.auth.getSession().then(({ data: { session } }) => {
              if (session) {
                clearTimeout(timeout)
                subscription.unsubscribe()
                resolve()
              }
            })
          })
        }

        if (!cancelled) setStatus('success')
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err instanceof Error ? err.message : 'Confirmation failed')
          setStatus('error')
        }
      }
    }

    confirm()
    return () => { cancelled = true }
  }, [])

  // Countdown + auto-redirect once confirmed
  useEffect(() => {
    if (status !== 'success') return
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          navigate('/dashboard', { replace: true })
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [status, navigate])

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F4F0] dark:bg-[#080808] px-6">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-16"
        >
          <MadyLogo className="w-8 h-8 text-[#0C0A09] dark:text-white opacity-70" />
          <span className="text-xs tracking-[0.22em] uppercase font-light text-[#0C0A09]/50 dark:text-white/40">
            Mady Finance
          </span>
        </motion.div>

        {/* Status card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md text-center"
        >
          {status === 'loading' && <LoadingState />}
          {status === 'success' && <SuccessState countdown={countdown} onContinue={() => navigate('/dashboard', { replace: true })} />}
          {status === 'error' && <ErrorState message={errorMsg} onRetry={() => navigate('/auth/confirm', { replace: true })} onSignIn={() => navigate('/', { replace: true })} />}
        </motion.div>

        {/* Footer */}
        <p className="mt-16 text-xs text-[#0C0A09]/30 dark:text-white/25">
          © {new Date().getFullYear()} Mady Finance. All rights reserved.
        </p>
      </div>
    </MotionConfig>
  )
}

// ── Sub-states ────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-[#0C0A09]/8 dark:text-white/8"
          />
          <circle
            cx="32" cy="32" r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="176"
            strokeDashoffset="132"
            className="text-[#0C0A09]/40 dark:text-white/40 animate-spin origin-center"
            style={{ animationDuration: '1.2s' }}
          />
        </svg>
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#0C0A09] dark:text-white mb-2">
          Confirming your account
        </h2>
        <p className="text-sm text-[#0C0A09]/50 dark:text-white/40">
          Just a moment while we verify your email address...
        </p>
      </div>
    </div>
  )
}

function SuccessState({ countdown, onContinue }: { countdown: number; onContinue: () => void }) {
  const progress = ((4 - countdown) / 4) * 100

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
        className="w-20 h-20 rounded-full bg-[#0C0A09]/6 dark:bg-white/6 border border-[#0C0A09]/10 dark:border-white/10 flex items-center justify-center"
      >
        <CheckCircle className="w-9 h-9 text-[#0C0A09]/70 dark:text-white/65" />
      </motion.div>

      {/* Text */}
      <div>
        <h2 className="text-2xl font-bold text-[#0C0A09] dark:text-white mb-3">
          Email confirmed
        </h2>
        <p className="text-base text-[#0C0A09]/55 dark:text-white/45 leading-relaxed">
          Thank you for signing up to Mady Finance.
          <br />
          You will be automatically redirected to your dashboard.
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-xs">
        <div className="h-px bg-[#0C0A09]/10 dark:bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#0C0A09]/40 dark:bg-white/40 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
        <p className="text-xs text-[#0C0A09]/35 dark:text-white/30 mt-2 text-center">
          Redirecting in {countdown}s...
        </p>
      </div>

      {/* CTA */}
      <button
        onClick={onContinue}
        className={cn(
          'inline-flex items-center gap-2 px-6 py-3 rounded-[10px] text-sm font-semibold',
          'bg-[#0C0A09] dark:bg-white text-white dark:text-[#0C0A09]',
          'hover:opacity-85 active:scale-[0.98] transition-all duration-150 cursor-pointer',
        )}
      >
        Go to Dashboard
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )
}

function ErrorState({ message, onRetry, onSignIn }: {
  message: string
  onRetry: () => void
  onSignIn: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="w-20 h-20 rounded-full bg-red-500/8 border border-red-500/15 flex items-center justify-center">
        <AlertCircle className="w-9 h-9 text-red-500/60" />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-[#0C0A09] dark:text-white mb-3">
          Confirmation failed
        </h2>
        <p className="text-sm text-[#0C0A09]/50 dark:text-white/40 leading-relaxed mb-2">
          This link may have expired or already been used. Confirmation links are valid for 24 hours.
        </p>
        {message && (
          <p className="text-xs text-red-500/60 font-mono mt-1">{message}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={onSignIn}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer transition-all duration-150',
            'bg-[#0C0A09] dark:bg-white text-white dark:text-[#0C0A09] hover:opacity-85 active:scale-[0.98]',
          )}
        >
          Sign in
        </button>
        <button
          onClick={onRetry}
          className={cn(
            'flex-1 px-4 py-2.5 rounded-[10px] text-sm font-medium cursor-pointer transition-all duration-150',
            'border border-[#0C0A09]/15 dark:border-white/15 text-[#0C0A09]/60 dark:text-white/50',
            'hover:border-[#0C0A09]/30 dark:hover:border-white/30 hover:text-[#0C0A09] dark:hover:text-white',
          )}
        >
          Try again
        </button>
      </div>
    </div>
  )
}
