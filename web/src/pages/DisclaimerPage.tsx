import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, TrendingUp, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'

interface DisclaimerPageProps {
  onAccept: () => void
}

const POINTS = [
  'Past performance of any investment does not guarantee future results.',
  'All investments carry risk, including the potential loss of principal.',
  'Scores, projections, and recommendations are based on general models — not your specific financial situation.',
  'You are solely responsible for your own investment decisions.',
  'This platform does not manage money, execute trades, or hold assets on your behalf.',
]

export function DisclaimerPage({ onAccept }: DisclaimerPageProps) {
  const { signOut } = useAuth()
  const [checked, setChecked] = useState(false)

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-sky-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-stone-900 dark:text-stone-100">Investor Intelligence OS</span>
        </div>

        <div className={cn(
          'rounded-2xl p-6 sm:p-8',
          'bg-white border border-stone-200 dark:bg-stone-900 dark:border-stone-800',
        )}>
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-sky-600 dark:text-sky-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-900 dark:text-stone-50">Before you get started</h1>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">A quick, important note on how we work</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 text-sm leading-relaxed mb-7">
            <p className="text-stone-600 dark:text-stone-300">
              <span className="font-semibold text-stone-900 dark:text-stone-100">Investor Intelligence OS is an educational platform</span>{' '}
              designed to help you learn, explore, and understand your personal investment approach. We&apos;re here to
              empower you with knowledge — not to tell you what to do with your money.
            </p>

            <div className={cn(
              'rounded-xl p-4 border',
              'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800',
            )}>
              <div className="flex gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-700 dark:text-amber-400 mb-1">Not financial advice</p>
                  <p className="text-amber-700/80 dark:text-amber-300/70 text-sm">
                    Everything on this platform — scores, recommendations, analysis, and alerts — is for educational and
                    informational purposes only. Nothing here constitutes financial, investment, tax, or legal advice.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-stone-500 dark:text-stone-400">Here&apos;s what you should know:</p>

            <ul className="space-y-2.5">
              {POINTS.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-stone-600 dark:text-stone-300">
                  <span className="text-stone-300 dark:text-stone-600 mt-1 flex-shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <p className="text-stone-600 dark:text-stone-300">
              Think of us as a knowledgeable friend who can help you make sense of the markets — not a licensed
              financial advisor. If you have specific financial needs, please consult a qualified professional.
            </p>

            <p className="text-stone-400 dark:text-stone-500 text-xs">
              By continuing, you confirm you have read and understood this notice.
            </p>
          </div>

          {/* Checkbox */}
          <div
            onClick={() => setChecked(c => !c)}
            className="flex items-start gap-3 mb-6 cursor-pointer group select-none"
          >
            <div
              className={cn(
                'w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all mt-0.5',
                checked
                  ? 'bg-sky-600 border-sky-600 dark:bg-sky-500 dark:border-sky-500'
                  : 'border-stone-300 group-hover:border-stone-400 dark:border-stone-600 dark:group-hover:border-stone-500',
              )}
            >
              {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              I understand that this platform provides educational information only and is{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">not financial advice</span>.
              I take full responsibility for my own investment decisions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onAccept} disabled={!checked} fullWidth size="lg">
              I understand — let&apos;s get started
            </Button>
            <Button
              variant="secondary"
              onClick={() => signOut()}
              className="sm:flex-shrink-0 whitespace-nowrap"
            >
              Sign out
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
