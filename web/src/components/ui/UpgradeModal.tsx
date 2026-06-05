import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Zap, Lock, ArrowRight, Tag, Sparkles } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'
import { PLANS, FEATURE_LABELS, FEATURE_DESCRIPTIONS, type Plan } from '@/lib/subscription'
import type { FeatureAccess } from '@/types/database'

// ─── Upgrade Modal ────────────────────────────────────────────────────────────

interface UpgradeModalProps {
  targetTier: 'plus' | 'pro'
  feature?: keyof FeatureAccess
  onClose: () => void
  onCheckout: (tier: 'plus' | 'pro') => Promise<void>
  onAccessCode: () => void
  isLoading: boolean
}

export function UpgradeModal({
  targetTier,
  feature,
  onClose,
  onCheckout,
  onAccessCode,
  isLoading,
}: UpgradeModalProps) {
  const plan = PLANS.find(p => p.id === targetTier)!
  const isAnnualSavings = Math.round((1 - plan.price / plan.originalPrice) * 100)

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md rounded-[20px] border overflow-hidden"
          style={{
            background: '#0a0a14',
            borderColor: `${plan.color}40`,
            boxShadow: `0 0 60px ${plan.color}15, 0 24px 64px rgba(0,0,0,0.6)`,
          }}
        >
          {/* Ambient glow top */}
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${plan.color}80, transparent)` }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#1e1e3a] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] transition-colors cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="p-6 pb-0">
            {/* Icon */}
            <div
              className="w-12 h-12 rounded-[14px] flex items-center justify-center mb-4"
              style={{ background: `${plan.color}18` }}
            >
              {targetTier === 'pro'
                ? <Zap className="w-6 h-6" style={{ color: plan.color }} />
                : <Sparkles className="w-6 h-6" style={{ color: plan.color }} />
              }
            </div>

            {/* Feature context */}
            {feature && (
              <div
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                style={{ background: `${plan.color}15`, color: plan.color }}
              >
                <Lock className="w-3 h-3" />
                {FEATURE_LABELS[feature]} is {targetTier === 'pro' ? 'Pro' : 'Plus'} only
              </div>
            )}

            <h2 className="text-xl font-bold text-[#f1f5f9] mb-1">
              Unlock {targetTier === 'pro' ? 'Pro' : 'Plus'}
            </h2>
            {feature && (
              <p className="text-sm text-[#64748b] leading-relaxed">
                {FEATURE_DESCRIPTIONS[feature]}
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="px-6 pt-5">
            <div
              className="rounded-[14px] p-4 border"
              style={{ background: `${plan.color}08`, borderColor: `${plan.color}25` }}
            >
              <div className="flex items-end gap-2 mb-2">
                <div>
                  <span className="text-3xl font-bold text-[#f1f5f9]">${plan.price}</span>
                  <span className="text-[#64748b] text-sm ml-1">/month</span>
                </div>
                {plan.earlyBird && (
                  <div className="flex items-center gap-2 pb-1">
                    <span className="text-[#475569] text-sm line-through">${plan.originalPrice}/mo</span>
                    <span
                      className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ background: '#10b98120', color: '#10b981' }}
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {isAnnualSavings}% off
                    </span>
                  </div>
                )}
              </div>
              {plan.earlyBird && (
                <p className="text-[11px] text-[#475569]">
                  Early bird pricing — locked in for life while you stay subscribed
                </p>
              )}
            </div>
          </div>

          {/* Feature list */}
          <div className="px-6 pt-4">
            <p className="text-[10px] uppercase tracking-wider text-[#475569] font-semibold mb-2">
              What you unlock
            </p>
            <div className="space-y-1.5">
              {plan.features.filter(f => f.included).slice(0, 5).map((feat, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${plan.color}20` }}
                  >
                    <Check className="w-2.5 h-2.5" style={{ color: plan.color }} />
                  </div>
                  <span className="text-xs text-[#94a3b8]">
                    {feat.label}
                    {feat.note && <span className="text-[#475569] ml-1">— {feat.note}</span>}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="p-6 pt-5 space-y-2">
            <button
              onClick={() => onCheckout(targetTier)}
              disabled={isLoading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-semibold transition-all',
                isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90 cursor-pointer',
              )}
              style={{
                background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
                color: targetTier === 'plus' ? '#0a0a14' : '#0a0a14',
                boxShadow: `0 4px 20px ${plan.color}30`,
              }}
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              onClick={onAccessCode}
              className="w-full text-center text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors py-1 cursor-pointer"
            >
              Have an access code? Redeem it free
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Access Code Modal ────────────────────────────────────────────────────────

interface AccessCodeModalProps {
  onClose: () => void
  onRedeem: (code: string) => Promise<{ success: boolean; error?: string; tier?: string }>
}

export function AccessCodeModal({ onClose, onRedeem }: AccessCodeModalProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit() {
    if (!code.trim()) return
    setLoading(true)
    setError(null)
    try {
      const result = await onRedeem(code.trim())
      if (result.success) {
        setSuccess(`Access code applied! Your account has been upgraded to ${result.tier?.toUpperCase()}.`)
        setTimeout(onClose, 2000)
      } else {
        setError(result.error ?? 'Invalid code')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.18 }}
          className="w-full max-w-sm rounded-[18px] border border-[#1e1e3a] p-6 relative"
          style={{ background: '#0a0a14', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-[#1e1e3a] flex items-center justify-center text-[#64748b] hover:text-[#f1f5f9] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="w-10 h-10 rounded-[12px] bg-[rgba(59,130,246,0.15)] flex items-center justify-center mb-4">
            <Tag className="w-5 h-5 text-[#3b82f6]" />
          </div>

          <h3 className="text-base font-bold text-[#f1f5f9] mb-1">Redeem Access Code</h3>
          <p className="text-sm text-[#64748b] mb-5">Enter your code to unlock premium features instantly — no credit card needed.</p>

          {error && (
            <div className="rounded-[8px] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] p-3 mb-3">
              <p className="text-xs text-[#ef4444]">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-[8px] bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] p-3 mb-3">
              <p className="text-xs text-[#10b981] flex items-center gap-2">
                <Check className="w-3.5 h-3.5" /> {success}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="EARLYBIRD2026"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={loading || !!success}
              className="flex-1 bg-[#0f0f1a] border border-[#1e1e3a] text-[#f1f5f9] rounded-[9px] px-3 py-2.5 text-sm placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-50 font-mono tracking-wider"
            />
            <button
              onClick={handleSubmit}
              disabled={!code.trim() || loading || !!success}
              className={cn(
                'px-4 py-2.5 rounded-[9px] text-sm font-semibold transition-all cursor-pointer',
                (!code.trim() || loading || !!success)
                  ? 'opacity-40 cursor-not-allowed bg-[#1e1e3a] text-[#64748b]'
                  : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]',
              )}
            >
              {loading
                ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                : 'Apply'
              }
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Feature Gate — wraps any content behind a tier check ────────────────────

interface FeatureGateProps {
  feature: keyof FeatureAccess
  hasAccess: boolean
  onUpgrade: (feature: keyof FeatureAccess) => void
  children?: React.ReactNode
  blurPreview?: React.ReactNode
}

export function FeatureGate({
  feature,
  hasAccess,
  onUpgrade,
  children,
  blurPreview,
}: FeatureGateProps) {
  if (hasAccess) return <>{children}</>

  const plan = PLANS.find(p => p.id === (
    ['stressTesting', 'insiderActivity', 'advancedAnalytics', 'aiCoach'].includes(feature) ? 'pro' : 'plus'
  ))!

  return (
    <div className="relative w-full min-h-[60vh] flex flex-col">
      {/* Blurred preview */}
      {blurPreview && (
        <div className="filter blur-sm opacity-30 pointer-events-none select-none flex-1">
          {blurPreview}
        </div>
      )}

      {/* Lock overlay */}
      <div
        className={cn(
          'flex items-center justify-center',
          blurPreview ? 'absolute inset-0' : 'flex-1 py-20',
        )}
        style={{ backdropFilter: blurPreview ? 'blur(2px)' : undefined }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm mx-auto px-6"
        >
          <div
            className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-5"
            style={{ background: `${plan.color}15` }}
          >
            {plan.id === 'pro'
              ? <Zap className="w-8 h-8" style={{ color: plan.color }} />
              : <Lock className="w-8 h-8" style={{ color: plan.color }} />
            }
          </div>

          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase mb-3"
            style={{ background: `${plan.color}15`, color: plan.color }}
          >
            {plan.name} feature
          </div>

          <h3 className="text-lg font-bold text-[#f1f5f9] mb-2">{FEATURE_LABELS[feature]}</h3>
          <p className="text-sm text-[#64748b] leading-relaxed mb-6">
            {FEATURE_DESCRIPTIONS[feature]}
          </p>

          <button
            onClick={() => onUpgrade(feature)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[12px] text-sm font-semibold transition-all cursor-pointer hover:opacity-90"
            style={{
              background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
              color: '#0a0a14',
              boxShadow: `0 4px 20px ${plan.color}30`,
            }}
          >
            Unlock {plan.name} — ${plan.price}/mo
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[10px] text-[#475569] mt-2">
            {plan.earlyBird ? `Early bird pricing — was $${plan.originalPrice}/mo` : `14-day free trial included`}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
