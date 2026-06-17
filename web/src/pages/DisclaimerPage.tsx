import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, TrendingUp, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

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
    <div className="min-h-screen flex items-center justify-center bg-[#09090f] p-4 sm:p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-xl bg-[#3b82f6] flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#f1f5f9] truncate">Investor Intelligence OS</span>
        </div>

        <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-2xl p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-start gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[rgba(59,130,246,0.12)] border border-[rgba(59,130,246,0.2)] flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[#3b82f6]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-[#f1f5f9]">Before you get started</h1>
              <p className="text-sm text-[#64748b] mt-0.5">A quick, important note on how we work</p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-4 text-sm text-[#94a3b8] leading-relaxed mb-7">
            <p>
              <span className="text-[#f1f5f9] font-medium">Investor Intelligence OS is an educational platform</span>{' '}
              designed to help you learn, explore, and understand your personal investment approach. We're here to
              empower you with knowledge — not to tell you what to do with your money.
            </p>

            <div className="bg-[rgba(245,158,11,0.07)] border border-[rgba(245,158,11,0.18)] rounded-xl p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[#f59e0b] font-medium mb-1">Not financial advice</p>
                  <p className="text-[#94a3b8] text-sm">
                    Everything on this platform — scores, recommendations, analysis, and alerts — is for educational and
                    informational purposes only. Nothing here constitutes financial, investment, tax, or legal advice.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[#64748b]">Here's what you should know:</p>

            <ul className="space-y-2.5">
              {POINTS.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-[#334155] mt-1 flex-shrink-0">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <p>
              Think of us as a knowledgeable friend who can help you make sense of the markets — not a licensed
              financial advisor. If you have specific financial needs, please consult a qualified professional.
            </p>

            <p className="text-[#475569] text-xs">
              By continuing, you confirm you have read and understood this notice.
            </p>
          </div>

          {/* Checkbox */}
          <div
            onClick={() => setChecked(c => !c)}
            className="flex items-start gap-3 mb-6 cursor-pointer group select-none"
          >
            <div
              className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all mt-0.5 ${
                checked
                  ? 'bg-[#3b82f6] border-[#3b82f6]'
                  : 'border-[#334155] group-hover:border-[#475569]'
              }`}
            >
              {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
            </div>
            <p className="text-sm text-[#94a3b8] leading-relaxed">
              I understand that this platform provides educational information only and is{' '}
              <span className="text-[#f1f5f9]">not financial advice</span>. I take full responsibility for my own
              investment decisions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={onAccept} disabled={!checked} fullWidth size="lg">
              I understand — let's get started
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
