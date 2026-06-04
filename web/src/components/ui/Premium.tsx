import { motion } from 'framer-motion'
import { Lock, Zap } from 'lucide-react'
import { Button } from './Button'
import { Badge } from './Badge'
import { cn } from '@/lib/utils'

interface PremiumLockProps {
  tier: 'plus' | 'pro'
  title: string
  description: string
  features?: string[]
  hasAccessCode?: boolean
  onUpgrade?: () => void
  onAccessCode?: () => void
  children?: React.ReactNode
  blur?: boolean
}

export function PremiumLock({
  tier,
  title,
  description,
  features = [],
  hasAccessCode = true,
  onUpgrade,
  onAccessCode,
  children,
  blur = true,
}: PremiumLockProps) {
  const color = tier === 'pro' ? '#f59e0b' : '#06b6d4'
  const bgColor = tier === 'pro' ? 'rgba(245,158,11,0.08)' : 'rgba(6,182,212,0.08)'

  return (
    <div className="relative w-full h-full">
      {blur && children && (
        <div className="filter blur-sm opacity-50 pointer-events-none">
          {children}
        </div>
      )}
      {children && !blur && children}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-[14px]"
        style={{ background: `${bgColor}` }}
      >
        <div className="text-center max-w-sm mx-auto p-6">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 flex-shrink-0"
            style={{ background: `${color}20`, color }}
          >
            {tier === 'pro' ? (
              <Zap className="w-7 h-7" />
            ) : (
              <Lock className="w-7 h-7" />
            )}
          </div>

          <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">{title}</h3>
          <p className="text-sm text-[#94a3b8] mb-4">{description}</p>

          {features.length > 0 && (
            <ul className="space-y-1.5 mb-5 text-left">
              {features.map((feature, i) => (
                <li key={i} className="text-xs text-[#94a3b8] flex items-center gap-2">
                  <span style={{ color }}>+</span> {feature}
                </li>
              ))}
            </ul>
          )}

          <div className="space-y-2">
            <Button onClick={onUpgrade} fullWidth>
              Upgrade to {tier === 'pro' ? 'Pro' : 'Plus'}
            </Button>

            {hasAccessCode && (
              <button
                onClick={onAccessCode}
                className="w-full text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
              >
                Have an access code?
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface PremiumBadgeProps {
  tier: 'plus' | 'pro'
  size?: 'sm' | 'md'
}

export function PremiumBadge({ tier, size = 'sm' }: PremiumBadgeProps) {
  return (
    <Badge
      variant={tier === 'pro' ? 'warning' : 'info'}
      size={size}
      className="uppercase font-bold"
    >
      {tier}
    </Badge>
  )
}

interface PremiumBannerProps {
  title: string
  description: string
  tier: 'plus' | 'pro'
  onUpgrade?: () => void
  onDismiss?: () => void
}

export function PremiumBanner({
  title,
  description,
  tier,
  onUpgrade,
  onDismiss,
}: PremiumBannerProps) {
  const color = tier === 'pro' ? '#f59e0b' : '#06b6d4'
  const bgColor = tier === 'pro' ? 'rgba(245,158,11,0.1)' : 'rgba(6,182,212,0.1)'

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-[12px] p-4 border flex items-start justify-between gap-4"
      style={{ background: bgColor, borderColor: color + '40' }}
    >
      <div className="flex-1">
        <h3 className="font-semibold text-[#f1f5f9] mb-1">{title}</h3>
        <p className="text-sm text-[#94a3b8]">{description}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        {onUpgrade && (
          <Button variant="primary" size="sm" onClick={onUpgrade}>
            Upgrade
          </Button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-3 py-1.5 text-sm font-medium text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer"
          >
            Dismiss
          </button>
        )}
      </div>
    </motion.div>
  )
}

interface AccessCodeInputProps {
  onSubmit?: (code: string) => Promise<void>
  loading?: boolean
}

export function AccessCodeInput({ onSubmit, loading = false }: AccessCodeInputProps) {
  const [code, setCode] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  async function handleSubmit() {
    if (!code.trim()) {
      setError('Please enter a valid access code')
      return
    }
    try {
      await onSubmit?.(code)
      setSuccess(true)
      setCode('')
      setError(null)
    } catch (err) {
      setError('Invalid access code')
      setSuccess(false)
    }
  }

  return (
    <div className="glass-card p-5 max-w-md">
      <h3 className="font-semibold text-[#f1f5f9] mb-1">Have an access code?</h3>
      <p className="text-sm text-[#94a3b8] mb-4">Enter your code to unlock premium features instantly.</p>

      {error && (
        <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-[8px] p-2.5 mb-3">
          <p className="text-xs text-[#ef4444]">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] rounded-[8px] p-2.5 mb-3">
          <p className="text-xs text-[#10b981]">Access code applied successfully!</p>
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter code"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          disabled={loading}
          className="flex-1 bg-[#0f0f1a] border border-[#1e1e3a] text-[#f1f5f9] rounded-[8px] px-3 py-2 text-sm placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-50"
        />
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!code.trim()}
          size="sm"
        >
          Apply
        </Button>
      </div>
    </div>
  )
}

import React from 'react'
