import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Zap, Shield, Sparkles, ArrowRight, Tag, Circle as HelpCircle, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { PLANS, type Plan } from '@/lib/subscription'
import { useSubscription } from '@/context/SubscriptionContext'
import { AccessCodeModal } from '@/components/ui/UpgradeModal'

// ─── Plan card ────────────────────────────────────────────────────────────────

function PlanCard({ plan, current, onUpgrade, delay }: {
  plan: Plan
  current: boolean
  onUpgrade: (tier: 'plus' | 'pro') => void
  delay: number
}) {
  const isFree = plan.id === 'free'
  const savings = plan.originalPrice > 0
    ? Math.round((1 - plan.price / plan.originalPrice) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'relative rounded-[20px] border flex flex-col overflow-hidden',
        plan.popular
          ? 'border-[rgba(6,182,212,0.4)]'
          : 'border-[#1e1e3a]',
      )}
      style={{
        background: plan.popular
          ? 'linear-gradient(160deg, rgba(6,182,212,0.06) 0%, #0a0a14 60%)'
          : '#0a0a14',
        boxShadow: plan.popular ? '0 0 40px rgba(6,182,212,0.08)' : undefined,
      }}
    >
      {/* Top border glow for popular */}
      {plan.popular && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.8), transparent)' }}
        />
      )}

      {/* Popular badge */}
      {plan.popular && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide"
          style={{ background: plan.color, color: '#0a0a14' }}
        >
          Most Popular
        </div>
      )}

      <div className="p-6 flex-1">
        {/* Plan header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-[#f1f5f9]">{plan.name}</h3>
              {plan.badge && (
                <span
                  className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1"
                  style={{ background: '#10b98120', color: '#10b981' }}
                >
                  <Tag className="w-2 h-2" />
                  {plan.badge}
                </span>
              )}
              {current && (
                <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.08)] text-[#94a3b8]">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-[#475569]">{plan.tagline}</p>
          </div>
          <div
            className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${plan.color}15` }}
          >
            {plan.id === 'free'
              ? <Sparkles className="w-4.5 h-4.5" style={{ color: plan.color }} />
              : plan.id === 'plus'
              ? <Zap className="w-4 h-4" style={{ color: plan.color }} />
              : <Shield className="w-4 h-4" style={{ color: plan.color }} />
            }
          </div>
        </div>

        {/* Price */}
        <div className="mb-5">
          <div className="flex items-end gap-2">
            <span className="text-4xl font-bold text-[#f1f5f9]">
              {isFree ? 'Free' : `$${plan.price}`}
            </span>
            {!isFree && (
              <span className="text-[#475569] pb-1.5 text-sm">/month</span>
            )}
            {plan.originalPrice > 0 && (
              <span className="text-[#334155] pb-1.5 text-sm line-through">${plan.originalPrice}</span>
            )}
          </div>
          {plan.earlyBird && (
            <p className="text-[11px] text-[#10b981] mt-1">
              Save {savings}% — early bird price, locked in for life
            </p>
          )}
        </div>

        {/* Features */}
        <div className="space-y-2">
          {plan.features.map((feat, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className={cn(
                'w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                feat.included
                  ? `bg-[${plan.color}15]`
                  : 'bg-[rgba(255,255,255,0.04)]',
              )}
                style={feat.included ? { background: `${plan.color}15` } : undefined}
              >
                {feat.included
                  ? <Check className="w-2.5 h-2.5" style={{ color: plan.color }} />
                  : <span className="w-1.5 h-px rounded-full bg-[#2d2d4a]" />
                }
              </div>
              <span className={cn(
                'text-xs leading-relaxed',
                feat.included ? 'text-[#94a3b8]' : 'text-[#334155]',
              )}>
                {feat.label}
                {feat.note && feat.included && (
                  <span className="text-[#475569] ml-1">— {feat.note}</span>
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        {current ? (
          <div className="w-full py-3 rounded-[12px] text-center text-sm font-medium text-[#64748b] border border-[#1e1e3a]">
            Current plan
          </div>
        ) : isFree ? (
          <div className="w-full py-3 rounded-[12px] text-center text-sm font-medium text-[#64748b] border border-[#1e1e3a]">
            Always free
          </div>
        ) : (
          <button
            onClick={() => onUpgrade(plan.id as 'plus' | 'pro')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-semibold transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
              color: '#0a0a14',
              boxShadow: `0 4px 20px ${plan.color}25`,
            }}
          >
            {plan.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ─── FAQ ─────────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Is the early bird pricing permanent?',
    a: 'Yes. As long as you stay subscribed, your price is locked in at the early bird rate forever. It will never increase unless you cancel and resubscribe.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel anytime from Settings — your access continues until the end of your billing period with no fees or penalties.',
  },
  {
    q: 'What happens if I have an access code?',
    a: 'Access codes grant you free access to Plus or Pro features. They never expire unless stated, and you can use one without a credit card.',
  },
  {
    q: 'Is my financial data secure?',
    a: 'All data is encrypted at rest and in transit. We never share your portfolio data with third parties. Payments are processed by Stripe — we never see your card number.',
  },
  {
    q: 'Can I switch between Plus and Pro?',
    a: 'Yes. You can upgrade or downgrade at any time. Upgrades take effect immediately; downgrades take effect at the next billing cycle.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-[#1a1a2e] last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group"
      >
        <span className="text-sm font-medium text-[#e2e8f0] group-hover:text-white transition-colors">{q}</span>
        <ChevronDown className={cn('w-4 h-4 text-[#475569] flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="pb-4"
        >
          <p className="text-sm text-[#64748b] leading-relaxed">{a}</p>
        </motion.div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PricingPage() {
  const { tier, openUpgrade } = useSubscription()
  const navigate = useNavigate()
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const { redeemCode } = useSubscription()

  function handleUpgrade(targetTier: 'plus' | 'pro') {
    openUpgrade(undefined, targetTier)
  }

  return (
    <div className="min-h-screen pb-20" style={{ background: '#07070f' }}>
      {/* Header */}
      <div className="text-center pt-14 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.08)] text-xs font-medium text-[#60a5fa] mb-5"
        >
          <Tag className="w-3 h-3" />
          Early bird pricing — limited time
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl md:text-5xl font-bold text-[#f1f5f9] mb-3 tracking-tight"
        >
          Invest smarter.{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #06b6d4, #3b82f6)' }}>
            Pay less.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-[#64748b] text-lg max-w-xl mx-auto leading-relaxed"
        >
          Institutional-grade tools built for individual investors.
          Start free, upgrade when you're ready.
        </motion.p>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-center gap-6 mt-6 flex-wrap"
        >
          {[
            'No credit card for Free',
            'Cancel anytime',
            'Early bird locked in for life',
          ].map(s => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-[#475569]">
              <Check className="w-3 h-3 text-[#10b981]" />
              {s}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Plans grid */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              current={tier === plan.id}
              onUpgrade={handleUpgrade}
              delay={i * 0.07}
            />
          ))}
        </div>

        {/* Access code */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-8"
        >
          <button
            onClick={() => setCodeModalOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors cursor-pointer"
          >
            <Tag className="w-4 h-4" />
            Have an access code? Redeem it free — no credit card needed
          </button>
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-16"
        >
          <h2 className="text-xl font-bold text-[#f1f5f9] text-center mb-8">Full Feature Comparison</h2>
          <div className="rounded-[16px] border border-[#1e1e3a] overflow-hidden">
            {/* Header row */}
            <div className="grid grid-cols-4 bg-[#0a0a14]">
              <div className="p-4 border-r border-[#1e1e3a]">
                <span className="text-xs text-[#475569] uppercase tracking-wider font-semibold">Feature</span>
              </div>
              {PLANS.map(plan => (
                <div key={plan.id} className="p-4 text-center border-r border-[#1e1e3a] last:border-0">
                  <span className="text-sm font-bold" style={{ color: plan.color }}>{plan.name}</span>
                </div>
              ))}
            </div>

            {[
              { label: 'Investor DNA', free: true, plus: true, pro: true },
              { label: 'Portfolio Tracking', free: true, plus: true, pro: true },
              { label: 'Stock Analysis', free: '5/day', plus: 'Unlimited', pro: 'Unlimited' },
              { label: 'Portfolio Doctor', free: false, plus: true, pro: true },
              { label: 'Discovery Engine', free: false, plus: true, pro: true },
              { label: 'Goal Planner', free: false, plus: true, pro: true },
              { label: 'News Intelligence', free: false, plus: true, pro: true },
              { label: 'Fund Analysis', free: false, plus: true, pro: true },
              { label: 'Smart Alerts', free: false, plus: false, pro: true },
              { label: 'Stress Testing', free: false, plus: false, pro: true },
              { label: 'Insider Activity', free: false, plus: false, pro: true },
              { label: 'AI Coach', free: false, plus: false, pro: true },
            ].map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 border-t border-[#0f0f1a] hover:bg-[rgba(255,255,255,0.01)] transition-colors"
              >
                <div className="p-3.5 px-4 border-r border-[#1e1e3a]">
                  <span className="text-sm text-[#94a3b8]">{row.label}</span>
                </div>
                {(['free', 'plus', 'pro'] as const).map(planId => {
                  const val = row[planId]
                  const plan = PLANS.find(p => p.id === planId)!
                  return (
                    <div key={planId} className="p-3.5 text-center border-r border-[#0f0f1a] last:border-0 flex items-center justify-center">
                      {typeof val === 'string' ? (
                        <span className="text-xs font-medium" style={{ color: plan.color }}>{val}</span>
                      ) : val ? (
                        <Check className="w-4 h-4" style={{ color: plan.color }} />
                      ) : (
                        <span className="w-3 h-px bg-[#1e1e3a] rounded-full" />
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 max-w-2xl mx-auto"
        >
          <h2 className="text-xl font-bold text-[#f1f5f9] text-center mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#475569]" />
            Frequently Asked Questions
          </h2>
          <div className="rounded-[16px] border border-[#1e1e3a] divide-y divide-[#0f0f1a] px-5">
            {FAQS.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-center mt-14"
        >
          <p className="text-[#475569] text-sm mb-4">
            Questions? Email us at{' '}
            <span className="text-[#3b82f6]">support@investoros.app</span>
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-[#475569] hover:text-[#94a3b8] transition-colors cursor-pointer"
          >
            ← Go back
          </button>
        </motion.div>
      </div>

      {/* Access code modal */}
      {codeModalOpen && (
        <AccessCodeModal
          onClose={() => setCodeModalOpen(false)}
          onRedeem={redeemCode}
        />
      )}
    </div>
  )
}
