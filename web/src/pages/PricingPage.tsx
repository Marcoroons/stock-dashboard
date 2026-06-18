import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Zap, Shield, Sparkles, ArrowRight, Tag, HelpCircle, ChevronDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/context/SubscriptionContext'
import { AccessCodeModal } from '@/components/ui/UpgradeModal'

// ─── Plan definitions ─────────────────────────────────────────────────────────

interface DisplayPlan {
  id: 'basic' | 'pro' | 'premium'
  name: string
  tagline: string
  monthlyPrice: number
  yearlyMonthly: number
  icon: React.FC<{ className?: string; strokeWidth?: number }>
  color: string
  colorBg: string
  popular?: boolean
  upgradeTarget: 'plus' | 'pro'
  features: string[]
}

const PLANS: DisplayPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    tagline: 'Essential tools for getting started',
    monthlyPrice: 9,
    yearlyMonthly: 7,
    icon: Sparkles,
    color: 'text-sky-600 dark:text-sky-400',
    colorBg: 'bg-sky-50 dark:bg-sky-900/20',
    upgradeTarget: 'plus',
    features: [
      'Investor DNA Assessment',
      'Portfolio Tracking',
      'Stock Analysis (10/day)',
      'Portfolio Doctor',
      'Life Goals Planner',
      'Academy & Investor Handbook',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    tagline: 'Deeper insights for active investors',
    monthlyPrice: 19,
    yearlyMonthly: 15,
    icon: Zap,
    color: 'text-violet-600 dark:text-violet-400',
    colorBg: 'bg-violet-50 dark:bg-violet-900/20',
    popular: true,
    upgradeTarget: 'pro',
    features: [
      'Everything in Basic',
      'Unlimited Stock Analysis',
      'AI Portfolio Builder',
      'Discovery Engine',
      'News Intelligence',
      'Fund Analysis',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'Institutional-grade tools for serious investors',
    monthlyPrice: 39,
    yearlyMonthly: 31,
    icon: Shield,
    color: 'text-amber-600 dark:text-amber-400',
    colorBg: 'bg-amber-50 dark:bg-amber-900/20',
    upgradeTarget: 'pro',
    features: [
      'Everything in Pro',
      'Smart Alerts & Watchlists',
      'Portfolio Stress Testing',
      'Insider Activity Tracker',
      'AI Coach',
      'Priority Support',
    ],
  },
]

const COMPARISON_ROWS = [
  { label: 'Investor DNA',        basic: true,          pro: true,          premium: true },
  { label: 'Portfolio Tracking',  basic: true,          pro: true,          premium: true },
  { label: 'Stock Analysis',      basic: '10/day',      pro: 'Unlimited',   premium: 'Unlimited' },
  { label: 'Portfolio Doctor',    basic: true,          pro: true,          premium: true },
  { label: 'Life Goals Planner',  basic: true,          pro: true,          premium: true },
  { label: 'AI Portfolio Builder',basic: false,         pro: true,          premium: true },
  { label: 'Discovery Engine',    basic: false,         pro: true,          premium: true },
  { label: 'News Intelligence',   basic: false,         pro: true,          premium: true },
  { label: 'Fund Analysis',       basic: false,         pro: true,          premium: true },
  { label: 'Smart Alerts',        basic: false,         pro: false,         premium: true },
  { label: 'Stress Testing',      basic: false,         pro: false,         premium: true },
  { label: 'Insider Activity',    basic: false,         pro: false,         premium: true },
  { label: 'AI Coach',            basic: false,         pro: false,         premium: true },
]

const FAQS = [
  {
    q: 'Is there a free trial?',
    a: 'Yes — every new account gets 10 days of full Pro access, no credit card required. You can explore everything before choosing a plan.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Absolutely. Cancel from Settings at any time — your access continues until the end of the billing period with no fees or penalties.',
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
    q: 'Can I switch plans?',
    a: 'Yes. Upgrade or downgrade at any time. Upgrades take effect immediately; downgrades apply at the next billing cycle.',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanCard({
  plan,
  yearly,
  onUpgrade,
  delay,
}: {
  plan: DisplayPlan
  yearly: boolean
  onUpgrade: (target: 'plus' | 'pro') => void
  delay: number
}) {
  const price = yearly ? plan.yearlyMonthly : plan.monthlyPrice
  const savings = Math.round((1 - plan.yearlyMonthly / plan.monthlyPrice) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: 'easeOut' }}
      className={cn(
        'relative flex flex-col rounded-2xl border overflow-hidden',
        plan.popular
          ? 'border-violet-300 dark:border-violet-700 shadow-lg shadow-violet-100 dark:shadow-violet-900/20'
          : 'border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-900',
      )}
    >
      {plan.popular && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
      )}
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide bg-violet-600 text-white shadow-sm">
          Most Popular
        </div>
      )}

      <div className="p-6 flex-1">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{plan.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{plan.tagline}</p>
          </div>
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', plan.colorBg)}>
            <plan.icon className={cn('w-5 h-5', plan.color)} strokeWidth={2} />
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-end gap-1.5">
            <AnimatePresence mode="wait">
              <motion.span
                key={price}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.18 }}
                className="text-4xl font-bold text-gray-900 dark:text-white"
              >
                ${price}
              </motion.span>
            </AnimatePresence>
            <span className="text-gray-400 dark:text-gray-500 pb-1.5 text-sm">/month</span>
          </div>
          {yearly && (
            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
              Save {savings}% — billed ${price * 12}/year
            </p>
          )}
        </div>

        <ul className="space-y-2.5">
          {plan.features.map(feat => (
            <li key={feat} className="flex items-start gap-2.5">
              <div className={cn('w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5', plan.colorBg)}>
                <Check className={cn('w-2.5 h-2.5', plan.color)} strokeWidth={3} />
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-6 pb-6">
        <button
          onClick={() => onUpgrade(plan.upgradeTarget)}
          className={cn(
            'w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer hover:opacity-90 active:scale-[0.98]',
            plan.popular
              ? 'bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30'
              : plan.id === 'premium'
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-sky-600 hover:bg-sky-700 text-white',
          )}
        >
          Get {plan.name}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer group"
      >
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
          {q}
        </span>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pb-4">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function BillingToggle({ yearly, onChange }: { yearly: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 justify-center">
      <span className={cn('text-sm font-medium transition-colors', !yearly ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500')}>
        Monthly
      </span>
      <button
        role="switch"
        aria-checked={yearly}
        onClick={() => onChange(!yearly)}
        className={cn(
          'relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2',
          yearly ? 'bg-sky-600' : 'bg-gray-200 dark:bg-gray-700',
        )}
      >
        <motion.span
          layout
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
          animate={{ left: yearly ? 28 : 4 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      </button>
      <span className={cn('text-sm font-medium transition-colors flex items-center gap-1.5', yearly ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500')}>
        Yearly
        <span className="text-[11px] font-bold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
          Save 20%
        </span>
      </span>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function PricingPage() {
  const { openUpgrade, redeemCode } = useSubscription()
  const navigate = useNavigate()
  const [yearly, setYearly]         = useState(false)
  const [codeModalOpen, setCodeModalOpen] = useState(false)

  function handleUpgrade(target: 'plus' | 'pro') {
    openUpgrade(undefined, target)
  }

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="text-center pt-14 pb-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-200 dark:border-sky-800 bg-sky-50 dark:bg-sky-900/20 text-xs font-medium text-sky-700 dark:text-sky-400 mb-5"
        >
          <Tag className="w-3 h-3" />
          10-day free trial on all plans
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight"
        >
          Simple, honest pricing
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto leading-relaxed mb-8"
        >
          Institutional-grade tools built for individual investors.
          Start with a free trial, upgrade when you're ready.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <BillingToggle yearly={yearly} onChange={setYearly} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-6 mt-6 flex-wrap"
        >
          {['10-day free trial', 'No credit card required', 'Cancel anytime'].map(s => (
            <div key={s} className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <Check className="w-3.5 h-3.5 text-green-500" strokeWidth={2.5} />
              {s}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Plans grid */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              yearly={yearly}
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
            className="inline-flex items-center gap-2 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors cursor-pointer font-medium"
          >
            <Tag className="w-4 h-4" />
            Have an access code? Redeem it free
          </button>
        </motion.div>

        {/* Feature comparison table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-16"
        >
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-8">Full Feature Comparison</h2>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900">
            {/* Header row */}
            <div className="grid grid-cols-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="p-4 border-r border-gray-200 dark:border-gray-700">
                <span className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-wider font-semibold">Feature</span>
              </div>
              {PLANS.map(plan => (
                <div key={plan.id} className="p-4 text-center border-r border-gray-200 dark:border-gray-700 last:border-0">
                  <span className={cn('text-sm font-bold', plan.color)}>{plan.name}</span>
                </div>
              ))}
            </div>

            {COMPARISON_ROWS.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
              >
                <div className="p-3.5 px-4 border-r border-gray-100 dark:border-gray-800">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{row.label}</span>
                </div>
                {(['basic', 'pro', 'premium'] as const).map(planId => {
                  const val  = row[planId]
                  const plan = PLANS.find(p => p.id === planId)!
                  return (
                    <div key={planId} className="p-3.5 text-center border-r border-gray-100 dark:border-gray-800 last:border-0 flex items-center justify-center">
                      {typeof val === 'string' ? (
                        <span className={cn('text-xs font-semibold', plan.color)}>{val}</span>
                      ) : val ? (
                        <Check className={cn('w-4 h-4', plan.color)} strokeWidth={2.5} />
                      ) : (
                        <span className="w-3 h-px bg-gray-200 dark:bg-gray-700 rounded-full" />
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
          <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6 flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-gray-400" />
            Frequently Asked Questions
          </h2>
          <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-5">
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
          <p className="text-gray-400 dark:text-gray-500 text-sm mb-4">
            Questions? Email us at{' '}
            <span className="text-sky-600 dark:text-sky-400">support@investoros.app</span>
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors cursor-pointer"
          >
            ← Go back
          </button>
        </motion.div>
      </div>

      {codeModalOpen && (
        <AccessCodeModal
          onClose={() => setCodeModalOpen(false)}
          onRedeem={redeemCode}
        />
      )}
    </div>
  )
}
