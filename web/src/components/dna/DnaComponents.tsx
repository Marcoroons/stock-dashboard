import { motion } from 'framer-motion'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { EmotionalProfile, WealthStyle, TimeHorizon, RiskTolerance } from '@/types/database'

interface DnaProfileCardProps {
  profile: {
    emotional: EmotionalProfile
    wealth: WealthStyle
    horizon: TimeHorizon
    risk: RiskTolerance
    score: number
  }
  className?: string
}

const EMOTIONAL_PROFILES = {
  panic_seller: {
    label: 'Panic Seller',
    description: 'Tends to sell during downturns',
    color: '#ef4444',
    icon: '📉',
  },
  cautious: {
    label: 'Cautious Investor',
    description: 'Conservative, risk-aware',
    color: '#f59e0b',
    icon: '⚠️',
  },
  rational: {
    label: 'Rational Investor',
    description: 'Data-driven, disciplined',
    color: '#3b82f6',
    icon: '📊',
  },
  conviction: {
    label: 'Conviction Investor',
    description: 'High conviction, long-term',
    color: '#10b981',
    icon: '💎',
  },
}

const WEALTH_STYLES = {
  preservation: {
    label: 'Wealth Preservation',
    description: 'Focus on capital safety',
    color: '#6366f1',
  },
  income: {
    label: 'Income-Focused',
    description: 'Regular cash flow generation',
    color: '#ec4899',
  },
  balanced: {
    label: 'Balanced Growth',
    description: 'Steady growth with stability',
    color: '#06b6d4',
  },
  growth: {
    label: 'Growth-Focused',
    description: 'Long-term wealth building',
    color: '#10b981',
  },
}

export function DnaProfileCard({ profile, className }: DnaProfileCardProps) {
  const emotional = EMOTIONAL_PROFILES[profile.emotional]
  const wealth = WEALTH_STYLES[profile.wealth]

  const scoreColor =
    profile.score >= 70 ? '#10b981' : profile.score >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card p-6', className)}
    >
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-[#f1f5f9] mb-1">Your Investor DNA</h3>
          <p className="text-sm text-[#94a3b8]">
            Behavioral profile personalized to your investing style
          </p>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="text-3xl font-bold" style={{ color: scoreColor }}>
            {profile.score}
          </p>
          <p className="text-xs text-[#64748b]">Score</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Emotional Profile */}
        <div className="rounded-[10px] p-4" style={{ background: `${emotional.color}15` }}>
          <div className="text-2xl mb-2">{emotional.icon}</div>
          <p className="text-xs text-[#64748b] uppercase tracking-wide mb-1">Profile</p>
          <p className="font-semibold text-[#f1f5f9]" style={{ color: emotional.color }}>
            {emotional.label}
          </p>
          <p className="text-xs text-[#94a3b8] mt-1">{emotional.description}</p>
        </div>

        {/* Wealth Style */}
        <div className="rounded-[10px] p-4" style={{ background: `${wealth.color}15` }}>
          <div className="text-2xl mb-2">💰</div>
          <p className="text-xs text-[#64748b] uppercase tracking-wide mb-1">Style</p>
          <p className="font-semibold text-[#f1f5f9]" style={{ color: wealth.color }}>
            {wealth.label}
          </p>
          <p className="text-xs text-[#94a3b8] mt-1">{wealth.description}</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-[#1e1e3a]">
        <p className="text-xs text-[#64748b] uppercase tracking-wide mb-2">Risk Profile</p>
        <div className="flex gap-2">
          <Badge variant="ghost">{profile.horizon} term</Badge>
          <Badge variant="ghost">{profile.risk}</Badge>
        </div>
      </div>
    </motion.div>
  )
}

interface DnaCompatibilityProps {
  score: number
  label?: string
  details?: string
}

export function DnaCompatibility({ score, label, details }: DnaCompatibilityProps) {
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const bgColor = score >= 70 ? 'rgba(16,185,129,0.08)' : score >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)'

  return (
    <div className="rounded-[10px] p-4" style={{ background: bgColor, border: `1px solid ${color}30` }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-[#f1f5f9]">{label || 'DNA Match'}</p>
        <span className="text-lg font-bold" style={{ color }}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-[#0f0f1a] rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
      {details && <p className="text-xs text-[#94a3b8] mt-2">{details}</p>}
    </div>
  )
}

interface DnaArchetypeProps {
  archetype: string
  description: string
  strengths: string[]
  challenges: string[]
}

export function DnaArchetype({
  archetype,
  description,
  strengths,
  challenges,
}: DnaArchetypeProps) {
  return (
    <Card>
      <h3 className="font-semibold text-[#f1f5f9] mb-1">{archetype}</h3>
      <p className="text-sm text-[#94a3b8] mb-4">{description}</p>

      <div className="space-y-3">
        <div>
          <p className="text-xs font-semibold text-[#10b981] uppercase tracking-wide mb-2">Strengths</p>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-xs text-[#94a3b8] flex items-start gap-2">
                <span className="text-[#10b981] flex-shrink-0">+</span> {s}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold text-[#ef4444] uppercase tracking-wide mb-2">Challenges</p>
          <ul className="space-y-1">
            {challenges.map((c, i) => (
              <li key={i} className="text-xs text-[#94a3b8] flex items-start gap-2">
                <span className="text-[#ef4444] flex-shrink-0">-</span> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}

interface RiskProfileIndicatorProps {
  level: RiskTolerance
  showLabel?: boolean
}

export function RiskProfileIndicator({
  level,
  showLabel = true,
}: RiskProfileIndicatorProps) {
  const profiles: Record<RiskTolerance, { label: string; color: string; icon: string }> = {
    very_conservative: { label: 'Very Conservative', color: '#3b82f6', icon: '🛡️' },
    conservative: { label: 'Conservative', color: '#06b6d4', icon: '🏦' },
    moderate: { label: 'Moderate', color: '#f59e0b', icon: '⚖️' },
    growth: { label: 'Growth', color: '#06d6d6', icon: '📈' },
    aggressive: { label: 'Aggressive', color: '#10b981', icon: '🚀' },
  }

  const profile = profiles[level]

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{profile.icon}</span>
      {showLabel && (
        <div>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wide">Risk</p>
          <p className="text-sm font-medium text-[#f1f5f9]" style={{ color: profile.color }}>
            {profile.label}
          </p>
        </div>
      )}
    </div>
  )
}
