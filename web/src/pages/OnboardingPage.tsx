import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Dna, TrendingUp, Sparkles, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface Option {
  label: string
  sublabel?: string
  value: string | number
  icon?: string
}

interface Question {
  id: string
  category: string
  question: string
  subtext?: string
  options: Option[]
}

interface SectorItem { label: string; value: string; icon: string }
interface SectorGroup { group: string; emoji: string; items: SectorItem[] }

const QUESTIONS: Question[] = [
  {
    id: 'crash_reaction', category: 'Emotional Profile',
    question: "Imagine your portfolio just dropped 25% in three months. What's your gut reaction?",
    subtext: "Don't overthink it — go with your first instinct. There's no wrong answer here.",
    options: [
      { label: 'Sell immediately',    sublabel: 'Cut my losses before things get worse',       value: 'sell',   icon: '🚨' },
      { label: 'Reduce my exposure',  sublabel: 'Sell some to feel a bit safer',               value: 'reduce', icon: '⚠️' },
      { label: 'Hold steady',         sublabel: 'Stay the course — this is probably temporary', value: 'hold',   icon: '🤝' },
      { label: 'Buy more',            sublabel: "It's a great buying opportunity!",             value: 'buy',    icon: '💎' },
    ],
  },
  {
    id: 'return_preference', category: 'Volatility Tolerance',
    question: 'When it comes to returns, which scenario feels most right for you?',
    subtext: "Think about how you'd feel during the rough patches, not just the good times.",
    options: [
      { label: 'Steady 4% per year',                          sublabel: 'Rare bad years, rare great years — very predictable',      value: 'steady',   icon: '🏦' },
      { label: 'Average 7% with occasional -15% dips',        sublabel: 'A few rough patches but solid long-term growth',            value: 'moderate', icon: '📈' },
      { label: 'Average 12% with regular -30% swings',        sublabel: 'Big dips, but big potential upside',                       value: 'growth',   icon: '🚀' },
      { label: 'Maximum growth potential, any volatility ok', sublabel: 'I want the best long-term outcome, whatever it takes',     value: 'max',      icon: '⚡' },
    ],
  },
  {
    id: 'wealth_goal', category: 'Wealth Building Style',
    question: 'What matters most to you when it comes to this money?',
    subtext: 'Your answer helps us understand what success really looks like for you.',
    options: [
      { label: 'Protect what I have',            sublabel: 'Preserve wealth, minimise risk above all',       value: 'preservation', icon: '🛡️' },
      { label: 'Generate regular income',         sublabel: 'Dividends and cash flow matter most',           value: 'income',       icon: '💰' },
      { label: 'Balance growth and stability',    sublabel: "Grow steadily without wild swings",             value: 'balanced',     icon: '⚖️' },
      { label: 'Maximise long-term growth',       sublabel: "I can wait — I want to build significant wealth", value: 'growth',    icon: '🌱' },
    ],
  },
  {
    id: 'time_horizon', category: 'Time Horizon',
    question: "When do you think you'll actually need this money?",
    subtext: 'Your timeline shapes everything — from your risk level to the types of investments that suit you.',
    options: [
      { label: 'Within 2 years',   sublabel: 'Near-term needs or planned purchases',          value: 'short',     icon: '⏰' },
      { label: '3 to 7 years',     sublabel: 'Medium-term goals like a home or business',      value: 'medium',    icon: '📅' },
      { label: '8 to 15 years',    sublabel: 'Long-term wealth building',                      value: 'long',      icon: '🗓️' },
      { label: '15+ years',        sublabel: 'Retirement or generational wealth',              value: 'very_long', icon: '🌅' },
    ],
  },
  {
    id: 'knowledge_level', category: 'Knowledge Level',
    question: "How familiar are you with investing? Be honest — we'll meet you where you are!",
    subtext: "There's absolutely no shame in being new to this. We'll personalise your experience to match your level.",
    options: [
      { label: 'Complete beginner',       sublabel: 'Just getting started — still learning the basics',             value: 'beginner',     icon: '🌱' },
      { label: 'I know the basics',        sublabel: 'Familiar with stocks, ETFs and general concepts',             value: 'starter',      icon: '📚' },
      { label: 'Intermediate',             sublabel: 'I understand fundamentals, valuation and diversification',    value: 'intermediate', icon: '📊' },
      { label: 'Advanced / experienced',   sublabel: 'I read annual reports and analyse financials myself',         value: 'expert',       icon: '🎓' },
    ],
  },
  {
    id: 'time_commitment', category: 'Time Commitment',
    question: 'How much time would you like to spend on your investments each week?',
    subtext: 'The beauty of modern investing is that you can be as hands-on or hands-off as you like.',
    options: [
      { label: 'Set it and forget it', sublabel: 'Minimal — maybe check in once a quarter',    value: 'passive', icon: '😴' },
      { label: 'Monthly check-ins',    sublabel: 'Review and rebalance about once a month',    value: 'monthly', icon: '📆' },
      { label: 'Weekly research',      sublabel: 'A few focused hours each week',              value: 'weekly',  icon: '🔍' },
      { label: 'Active investor',      sublabel: 'Daily engagement, research, and monitoring', value: 'active',  icon: '⚡' },
    ],
  },
  {
    id: 'worst_loss', category: 'Loss Tolerance',
    question: "Everyone has a comfort zone. What's the maximum loss you could handle in a single bad year?",
    subtext: 'This helps us make sure we only suggest things that will let you sleep at night.',
    options: [
      { label: 'Less than 10%', sublabel: 'I need to feel safe — capital preservation is key',         value: 10, icon: '🔒' },
      { label: 'Around 20%',    sublabel: 'Uncomfortable but manageable with a long view',             value: 20, icon: '🟡' },
      { label: 'Around 35%',    sublabel: 'I understand markets can be brutal sometimes',              value: 35, icon: '🟠' },
      { label: '50% or more',   sublabel: 'If the long-term upside is there, I can handle it',         value: 50, icon: '🔴' },
    ],
  },
  {
    id: 'investing_style', category: 'Investing Style',
    question: "If you had to pick a style, which investing approach feels most like you?",
    subtext: "You don't have to stick to just one forever — but let's start with what resonates most right now.",
    options: [
      { label: 'Buy undervalued companies', sublabel: 'Hunt for hidden bargains — value investor style', value: 'value',    icon: '🔎' },
      { label: 'Back fast-growing companies',sublabel: 'Growth at a reasonable price',                  value: 'growth',   icon: '📈' },
      { label: 'Own steady dividend payers', sublabel: 'Income + stability — dividend investor style',  value: 'dividend', icon: '💵' },
      { label: 'Just track the whole market',sublabel: 'Index funds — simple, diversified, and proven', value: 'index',    icon: '🌍' },
    ],
  },
  {
    id: 'sector_interests', category: 'Sector Interests',
    question: 'Which industries and themes get you excited? Pick as many as you like!',
    subtext: "We'll prioritise these sectors when surfacing opportunities, news, and alerts for you.",
    options: [],
  },
]

const SECTOR_GROUPS: SectorGroup[] = [
  {
    group: 'Technology', emoji: '💻',
    items: [
      { label: 'Artificial Intelligence', value: 'ai',            icon: '🤖' },
      { label: 'Semiconductors',          value: 'semiconductors', icon: '💡' },
      { label: 'Cybersecurity',           value: 'cybersecurity',  icon: '🔐' },
      { label: 'SaaS & Software',         value: 'saas',           icon: '☁️' },
      { label: 'Cloud Computing',         value: 'cloud',          icon: '🌐' },
      { label: 'Robotics',               value: 'robotics',       icon: '🦾' },
      { label: 'Quantum Computing',       value: 'quantum',        icon: '⚛️' },
    ],
  },
  {
    group: 'Consumer', emoji: '🛍️',
    items: [
      { label: 'Consumer Brands',   value: 'consumer', icon: '🏷️' },
      { label: 'FMCG',             value: 'fmcg',     icon: '🛒' },
      { label: 'Luxury Brands',     value: 'luxury',   icon: '💎' },
      { label: 'Beauty & Personal Care', value: 'beauty',icon: '✨' },
      { label: 'Fashion & Apparel', value: 'fashion',  icon: '👗' },
      { label: 'Food & Beverage',   value: 'food_bev', icon: '🍔' },
    ],
  },
  {
    group: 'Healthcare', emoji: '🏥',
    items: [
      { label: 'Pharmaceuticals', value: 'pharma',         icon: '💊' },
      { label: 'Biotechnology',   value: 'biotech',        icon: '🧬' },
      { label: 'Medical Devices', value: 'medical_devices',icon: '🩺' },
    ],
  },
  {
    group: 'Finance', emoji: '🏦',
    items: [
      { label: 'Fintech',   value: 'fintech',   icon: '📱' },
      { label: 'Payments',  value: 'payments',  icon: '💳' },
      { label: 'Banking',   value: 'banking',   icon: '🏛️' },
      { label: 'Insurance', value: 'insurance', icon: '🛡️' },
    ],
  },
  {
    group: 'Energy', emoji: '⚡',
    items: [
      { label: 'Oil & Gas',        value: 'oil_gas',   icon: '🛢️' },
      { label: 'Renewable Energy', value: 'renewables',icon: '🌱' },
      { label: 'Nuclear Energy',   value: 'nuclear',   icon: '⚛️' },
    ],
  },
  {
    group: 'Investment Styles', emoji: '📈',
    items: [
      { label: 'Dividend Investing',value: 'dividends',    icon: '💰' },
      { label: 'Growth Investing',  value: 'growth_style', icon: '🚀' },
      { label: 'Value Investing',   value: 'value_style',  icon: '🔎' },
      { label: 'Meme Stocks',       value: 'meme',         icon: '🐸' },
      { label: 'Turnaround Stories',value: 'turnaround',   icon: '🔄' },
      { label: 'Small Caps',        value: 'small_caps',   icon: '🌱' },
      { label: 'IPOs',              value: 'ipos',         icon: '🎯' },
    ],
  },
  {
    group: 'Other Interests', emoji: '🌐',
    items: [
      { label: 'Gaming',             value: 'gaming',      icon: '🎮' },
      { label: 'Sports & Entertainment', value: 'sports',  icon: '⚽' },
      { label: 'Travel & Hospitality',value: 'travel',     icon: '✈️' },
      { label: 'Real Estate',        value: 'realestate',  icon: '🏢' },
      { label: 'Logistics',          value: 'logistics',   icon: '🚚' },
      { label: 'Agriculture',        value: 'agriculture', icon: '🌾' },
      { label: 'Food Technology',    value: 'food_tech',   icon: '🧪' },
      { label: 'Space',              value: 'space',       icon: '🚀' },
      { label: 'Defense',            value: 'defense',     icon: '🛡️' },
    ],
  },
]

function calculateProfile(answers: Record<string, string | number | string[]>) {
  const riskPoints = {
    crash_reaction:    { sell: 0, reduce: 10, hold: 20, buy: 30 },
    return_preference: { steady: 0, moderate: 12, growth: 22, max: 30 },
    time_horizon:      { short: 0, medium: 12, long: 22, very_long: 30 },
    worst_loss:        { 10: 0, 20: 12, 35: 22, 50: 30 },
  }

  let riskScore = 0
  for (const [qId, vals] of Object.entries(riskPoints)) {
    const ans = answers[qId]
    if (ans !== undefined) {
      riskScore += (vals as Record<string, number>)[String(ans)] ?? 0
    }
  }
  riskScore = Math.min(100, riskScore)

  const emotionalMap: Record<string, string> = {
    sell: 'panic_seller', reduce: 'cautious', hold: 'rational', buy: 'conviction',
  }
  const emotional_profile = emotionalMap[String(answers.crash_reaction)] ?? 'rational'

  let risk_tolerance = 'moderate'
  if (riskScore < 20)      risk_tolerance = 'very_conservative'
  else if (riskScore < 40) risk_tolerance = 'conservative'
  else if (riskScore < 60) risk_tolerance = 'moderate'
  else if (riskScore < 80) risk_tolerance = 'growth'
  else                     risk_tolerance = 'aggressive'

  return {
    emotional_profile,
    wealth_style:         String(answers.wealth_goal ?? 'balanced'),
    time_horizon:         String(answers.time_horizon ?? 'medium'),
    knowledge_level:      String(answers.knowledge_level ?? 'beginner'),
    time_commitment:      String(answers.time_commitment ?? 'monthly'),
    volatility_tolerance: risk_tolerance,
    drawdown_tolerance:   Number(answers.worst_loss ?? 20),
    sector_interests:     (answers.sector_interests as string[]) ?? [],
    risk_score:           riskScore,
    answers,
  }
}

interface OnboardingPageProps { onSkip?: () => void }
type Stage = 'intro' | 'questions' | 'done'

export function OnboardingPage({ onSkip }: OnboardingPageProps) {
  const { user, refreshDna } = useAuth()
  const [stage, setStage]         = useState<Stage>('intro')
  const [current, setCurrent]     = useState(0)
  const [answers, setAnswers]     = useState<Record<string, string | number | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [direction, setDirection] = useState(1)

  const isSectorQuestion = stage === 'questions' && QUESTIONS[current]?.id === 'sector_interests'
  const totalSteps = QUESTIONS.length
  const progress   = stage === 'questions' ? ((current + 1) / totalSteps) * 100 : 0

  function selectOption(qId: string, value: string | number, multi = false) {
    if (multi) {
      const prev = (answers[qId] as string[]) ?? []
      const str  = String(value)
      setAnswers(a => ({ ...a, [qId]: prev.includes(str) ? prev.filter(v => v !== str) : [...prev, str] }))
    } else {
      setAnswers(a => ({ ...a, [qId]: value }))
    }
  }

  function isSelected(qId: string, value: string | number, multi = false): boolean {
    const ans = answers[qId]
    if (multi) return ((ans as string[]) ?? []).includes(String(value))
    return ans === value
  }

  function canAdvance(): boolean {
    if (stage !== 'questions') return false
    const ans = answers[QUESTIONS[current].id]
    if (!ans) return false
    if (isSectorQuestion) return ((ans as string[]) ?? []).length > 0
    return true
  }

  function next() {
    if (!canAdvance()) return
    if (current < QUESTIONS.length - 1) {
      setDirection(1); setCurrent(c => c + 1)
    } else {
      handleSubmit()
    }
  }

  function prev() {
    if (current === 0) { setStage('intro') }
    else { setDirection(-1); setCurrent(c => c - 1) }
  }

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    const profile = calculateProfile(answers)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('dna_assessments') as any).insert({ user_id: user.id, ...profile })
    if (error) console.error('[dna_assessments] insert failed:', error.code, '|', error.message, '|', error.details, '|', error.hint)
    track('onboarding_completed', { risk_score: profile.risk_score })
    setStage('done')
    setSubmitting(false)
  }

  // ── Shared header ──────────────────────────────────────────────────────────
  function Header({ right }: { right?: React.ReactNode }) {
    return (
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-sky-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-stone-900 dark:text-stone-100">Mady Finance</span>
        </div>
        {right}
      </div>
    )
  }

  // ── Completion ─────────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950 p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-800 flex items-center justify-center mx-auto mb-6">
            <Dna className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-50 mb-3">
            Your Investor DNA is ready!
          </h2>
          <p className="text-base text-stone-500 dark:text-stone-400 leading-relaxed mb-8">
            Every insight, recommendation, and score will now be personalised to your unique investor profile. Time to see your dashboard!
          </p>
          <Button
            size="lg"
            onClick={async () => { await refreshDna() }}
          >
            Enter your dashboard
            <ChevronRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>
    )
  }

  // ── Intro ──────────────────────────────────────────────────────────────────
  if (stage === 'intro') {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
        <Header />
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg"
          >
            <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-800 flex items-center justify-center mb-6">
              <Dna className="w-8 h-8 text-sky-600 dark:text-sky-400" />
            </div>

            <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50 mb-3 leading-tight">
              Let&apos;s build your Investor DNA
            </h1>
            <p className="text-base text-stone-500 dark:text-stone-400 leading-relaxed mb-7">
              Before we show you the platform, we&apos;d love to understand who you are as an investor.
              It takes about <span className="font-semibold text-stone-900 dark:text-stone-100">2 minutes</span>,
              and it makes everything — recommendations, scores, alerts, news — personalised to{' '}
              <span className="font-semibold text-stone-900 dark:text-stone-100">you</span>.
            </p>

            <div className={cn(
              'rounded-2xl p-5 mb-7 space-y-4',
              'bg-white border border-stone-200 dark:bg-stone-900 dark:border-stone-800',
            )}>
              {[
                { icon: '🎯', text: 'Your dashboard metrics are tuned to your risk tolerance' },
                { icon: '💡', text: 'Recommendations match your investing style and interests' },
                { icon: '🔔', text: 'Alerts are filtered to what actually matters for your profile' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                fullWidth
                onClick={() => { setStage('questions'); setDirection(1) }}
              >
                <Sparkles className="w-4 h-4" />
                Let&apos;s get started
                <ChevronRight className="w-4 h-4" />
              </Button>
              {onSkip && (
                <Button variant="secondary" onClick={onSkip} className="sm:flex-shrink-0 whitespace-nowrap">
                  <SkipForward className="w-4 h-4" />
                  Skip for now
                </Button>
              )}
            </div>
            {onSkip && (
              <p className="text-xs text-stone-400 dark:text-stone-500 mt-3 text-center">
                You can always complete your DNA profile later from the sidebar
              </p>
            )}
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  const q = QUESTIONS[current]

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-stone-950">
      <Header
        right={
          <span className="text-sm font-medium text-stone-400 dark:text-stone-500">
            {current + 1} of {totalSteps}
          </span>
        }
      />

      {/* Progress bar */}
      <div className="h-1 w-full bg-stone-100 dark:bg-stone-800">
        <div
          className="h-full bg-sky-500 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
            >
              <div className="mb-2">
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {q.category}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2 leading-tight">
                {q.question}
              </h2>
              {q.subtext ? (
                <p className="text-base text-stone-500 dark:text-stone-400 mb-6 leading-relaxed">{q.subtext}</p>
              ) : (
                <div className="mb-6" />
              )}

              {/* Sector interests: chip grid */}
              {isSectorQuestion ? (
                <div className="space-y-5 max-h-[52vh] overflow-y-auto pr-1 -mr-1">
                  {SECTOR_GROUPS.map(group => {
                    const selected = (answers['sector_interests'] as string[]) ?? []
                    return (
                      <div key={group.group}>
                        <p className="text-xs font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                          <span>{group.emoji}</span>
                          {group.group}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {group.items.map(item => {
                            const active = selected.includes(item.value)
                            return (
                              <button
                                key={item.value}
                                onClick={() => selectOption('sector_interests', item.value, true)}
                                className={cn(
                                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-all duration-150 cursor-pointer',
                                  active
                                    ? 'bg-sky-50 border-sky-500 text-sky-700 dark:bg-sky-900/30 dark:border-sky-400 dark:text-sky-300'
                                    : 'bg-white border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:bg-stone-900 dark:border-stone-700 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:text-stone-200',
                                )}
                              >
                                <span>{item.icon}</span>
                                {item.label}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                  <p className="text-xs text-stone-400 dark:text-stone-500 pt-1 pb-2">
                    {((answers['sector_interests'] as string[]) ?? []).length} selected
                  </p>
                </div>
              ) : (
                /* Standard option cards */
                <div className="grid grid-cols-1 gap-3">
                  {q.options.map(opt => {
                    const sel = isSelected(q.id, opt.value)
                    return (
                      <button
                        key={String(opt.value)}
                        onClick={() => selectOption(q.id, opt.value)}
                        className={cn(
                          'text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer',
                          'flex items-start gap-3',
                          sel
                            ? 'bg-sky-50 border-sky-400 shadow-sm dark:bg-sky-900/20 dark:border-sky-500'
                            : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50 dark:bg-stone-900 dark:border-stone-700 dark:hover:border-stone-600 dark:hover:bg-stone-800',
                        )}
                      >
                        {opt.icon && (
                          <span className="text-xl mt-0.5 flex-shrink-0 select-none">{opt.icon}</span>
                        )}
                        <div className="min-w-0">
                          <p className={cn(
                            'font-semibold text-sm',
                            sel ? 'text-sky-700 dark:text-sky-300' : 'text-stone-800 dark:text-stone-200',
                          )}>
                            {opt.label}
                          </p>
                          {opt.sublabel && (
                            <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5 leading-snug">
                              {opt.sublabel}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center gap-3 mt-7">
            <Button variant="secondary" onClick={prev} className="flex-shrink-0">
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
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
