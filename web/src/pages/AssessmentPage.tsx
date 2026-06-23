import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, SkipForward, HelpCircle, X, Dna } from 'lucide-react'
import * as Dialog from '@radix-ui/react-dialog'
import { Button } from '@/components/ui/Button'
import { MadyLogo } from '@/components/ui/MadyLogo'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { track } from '@/lib/analytics'
import { cn } from '@/lib/utils'

// ─── Data types ───────────────────────────────────────────────────────────────

interface Option { label: string; sublabel?: string; value: string | number; icon?: string }
interface Question { id: string; category: string; question: string; subtext?: string; options: Option[] }
interface SectorItem { label: string; value: string; icon: string }
interface SectorGroup { group: string; emoji: string; items: SectorItem[] }

// ─── Question data ────────────────────────────────────────────────────────────

const QUESTIONS: Question[] = [
  {
    id: 'crash_reaction', category: 'Emotional Profile',
    question: "Imagine your portfolio just dropped 25% in three months. What's your gut reaction?",
    subtext: "Don't overthink it — go with your first instinct. There's no wrong answer here.",
    options: [
      { label: 'Sell immediately',    sublabel: 'Cut my losses before things get worse',        value: 'sell',   icon: '🚨' },
      { label: 'Reduce my exposure',  sublabel: 'Sell some to feel a bit safer',                value: 'reduce', icon: '⚠️' },
      { label: 'Hold steady',         sublabel: 'Stay the course — this is probably temporary',  value: 'hold',   icon: '🤝' },
      { label: 'Buy more',            sublabel: "It's a great buying opportunity!",              value: 'buy',    icon: '💎' },
    ],
  },
  {
    id: 'return_preference', category: 'Volatility Tolerance',
    question: 'When it comes to returns, which scenario feels most right for you?',
    subtext: "Think about how you'd feel during the rough patches, not just the good times.",
    options: [
      { label: 'Steady 4% per year',                          sublabel: 'Rare bad years, rare great years — very predictable',   value: 'steady',   icon: '🏦' },
      { label: 'Average 7% with occasional -15% dips',        sublabel: 'A few rough patches but solid long-term growth',         value: 'moderate', icon: '📈' },
      { label: 'Average 12% with regular -30% swings',        sublabel: 'Big dips, but big potential upside',                    value: 'growth',   icon: '🚀' },
      { label: 'Maximum growth potential, any volatility ok', sublabel: 'I want the best long-term outcome, whatever it takes',  value: 'max',      icon: '⚡' },
    ],
  },
  {
    id: 'wealth_goal', category: 'Wealth Building Style',
    question: 'What matters most to you when it comes to this money?',
    subtext: 'Your answer helps us understand what success really looks like for you.',
    options: [
      { label: 'Protect what I have',            sublabel: 'Preserve wealth, minimise risk above all',          value: 'preservation', icon: '🛡️' },
      { label: 'Generate regular income',         sublabel: 'Dividends and cash flow matter most',              value: 'income',       icon: '💰' },
      { label: 'Balance growth and stability',    sublabel: 'Grow steadily without wild swings',                value: 'balanced',     icon: '⚖️' },
      { label: 'Maximise long-term growth',       sublabel: "I can wait — I want to build significant wealth",  value: 'growth',       icon: '🌱' },
    ],
  },
  {
    id: 'time_horizon', category: 'Time Horizon',
    question: "When do you think you'll actually need this money?",
    subtext: 'Your timeline shapes everything — from your risk level to the types of investments that suit you.',
    options: [
      { label: 'Within 2 years',   sublabel: 'Near-term needs or planned purchases',           value: 'short',     icon: '⏰' },
      { label: '3 to 7 years',     sublabel: 'Medium-term goals like a home or business',       value: 'medium',    icon: '📅' },
      { label: '8 to 15 years',    sublabel: 'Long-term wealth building',                       value: 'long',      icon: '🗓️' },
      { label: '15+ years',        sublabel: 'Retirement or generational wealth',               value: 'very_long', icon: '🌅' },
    ],
  },
  {
    id: 'knowledge_level', category: 'Knowledge Level',
    question: "How familiar are you with investing? Be honest — we'll meet you where you are!",
    subtext: "There's absolutely no shame in being new to this. We'll personalise your experience accordingly.",
    options: [
      { label: 'Complete beginner',       sublabel: 'Just getting started — still learning the basics',          value: 'beginner',     icon: '🌱' },
      { label: 'I know the basics',        sublabel: 'Familiar with stocks, ETFs and general concepts',          value: 'starter',      icon: '📚' },
      { label: 'Intermediate',             sublabel: 'I understand fundamentals, valuation and diversification', value: 'intermediate', icon: '📊' },
      { label: 'Advanced / experienced',   sublabel: 'I read annual reports and analyse financials myself',      value: 'expert',       icon: '🎓' },
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
      { label: 'Less than 10%', sublabel: 'I need to feel safe — capital preservation is key',        value: 10, icon: '🔒' },
      { label: 'Around 20%',    sublabel: 'Uncomfortable but manageable with a long view',            value: 20, icon: '🟡' },
      { label: 'Around 35%',    sublabel: 'I understand markets can be brutal sometimes',             value: 35, icon: '🟠' },
      { label: '50% or more',   sublabel: 'If the long-term upside is there, I can handle it',        value: 50, icon: '🔴' },
    ],
  },
  {
    id: 'investing_style', category: 'Investing Style',
    question: "If you had to pick a style, which investing approach feels most like you?",
    subtext: "You don't have to stick to just one forever — but let's start with what resonates most right now.",
    options: [
      { label: 'Buy undervalued companies',  sublabel: 'Hunt for hidden bargains — value investor style',  value: 'value',    icon: '🔎' },
      { label: 'Back fast-growing companies', sublabel: 'Growth at a reasonable price',                   value: 'growth',   icon: '📈' },
      { label: 'Own steady dividend payers',  sublabel: 'Income + stability — dividend investor style',   value: 'dividend', icon: '💵' },
      { label: 'Just track the whole market', sublabel: 'Index funds — simple, diversified, and proven',  value: 'index',    icon: '🌍' },
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
    ],
  },
  {
    group: 'Consumer', emoji: '🛍️',
    items: [
      { label: 'Consumer Brands',      value: 'consumer', icon: '🏷️' },
      { label: 'Luxury Brands',        value: 'luxury',   icon: '💎' },
      { label: 'Food & Beverage',      value: 'food_bev', icon: '🍔' },
    ],
  },
  {
    group: 'Healthcare', emoji: '🏥',
    items: [
      { label: 'Pharmaceuticals', value: 'pharma',          icon: '💊' },
      { label: 'Biotechnology',   value: 'biotech',         icon: '🧬' },
      { label: 'Medical Devices', value: 'medical_devices', icon: '🩺' },
    ],
  },
  {
    group: 'Finance', emoji: '🏦',
    items: [
      { label: 'Fintech',   value: 'fintech',  icon: '📱' },
      { label: 'Payments',  value: 'payments', icon: '💳' },
      { label: 'Banking',   value: 'banking',  icon: '🏛️' },
    ],
  },
  {
    group: 'Energy', emoji: '⚡',
    items: [
      { label: 'Oil & Gas',        value: 'oil_gas',   icon: '🛢️' },
      { label: 'Renewable Energy', value: 'renewables', icon: '🌱' },
    ],
  },
  {
    group: 'Styles & Themes', emoji: '📈',
    items: [
      { label: 'Dividend Investing',  value: 'dividends',    icon: '💰' },
      { label: 'Small Caps',          value: 'small_caps',   icon: '🌱' },
      { label: 'Real Estate',         value: 'realestate',   icon: '🏢' },
      { label: 'Space',               value: 'space',        icon: '🚀' },
      { label: 'Defense',             value: 'defense',      icon: '🛡️' },
      { label: 'Gaming',              value: 'gaming',       icon: '🎮' },
    ],
  },
]

const TOOLTIPS: Record<string, { title: string; body: string }> = {
  crash_reaction:    { title: 'Why we ask this', body: "Your reaction to a real drawdown reveals your actual risk tolerance — not the one you think you have, but the one you live with. This stops us from recommending portfolios that'll keep you up at night." },
  return_preference: { title: 'Why we ask this', body: "Different return profiles suit different investors. We use this to find the right asset allocation — balancing how much growth you want with how much uncertainty you can actually handle." },
  wealth_goal:       { title: 'Why we ask this', body: "Knowing what success looks like for you helps us prioritise the right metrics. Capital preservation, income, and long-term growth each require a completely different investment strategy." },
  time_horizon:      { title: 'Why we ask this', body: "Time in the market is one of the most powerful forces in investing. A longer horizon means you can weather short-term volatility. A shorter one means we should prioritise stability and liquidity." },
  knowledge_level:   { title: 'Why we ask this', body: "This calibrates explanations, warnings, and recommendations to exactly where you are. We never talk down to you, and we never assume knowledge you don't have." },
  time_commitment:   { title: 'Why we ask this', body: "Whether you want to set-and-forget or actively manage your portfolio, we'll surface the right tools. Passive investors get simpler dashboards; active investors get deeper analysis features." },
  worst_loss:        { title: 'Why we ask this', body: "This is your sleep-at-night number. It's easy to say you'd handle a 50% crash in theory — but would you really? We use your answer to keep every recommendation within your actual comfort zone." },
  investing_style:   { title: 'Why we ask this', body: "Your investing style determines which opportunities, screens, and analysis tools will be most useful to you. It also filters companies to match your preferred philosophy." },
  sector_interests:  { title: 'Why we ask this', body: "We filter news, alerts, and discoveries to match your sector interests. This removes noise so you only see what actually matters to your portfolio and curiosity." },
}

// ─── Profile calculator ───────────────────────────────────────────────────────

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
    if (ans !== undefined) riskScore += (vals as Record<string, number>)[String(ans)] ?? 0
  }
  riskScore = Math.min(100, riskScore)

  const emotionalMap: Record<string, string> = {
    sell: 'panic_seller', reduce: 'cautious', hold: 'rational', buy: 'conviction',
  }

  let risk_tolerance = 'moderate'
  if (riskScore < 20)      risk_tolerance = 'very_conservative'
  else if (riskScore < 40) risk_tolerance = 'conservative'
  else if (riskScore < 60) risk_tolerance = 'moderate'
  else if (riskScore < 80) risk_tolerance = 'growth'
  else                     risk_tolerance = 'aggressive'

  return {
    emotional_profile:    emotionalMap[String(answers.crash_reaction)] ?? 'rational',
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

// ─── Tooltip dialog ───────────────────────────────────────────────────────────

function QuestionTooltip({ questionId }: { questionId: string }) {
  const tip = TOOLTIPS[questionId]
  if (!tip) return null

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          aria-label="Why we ask this"
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-gray-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:text-sky-400 dark:hover:bg-sky-900/20 transition-colors cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" strokeWidth={2} />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-200 dark:border-gray-800">
          <div className="flex items-start justify-between mb-3">
            <Dialog.Title className="text-sm font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
              {tip.title}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer ml-3 flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {tip.body}
          </Dialog.Description>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AssessmentPageProps {
  onSkip?: () => void
  onComplete: () => Promise<void>
}

type Stage = 'questions' | 'done'

export function AssessmentPage({ onSkip, onComplete }: AssessmentPageProps) {
  const { user, refreshDna } = useAuth()
  const [stage, setStage]           = useState<Stage>('questions')
  const [current, setCurrent]       = useState(0)
  const [answers, setAnswers]       = useState<Record<string, string | number | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  const [direction, setDirection]   = useState(1)

  const isSectorQuestion = QUESTIONS[current]?.id === 'sector_interests'
  const totalSteps = QUESTIONS.length
  const progress = ((current + 1) / totalSteps) * 100

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
    const ans = answers[QUESTIONS[current].id]
    if (!ans) return false
    if (isSectorQuestion) return ((ans as string[]) ?? []).length > 0
    return true
  }

  function goNext() {
    if (!canAdvance()) return
    if (current < QUESTIONS.length - 1) {
      setDirection(1); setCurrent(c => c + 1)
    } else {
      handleSubmit()
    }
  }

  function goPrev() {
    if (current > 0) { setDirection(-1); setCurrent(c => c - 1) }
  }

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    const profile = calculateProfile(answers)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase.from('dna_assessments') as any).insert({ user_id: user.id, ...profile })
    track('assessment_completed', { risk_score: profile.risk_score })
    setStage('done')
    setSubmitting(false)
  }

  async function handleReveal() {
    setFinalizing(true)
    await refreshDna()
    await onComplete()
    setFinalizing(false)
  }

  // ── Header ─────────────────────────────────────────────────────────────────
  const Header = (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2.5">
        <MadyLogo className="w-7 h-7 text-[#0C0A09] dark:text-white flex-shrink-0" />
        <span className="text-sm font-light tracking-[0.18em] uppercase text-[#0C0A09] dark:text-white">Mady Finance</span>
      </div>
      {stage === 'questions' && (
        <span className="text-sm font-medium text-gray-400 dark:text-gray-500">
          {current + 1} of {totalSteps}
        </span>
      )}
    </div>
  )

  // ── Done stage ─────────────────────────────────────────────────────────────
  if (stage === 'done') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
        {Header}
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="text-center max-w-md mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 flex items-center justify-center mx-auto mb-6"
            >
              <Dna className="w-10 h-10 text-green-600 dark:text-green-400" strokeWidth={2} />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Your profile is ready!
            </h2>
            <p className="text-base text-gray-500 dark:text-gray-400 leading-relaxed mb-8">
              Every recommendation, score, and insight will now be personalised
              to your unique investor profile. Ready to see it?
            </p>
            <Button size="lg" fullWidth onClick={handleReveal} loading={finalizing}>
              Reveal My Investor Profile
              <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </div>
    )
  }

  // ── Questions ──────────────────────────────────────────────────────────────
  const q = QUESTIONS[current]

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      {Header}

      {/* Progress bar */}
      <div className="h-1 w-full bg-gray-100 dark:bg-gray-800">
        <motion.div
          className="h-full bg-sky-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
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
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <div className="mb-1">
                <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {q.category}
                </span>
              </div>

              <div className="flex items-start gap-2 mb-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
                  {q.question}
                </h2>
                <QuestionTooltip questionId={q.id} />
              </div>

              {q.subtext ? (
                <p className="text-base text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{q.subtext}</p>
              ) : (
                <div className="mb-6" />
              )}

              {/* Sector interests: chip grid */}
              {isSectorQuestion ? (
                <div className="space-y-5 max-h-[52vh] overflow-y-auto pr-1">
                  {SECTOR_GROUPS.map(group => {
                    const selected = (answers['sector_interests'] as string[]) ?? []
                    return (
                      <div key={group.group}>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
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
                                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:text-gray-900 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600',
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
                  <p className="text-xs text-gray-400 dark:text-gray-500 pt-1 pb-2">
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
                          'text-left p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex items-start gap-3',
                          sel
                            ? 'bg-sky-50 border-sky-400 shadow-sm dark:bg-sky-900/20 dark:border-sky-500'
                            : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-700 dark:hover:border-gray-600',
                        )}
                      >
                        {opt.icon && (
                          <span className="text-xl mt-0.5 flex-shrink-0 select-none">{opt.icon}</span>
                        )}
                        <div className="min-w-0">
                          <p className={cn(
                            'font-semibold text-sm',
                            sel ? 'text-sky-700 dark:text-sky-300' : 'text-gray-800 dark:text-gray-200',
                          )}>
                            {opt.label}
                          </p>
                          {opt.sublabel && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
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
            {current > 0 && (
              <Button variant="secondary" onClick={goPrev} className="flex-shrink-0">
                <ChevronLeft className="w-4 h-4" />
                Back
              </Button>
            )}
            {current === 0 && onSkip && (
              <Button variant="ghost" onClick={onSkip} className="flex-shrink-0">
                <SkipForward className="w-4 h-4" />
                Skip
              </Button>
            )}
            <Button
              onClick={goNext}
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
