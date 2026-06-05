import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Dna, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface Question {
  id: string
  category: string
  question: string
  subtext?: string
  options: { label: string; sublabel?: string; value: string | number; icon?: string }[]
}

const QUESTIONS: Question[] = [
  {
    id: 'crash_reaction',
    category: 'Emotional Profile',
    question: 'Your portfolio is down 25% over the past three months. What do you do?',
    subtext: 'Be honest — what would you actually do, not what you think you should do.',
    options: [
      { label: 'Sell immediately', sublabel: 'Cut losses before it gets worse', value: 'sell', icon: '🚨' },
      { label: 'Reduce my exposure', sublabel: 'Sell some to feel safer', value: 'reduce', icon: '⚠️' },
      { label: 'Hold steady', sublabel: 'Stay the course — this is temporary', value: 'hold', icon: '🤝' },
      { label: 'Buy more', sublabel: 'Great opportunity while prices are low', value: 'buy', icon: '💎' },
    ],
  },
  {
    id: 'return_preference',
    category: 'Volatility Tolerance',
    question: 'Which outcome would you prefer?',
    options: [
      { label: 'Steady 4% per year', sublabel: 'Rare bad years, rare great years', value: 'steady', icon: '🏦' },
      { label: 'Average 7% with occasional -15% dips', sublabel: 'A few rough patches but solid growth', value: 'moderate', icon: '📈' },
      { label: 'Average 12% with regular -30% swings', sublabel: 'Big swings, big potential', value: 'growth', icon: '🚀' },
      { label: 'Maximum growth potential, any volatility is fine', sublabel: 'I want the best long-term outcome', value: 'max', icon: '⚡' },
    ],
  },
  {
    id: 'wealth_goal',
    category: 'Wealth Building Style',
    question: 'What\'s your primary goal for this money?',
    options: [
      { label: 'Protect what I have', sublabel: 'Preserve wealth, minimize risk', value: 'preservation', icon: '🛡️' },
      { label: 'Generate regular income', sublabel: 'Dividends and cash flow matter most', value: 'income', icon: '💰' },
      { label: 'Balance growth and stability', sublabel: 'Grow steadily without wild swings', value: 'balanced', icon: '⚖️' },
      { label: 'Maximize long-term growth', sublabel: 'I can wait — I want to build significant wealth', value: 'growth', icon: '🌱' },
    ],
  },
  {
    id: 'time_horizon',
    category: 'Time Horizon',
    question: 'When do you plan to use most of this money?',
    options: [
      { label: 'Within 2 years', sublabel: 'Near-term needs or purchases', value: 'short', icon: '⏰' },
      { label: '3 to 7 years', sublabel: 'Medium-term goals', value: 'medium', icon: '📅' },
      { label: '8 to 15 years', sublabel: 'Long-term wealth building', value: 'long', icon: '🗓️' },
      { label: '15+ years', sublabel: 'Retirement or generational wealth', value: 'very_long', icon: '🌅' },
    ],
  },
  {
    id: 'knowledge_level',
    category: 'Knowledge Level',
    question: 'How would you describe your investing knowledge?',
    options: [
      { label: 'Complete beginner', sublabel: 'Just getting started', value: 'beginner', icon: '🌱' },
      { label: 'I know the basics', sublabel: 'Familiar with stocks and ETFs', value: 'starter', icon: '📚' },
      { label: 'Intermediate', sublabel: 'I understand fundamentals and valuation', value: 'intermediate', icon: '📊' },
      { label: 'Advanced / experienced', sublabel: 'I read 10-Ks and analyze financials', value: 'expert', icon: '🎓' },
    ],
  },
  {
    id: 'time_commitment',
    category: 'Time Commitment',
    question: 'How much time do you want to spend on your investments?',
    options: [
      { label: 'Set it and forget it', sublabel: 'Minimal — maybe check in quarterly', value: 'passive', icon: '😴' },
      { label: 'Monthly check-ins', sublabel: 'Review and rebalance once a month', value: 'monthly', icon: '📆' },
      { label: 'Weekly research', sublabel: 'A few hours per week', value: 'weekly', icon: '🔍' },
      { label: 'Active investor', sublabel: 'Daily engagement and research', value: 'active', icon: '⚡' },
    ],
  },
  {
    id: 'worst_loss',
    category: 'Loss Tolerance',
    question: 'The most I could stomach losing in a single year without panic-selling is...',
    options: [
      { label: 'Less than 10%', sublabel: 'I need to feel safe', value: 10, icon: '🔒' },
      { label: 'Around 20%', sublabel: 'Uncomfortable but manageable', value: 20, icon: '🟡' },
      { label: 'Around 35%', sublabel: 'I understand markets can be brutal', value: 35, icon: '🟠' },
      { label: '50% or more', sublabel: 'If the long-term upside is there', value: 50, icon: '🔴' },
    ],
  },
  {
    id: 'investing_style',
    category: 'Investing Style',
    question: 'Which investing philosophy resonates with you most?',
    options: [
      { label: 'Buy undervalued companies', sublabel: 'Hunt for bargains, value investor style', value: 'value', icon: '🔎' },
      { label: 'Back fast-growing companies', sublabel: 'Growth at a reasonable price', value: 'growth', icon: '📈' },
      { label: 'Own steady dividend payers', sublabel: 'Income + stability, dividend investor style', value: 'dividend', icon: '💵' },
      { label: 'Just track the whole market', sublabel: 'Index funds — simple and diversified', value: 'index', icon: '🌍' },
    ],
  },
  {
    id: 'sector_interests',
    category: 'Sector Interests',
    question: 'Which sectors excite you most? (Choose all that apply)',
    options: [
      { label: 'Technology & AI', value: 'tech', icon: '🤖' },
      { label: 'Healthcare & Biotech', value: 'health', icon: '🏥' },
      { label: 'Clean Energy', value: 'energy', icon: '⚡' },
      { label: 'Real Estate', value: 'realestate', icon: '🏢' },
      { label: 'Consumer Brands', value: 'consumer', icon: '🛍️' },
      { label: 'Financial Services', value: 'finance', icon: '🏦' },
    ],
  },
]

function calculateProfile(answers: Record<string, string | number | string[]>) {
  const riskPoints = {
    crash_reaction: { sell: 0, reduce: 10, hold: 20, buy: 30 },
    return_preference: { steady: 0, moderate: 12, growth: 22, max: 30 },
    time_horizon: { short: 0, medium: 12, long: 22, very_long: 30 },
    worst_loss: { 10: 0, 20: 12, 35: 22, 50: 30 },
  }

  let riskScore = 0
  for (const [qId, vals] of Object.entries(riskPoints)) {
    const ans = answers[qId]
    if (ans !== undefined) {
      const points = (vals as Record<string, number>)[String(ans)] ?? 0
      riskScore += points
    }
  }
  riskScore = Math.min(100, riskScore)

  const emotional_map: Record<string, string> = {
    sell: 'panic_seller', reduce: 'cautious', hold: 'rational', buy: 'conviction',
  }
  const emotional_profile = emotional_map[String(answers.crash_reaction)] ?? 'rational'

  let risk_tolerance = 'moderate'
  if (riskScore < 20) risk_tolerance = 'very_conservative'
  else if (riskScore < 40) risk_tolerance = 'conservative'
  else if (riskScore < 60) risk_tolerance = 'moderate'
  else if (riskScore < 80) risk_tolerance = 'growth'
  else risk_tolerance = 'aggressive'

  return {
    emotional_profile,
    wealth_style: String(answers.wealth_goal ?? 'balanced'),
    time_horizon: String(answers.time_horizon ?? 'medium'),
    knowledge_level: String(answers.knowledge_level ?? 'beginner'),
    time_commitment: String(answers.time_commitment ?? 'monthly'),
    volatility_tolerance: risk_tolerance,
    drawdown_tolerance: Number(answers.worst_loss ?? 20),
    sector_interests: (answers.sector_interests as string[]) ?? [],
    risk_score: riskScore,
    answers,
  }
}

export function OnboardingPage() {
  const { user, refreshDna } = useAuth()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string | number | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [direction, setDirection] = useState(1)

  const q = QUESTIONS[current]
  const isSectorQuestion = q.id === 'sector_interests'
  const totalSteps = QUESTIONS.length
  const progress = ((current) / totalSteps) * 100

  function selectOption(value: string | number) {
    if (isSectorQuestion) {
      const prev = (answers[q.id] as string[]) ?? []
      const str = String(value)
      const next = prev.includes(str) ? prev.filter(v => v !== str) : [...prev, str]
      setAnswers(a => ({ ...a, [q.id]: next }))
    } else {
      setAnswers(a => ({ ...a, [q.id]: value }))
    }
  }

  function isSelected(value: string | number): boolean {
    const ans = answers[q.id]
    if (isSectorQuestion) return ((ans as string[]) ?? []).includes(String(value))
    return ans === value
  }

  function canAdvance(): boolean {
    const ans = answers[q.id]
    if (!ans) return false
    if (isSectorQuestion) return ((ans as string[]) ?? []).length > 0
    return true
  }

  function next() {
    if (!canAdvance()) return
    if (current < QUESTIONS.length - 1) {
      setDirection(1)
      setCurrent(c => c + 1)
    } else {
      handleSubmit()
    }
  }

  function prev() {
    if (current > 0) { setDirection(-1); setCurrent(c => c - 1) }
  }

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    const profile = calculateProfile(answers)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('dna_assessments') as any).insert({
      user_id: user.id,
      ...profile,
    })
    await refreshDna()
    track('onboarding_completed', { risk_score: profile.risk_score })
    setDone(true)
    setSubmitting(false)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#09090f' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto p-8"
        >
          <div className="w-20 h-20 rounded-full bg-[rgba(16,185,129,0.15)] border border-[rgba(16,185,129,0.3)] flex items-center justify-center mx-auto mb-6">
            <Dna className="w-10 h-10 text-[#10b981]" />
          </div>
          <h2 className="text-3xl font-bold text-[#f1f5f9] mb-3">Your Investor DNA is ready</h2>
          <p className="text-[#64748b] mb-8">Every insight, recommendation, and score will now be personalized to your unique investor profile.</p>
          <Button size="lg" onClick={() => window.location.reload()}>
            Enter your dashboard <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#09090f' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[#1e1e3a]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#3b82f6] flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[#f1f5f9]">Investor Intelligence OS</span>
        </div>
        <span className="text-sm text-[#64748b]">{current + 1} of {totalSteps}</span>
      </div>

      {/* Progress */}
      <div className="h-0.5 w-full bg-[#1e1e3a]">
        <div
          className="h-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="mb-2">
                <span className="text-xs font-medium text-[#3b82f6] uppercase tracking-wider">{q.category}</span>
              </div>
              <h2 className="text-2xl font-bold text-[#f1f5f9] mb-2 leading-tight">{q.question}</h2>
              {q.subtext && <p className="text-[#64748b] text-sm mb-6">{q.subtext}</p>}
              {!q.subtext && <div className="mb-6" />}

              <div className={cn(
                'grid gap-3',
                q.options.length > 4 ? 'grid-cols-2' : 'grid-cols-1',
              )}>
                {q.options.map(opt => (
                  <button
                    key={String(opt.value)}
                    onClick={() => selectOption(opt.value)}
                    className={cn(
                      'text-left p-4 rounded-[14px] border transition-all duration-200 cursor-pointer',
                      'flex items-start gap-3',
                      isSelected(opt.value)
                        ? 'bg-[rgba(59,130,246,0.15)] border-[#3b82f6] shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                        : 'bg-[#0f0f1a] border-[#1e1e3a] hover:border-[#252545] hover:bg-[#141425]',
                    )}
                  >
                    {opt.icon && <span className="text-xl mt-0.5 flex-shrink-0">{opt.icon}</span>}
                    <div>
                      <p className={cn(
                        'font-medium text-sm',
                        isSelected(opt.value) ? 'text-[#f1f5f9]' : 'text-[#cbd5e1]',
                      )}>
                        {opt.label}
                      </p>
                      {opt.sublabel && (
                        <p className="text-xs text-[#64748b] mt-0.5">{opt.sublabel}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center gap-3 mt-8">
            {current > 0 && (
              <Button variant="secondary" onClick={prev} className="flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            <Button
              onClick={next}
              disabled={!canAdvance()}
              loading={submitting}
              fullWidth
            >
              {current === QUESTIONS.length - 1 ? 'Build My Investor DNA' : 'Continue'}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
