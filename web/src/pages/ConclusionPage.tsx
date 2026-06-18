import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Briefcase, BarChart3, PiggyBank, BookOpen, Trophy, Check, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface DnaProfile {
  volatility_tolerance: string
  wealth_style: string
  risk_score: number
  time_horizon: string
  knowledge_level: string
  [key: string]: unknown
}

interface ConclusionPageProps {
  dna: DnaProfile
  onContinue: () => void
  onViewPricing: () => void
}

// ─── Profile name generator ───────────────────────────────────────────────────

function getProfileName(dna: DnaProfile): string {
  const riskLabel: Record<string, string> = {
    very_conservative: 'Capital-Preserving',
    conservative:      'Conservative',
    moderate:          'Balanced',
    growth:            'Growth-Oriented',
    aggressive:        'Aggressive Growth',
  }
  const styleLabel: Record<string, string> = {
    preservation: 'Wealth Preserver',
    income:       'Income Investor',
    balanced:     'All-Weather Investor',
    growth:       'Growth Investor',
  }
  const risk  = riskLabel[dna.volatility_tolerance] ?? 'Balanced'
  const style = styleLabel[dna.wealth_style] ?? 'Investor'
  return `${risk} ${style}`
}

function getRiskColor(tolerance: string) {
  const map: Record<string, string> = {
    very_conservative: 'text-blue-600 dark:text-blue-400',
    conservative:      'text-sky-600 dark:text-sky-400',
    moderate:          'text-green-600 dark:text-green-400',
    growth:            'text-amber-600 dark:text-amber-400',
    aggressive:        'text-red-600 dark:text-red-400',
  }
  return map[tolerance] ?? 'text-sky-600 dark:text-sky-400'
}

// ─── Accordion item ───────────────────────────────────────────────────────────

interface AccordionItemProps {
  icon: React.FC<{ className?: string }>
  title: string
  description: string
  defaultOpen?: boolean
}

function AccordionItem({ icon: Icon, title, description, defaultOpen = false }: AccordionItemProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-3 py-4 text-left cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
            {title}
          </span>
        </div>
        <ChevronDown className={cn(
          'w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200',
          open && 'rotate-180',
        )} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed pb-4 pl-11">
              {description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Trial features ───────────────────────────────────────────────────────────

const TRIAL_FEATURES = [
  {
    icon: Trophy,
    title: '10 Days Full Pro Access',
    description: 'Every Pro feature unlocked — no restrictions. Explore the full platform before choosing a plan.',
  },
  {
    icon: Briefcase,
    title: 'AI Portfolio Builder',
    description: 'Generate a complete, personalised portfolio in minutes based on your investor DNA. Built for your market, your style, your risk level.',
  },
  {
    icon: BarChart3,
    title: 'Deep Stock Reports',
    description: 'Full analysis on any stock: valuation, quality score, insider activity, and red flags — all explained in plain English.',
  },
  {
    icon: PiggyBank,
    title: 'Savings Plan Calculator',
    description: 'Set a financial goal and see exactly how to get there — month by month — with real investment projections.',
  },
  {
    icon: BookOpen,
    title: 'Investor Handbook',
    description: 'A curated beginner\'s guide covering everything from how stocks work to building your first portfolio — written for real people, not finance PhDs.',
  },
]

// ─── Main component ───────────────────────────────────────────────────────────

export function ConclusionPage({ dna, onContinue, onViewPricing }: ConclusionPageProps) {
  const profileName   = getProfileName(dna)
  const riskColor     = getRiskColor(dna.volatility_tolerance)
  const riskScore     = Math.round(dna.risk_score)
  const horizonLabels: Record<string, string> = {
    short: 'Under 2 years', medium: '3–7 years', long: '8–15 years', very_long: '15+ years',
  }
  const knowledgeLabels: Record<string, string> = {
    beginner: 'Beginner', starter: 'Getting started', intermediate: 'Intermediate', expert: 'Experienced',
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center flex-shrink-0">
          <TrendingUp className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">Investor OS</span>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-10 sm:py-16">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-widest mb-3">
            Your Investor DNA
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
            {profileName}
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed">
            Here&apos;s a snapshot of your investor profile. Every insight on this platform will now be personalised to you.
          </p>
        </motion.div>

        {/* Profile stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {[
            { label: 'Risk Score', value: `${riskScore}/100`, color: riskColor },
            { label: 'Time Horizon', value: horizonLabels[dna.time_horizon] ?? dna.time_horizon },
            { label: 'Knowledge', value: knowledgeLabels[dna.knowledge_level] ?? dna.knowledge_level },
          ].map(stat => (
            <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 text-center">
              <p className={cn('text-xl font-bold mb-1', stat.color ?? 'text-gray-900 dark:text-white')}>{stat.value}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Free trial accordion */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 px-5 mb-8"
        >
          <div className="flex items-center gap-2 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800 mb-1">
            <div className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-sky-600 dark:text-sky-400" strokeWidth={3} />
            </div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">
              What&apos;s included in your 10-day free trial
            </p>
          </div>
          {TRIAL_FEATURES.map((feat, i) => (
            <AccordionItem
              key={feat.title}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              defaultOpen={i === 0}
            />
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
          className="flex flex-col gap-3"
        >
          <Button size="lg" fullWidth onClick={onContinue}>
            Start My Free Trial
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button size="lg" variant="secondary" fullWidth onClick={onViewPricing}>
            View Paid Plans
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-xs text-gray-400 dark:text-gray-600 text-center mt-4"
        >
          No credit card required · Cancel anytime · 10 days full access
        </motion.p>
      </div>
    </div>
  )
}
