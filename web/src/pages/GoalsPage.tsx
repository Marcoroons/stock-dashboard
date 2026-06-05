import { useState, useMemo, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, X, ChevronDown, ChevronUp, Flame, GraduationCap, Hop as Home, Building2, Star, TriangleAlert as AlertTriangle, Check, TrendingUp, TrendingDown, FileSliders as Sliders, Trophy, Calendar, Info, ChevronRight, Wallet, Clock } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { track } from '@/lib/analytics'
import { Card, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import {
  projectGoal, calcRetirement, calcFire, calcWealthScore, simulateScenario,
  goalStatus, fmtMoney, fmtMoneyFull, GOAL_META, STATUS_META, MILESTONES,
  type Goal, type GoalType, type RetirementInput, type FireInput, type ScenarioDelta,
} from '@/lib/wealth-engine'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const db = supabase as any

const GOAL_ICONS: Record<GoalType, React.ComponentType<any>> = {
  retirement: Home,
  house: Home,
  education: GraduationCap,
  fire: Flame,
  business: Building2,
  custom: Star,
}

function yearFromNow(n: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + n)
  return d.toISOString().split('T')[0]
}

function probabilityColor(p: number) {
  if (p >= 75) return '#10b981'
  if (p >= 55) return '#f59e0b'
  return '#ef4444'
}

// ─── Wealth Score Ring ────────────────────────────────────────────────────────

function WealthScoreRing({ score, color, size = 140 }: { score: number; color: string; size?: number }) {
  const r = size * 0.38
  const cx = size / 2, cy = size / 2
  const circumference = 2 * Math.PI * r
  const filled = (score / 100) * circumference

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e1e3a" strokeWidth="10" />
        <motion.circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          className="text-3xl font-bold" style={{ color }}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-[#64748b]">/ 100</span>
      </div>
    </div>
  )
}

// ─── Projection Chart ─────────────────────────────────────────────────────────

const fmtYAxis = (v: number) => {
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`
  return `$${v}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-[10px] p-3 text-xs space-y-1">
      <p className="text-[#64748b] mb-1">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex justify-between gap-4">
          <span style={{ color: p.stroke || p.fill }}>{p.name}</span>
          <span className="font-semibold text-[#f1f5f9]">{fmtMoney(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

function ProjectionChart({ data, target }: { data: any[]; target: number }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
        <defs>
          <linearGradient id="optGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="consGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#64748b" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
        <XAxis dataKey="year" tick={{ fill: '#64748b', fontSize: 10 }} />
        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={fmtYAxis} width={52} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={target} stroke="#f59e0b" strokeDasharray="5 3" strokeWidth={1.5} label={{ value: 'Target', fill: '#f59e0b', fontSize: 10 }} />
        <Area type="monotone" dataKey="optimistic" name="Optimistic (11%)" stroke="#10b981" fill="url(#optGrad)" strokeWidth={1.5} dot={false} />
        <Area type="monotone" dataKey="expected" name="Expected (8%)" stroke="#3b82f6" fill="url(#expGrad)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="conservative" name="Conservative (5%)" stroke="#64748b" fill="url(#consGrad)" strokeWidth={1.5} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

function GoalCard({ goal, onDelete }: { goal: Goal; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const proj = useMemo(() => projectGoal(goal), [goal])
  const status = goalStatus(proj)
  const statusMeta = STATUS_META[status]
  const goalMeta = GOAL_META[goal.type]
  const probColor = probabilityColor(proj.probabilityOfSuccess)
  const Icon = GOAL_ICONS[goal.type]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card hover className="overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0 text-lg"
            style={{ background: `${goalMeta.color}15` }}
          >
            {goalMeta.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-[#f1f5f9]">{goal.label}</p>
                <p className="text-xs text-[#64748b]">{goalMeta.label}</p>
              </div>
              <button
                onClick={() => onDelete(goal.id)}
                className="text-[#3b3b5a] hover:text-[#ef4444] transition-colors cursor-pointer flex-shrink-0 mt-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mt-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748b]">{fmtMoney(goal.current_amount)} saved</span>
                <span className="text-[#94a3b8]">Target: {fmtMoney(goal.target_amount)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-[#1e1e3a] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${proj.progressPct}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: goalMeta.color }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mt-3 grid grid-cols-4 gap-2 text-center">
          <div>
            <p className="text-[10px] text-[#64748b]">Probability</p>
            <p className="text-sm font-bold" style={{ color: probColor }}>{proj.probabilityOfSuccess}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748b]">Progress</p>
            <p className="text-sm font-bold text-[#f1f5f9]">{proj.progressPct.toFixed(0)}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748b]">Time Left</p>
            <p className="text-sm font-bold text-[#f1f5f9]">
              {proj.yearsRemaining >= 1 ? `${proj.yearsRemaining.toFixed(0)}y` : `${proj.monthsRemaining}mo`}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#64748b]">Status</p>
            <p className="text-[10px] font-semibold" style={{ color: statusMeta.color }}>{statusMeta.label}</p>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(e => !e)}
          className="w-full flex items-center justify-between mt-2.5 pt-2.5 border-t border-[#1e1e3a] text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer"
        >
          <span>{expanded ? 'Hide detail' : 'Full projection'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 space-y-4">
                {/* Scenario values */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Conservative (5%)', val: proj.conservative, color: '#64748b' },
                    { label: 'Expected (8%)', val: proj.expected, color: '#3b82f6' },
                    { label: 'Optimistic (11%)', val: proj.optimistic, color: '#10b981' },
                  ].map(s => (
                    <div key={s.label} className="p-2 rounded-[8px] bg-[#0f0f1a] text-center">
                      <p className="text-[9px] text-[#64748b] mb-1">{s.label}</p>
                      <p className="text-sm font-bold" style={{ color: s.color }}>{fmtMoney(s.val)}</p>
                    </div>
                  ))}
                </div>

                {/* Projection chart */}
                <ProjectionChart data={proj.chartData} target={goal.target_amount} />

                {/* Gap or surplus */}
                {proj.gapMonthly > 0 ? (
                  <div className="p-2.5 rounded-[8px] bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#94a3b8]">
                        You need an additional <strong className="text-[#f59e0b]">${proj.gapMonthly.toLocaleString()}/month</strong> to hit this goal at the expected rate.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-[8px] bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)]">
                    <div className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-[#94a3b8]">
                        Projected surplus: <strong className="text-[#10b981]">{fmtMoney(proj.projectedSurplus)}</strong> above target at the expected rate.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                <div>
                  <p className="text-[10px] text-[#64748b] uppercase tracking-wide mb-1.5">Recommendations</p>
                  <div className="space-y-1.5">
                    {proj.recommendations.map((r, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[#94a3b8]">
                        <ChevronRight className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
                        {r}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// ─── Add Goal Form ────────────────────────────────────────────────────────────

interface AddGoalFormProps {
  userId: string
  onAdd: (goal: Goal) => void
  onClose: () => void
}

function AddGoalForm({ userId, onAdd, onClose }: AddGoalFormProps) {
  const [type, setType] = useState<GoalType>('retirement')
  const meta = GOAL_META[type]
  const [label, setLabel] = useState(meta.defaultLabel)
  const [targetAmount, setTargetAmount] = useState(String(meta.suggestedTarget))
  const [currentAmount, setCurrentAmount] = useState('0')
  const [monthlyContrib, setMonthlyContrib] = useState('500')
  const [targetDate, setTargetDate] = useState(yearFromNow(meta.defaultYears))
  const [saving, setSaving] = useState(false)

  // Update defaults when type changes
  const handleTypeChange = (t: GoalType) => {
    const m = GOAL_META[t]
    setType(t)
    setLabel(m.defaultLabel)
    setTargetAmount(String(m.suggestedTarget))
    setTargetDate(yearFromNow(m.defaultYears))
  }

  const handleSave = async () => {
    setSaving(true)
    const row = {
      user_id: userId,
      type,
      label: label.trim() || meta.defaultLabel,
      target_amount: parseFloat(targetAmount) || 0,
      current_amount: parseFloat(currentAmount) || 0,
      monthly_contribution: parseFloat(monthlyContrib) || 0,
      target_date: targetDate,
    }
    const { data, error } = await db.from('financial_goals').insert([row]).select().single()
    setSaving(false)
    if (!error && data) {
      track('goal_created', { goal_type: row.goal_type })
      onAdd(data as Goal)
      onClose()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md rounded-[16px] border border-[#1e1e3a] bg-[#0a0a14] p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#f1f5f9]">New Financial Goal</h3>
          <button onClick={onClose} className="text-[#64748b] hover:text-[#f1f5f9] cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Goal type */}
        <div>
          <p className="text-xs text-[#64748b] mb-2">Goal type</p>
          <div className="grid grid-cols-3 gap-1.5">
            {(Object.keys(GOAL_META) as GoalType[]).map(t => {
              const m = GOAL_META[t]
              return (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={cn(
                    'p-2 rounded-[8px] border text-center transition-all cursor-pointer',
                    type === t ? 'border-opacity-50' : 'border-[#1e1e3a] bg-[#0f0f1a] hover:border-[#2e2e4a]'
                  )}
                  style={type === t ? { borderColor: m.color, background: `${m.color}12` } : {}}
                >
                  <div className="text-base mb-0.5">{m.icon}</div>
                  <p className="text-[10px] text-[#94a3b8]">{m.label}</p>
                </button>
              )
            })}
          </div>
        </div>

        {/* Fields */}
        {[
          { label: 'Goal name', value: label, onChange: setLabel, type: 'text', placeholder: meta.defaultLabel },
          { label: 'Target amount ($)', value: targetAmount, onChange: setTargetAmount, type: 'number', placeholder: '500000' },
          { label: 'Current amount ($)', value: currentAmount, onChange: setCurrentAmount, type: 'number', placeholder: '0' },
          { label: 'Monthly contribution ($)', value: monthlyContrib, onChange: setMonthlyContrib, type: 'number', placeholder: '500' },
        ].map(f => (
          <div key={f.label}>
            <p className="text-xs text-[#64748b] mb-1">{f.label}</p>
            <input
              type={f.type}
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 rounded-[8px] bg-[#0f0f1a] border border-[#1e1e3a] text-sm text-[#f1f5f9] outline-none focus:border-[#3b82f6] transition-colors"
            />
          </div>
        ))}

        <div>
          <p className="text-xs text-[#64748b] mb-1">Target date</p>
          <input
            type="date"
            value={targetDate}
            onChange={e => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 rounded-[8px] bg-[#0f0f1a] border border-[#1e1e3a] text-sm text-[#f1f5f9] outline-none focus:border-[#3b82f6] transition-colors"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="secondary" fullWidth onClick={onClose}>Cancel</Button>
          <Button fullWidth onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Create Goal'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ goals }: { goals: Goal[] }) {
  const { dna } = useAuth()
  const wealthScore = useMemo(() => calcWealthScore(goals, dna?.risk_score ?? 50), [goals, dna])
  const projections = useMemo(() => goals.map(g => ({ goal: g, proj: projectGoal(g) })), [goals])

  const earnedMilestones = useMemo(() => {
    return projections.flatMap(({ goal, proj }) =>
      MILESTONES.filter(m => proj.progressPct >= m.pct).map(m => ({ ...m, goalLabel: goal.label }))
    )
  }, [projections])

  return (
    <div className="space-y-6">
      {/* Wealth Score */}
      <Card>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <WealthScoreRing score={wealthScore.total} color={wealthScore.color} />
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <p className="text-xs text-[#64748b] uppercase tracking-wide mb-1">Wealth Readiness Score</p>
            <h2 className="text-xl font-bold mb-0.5" style={{ color: wealthScore.color }}>{wealthScore.label}</h2>
            <p className="text-sm text-[#94a3b8]">{wealthScore.description}</p>

            {/* Score breakdown */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Goal Progress', val: wealthScore.goalProgress, max: 25 },
                { label: 'Savings Rate', val: wealthScore.savingsRate, max: 25 },
                { label: 'Consistency', val: wealthScore.consistency, max: 25 },
                { label: 'Risk Alignment', val: wealthScore.riskAlignment, max: 25 },
              ].map(c => (
                <div key={c.label}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-[#64748b]">{c.label}</span>
                    <span className="text-[#94a3b8]">{c.val}/{c.max}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1e1e3a] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(c.val / c.max) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ background: wealthScore.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Goals summary grid */}
      {goals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {projections.map(({ goal, proj }) => {
            const meta = GOAL_META[goal.type]
            const probColor = probabilityColor(proj.probabilityOfSuccess)
            return (
              <motion.div key={goal.id} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
                <div
                  className="p-3.5 rounded-[12px] border"
                  style={{ borderColor: `${meta.color}25`, background: `${meta.color}08` }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{meta.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#f1f5f9] truncate">{goal.label}</p>
                      <p className="text-[10px] text-[#64748b]">{fmtMoney(goal.target_amount)} by {new Date(goal.target_date).getFullYear()}</p>
                    </div>
                    <div
                      className="ml-auto w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ borderColor: probColor, color: probColor }}
                    >
                      {proj.probabilityOfSuccess}%
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-[#1e1e3a] overflow-hidden mb-1">
                    <div className="h-full rounded-full transition-all" style={{ width: `${proj.progressPct}%`, background: meta.color }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#64748b]">
                    <span>{proj.progressPct.toFixed(0)}% saved</span>
                    <span style={{ color: STATUS_META[goalStatus(proj)].color }}>{STATUS_META[goalStatus(proj)].label}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12 text-center text-[#64748b]">
          <Target className="w-10 h-10" />
          <p className="text-sm font-medium text-[#94a3b8]">No goals yet</p>
          <p className="text-xs">Switch to "My Goals" to create your first financial goal.</p>
        </div>
      )}

      {/* Milestones */}
      {earnedMilestones.length > 0 && (
        <div>
          <p className="text-xs text-[#64748b] uppercase tracking-wide mb-3">Milestones Reached</p>
          <div className="flex flex-wrap gap-2">
            {earnedMilestones.map((m, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)]">
                <span className="text-sm">{m.icon}</span>
                <span className="text-xs text-[#10b981] font-medium">{m.label}</span>
                <span className="text-[10px] text-[#64748b]">· {m.goalLabel}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── My Goals Tab ─────────────────────────────────────────────────────────────

function MyGoalsTab({ goals, userId, onAdd, onDelete }: {
  goals: Goal[]
  userId: string
  onAdd: (g: Goal) => void
  onDelete: (id: string) => void
}) {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#94a3b8]">{goals.length} goal{goals.length !== 1 ? 's' : ''} — each projection uses conservative (5%), expected (8%), and optimistic (11%) return scenarios.</p>
        <Button size="sm" onClick={() => setShowForm(true)} className="flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <div
          onClick={() => setShowForm(true)}
          className="flex flex-col items-center gap-3 py-16 border-2 border-dashed border-[#1e1e3a] rounded-[16px] cursor-pointer hover:border-[#3b82f6] transition-colors text-center"
        >
          <div className="w-12 h-12 rounded-full bg-[rgba(59,130,246,0.1)] flex items-center justify-center">
            <Plus className="w-6 h-6 text-[#3b82f6]" />
          </div>
          <p className="text-sm font-medium text-[#94a3b8]">Create your first goal</p>
          <p className="text-xs text-[#64748b]">Retirement, house deposit, education, or any custom target</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {goals.map(g => <GoalCard key={g.id} goal={g} onDelete={onDelete} />)}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <AddGoalForm userId={userId} onAdd={onAdd} onClose={() => setShowForm(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Retirement Tab ───────────────────────────────────────────────────────────

const STATUS_DISPLAY = {
  excellent: { label: 'Excellent', color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  on_track: { label: 'On Track', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  slightly_behind: { label: 'Slightly Behind', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  behind: { label: 'Behind', color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  significantly_behind: { label: 'Needs Attention', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
}

function RetirementTab() {
  const [inputs, setInputs] = useState<RetirementInput>({
    currentAge: 35, retirementAge: 65,
    currentSavings: 50000, monthlyContribution: 1000,
    expectedMonthlyExpenses: 5000,
  })

  const result = useMemo(() => calcRetirement(inputs), [inputs])
  const sd = STATUS_DISPLAY[result.status]

  const set = (k: keyof RetirementInput) => (v: number) => setInputs(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[#f1f5f9]">Your Retirement Details</h3>
          {[
            { label: 'Current Age', key: 'currentAge' as const, min: 18, max: 70, suffix: 'yrs' },
            { label: 'Retirement Age', key: 'retirementAge' as const, min: 45, max: 80, suffix: 'yrs' },
          ].map(f => (
            <div key={f.key}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748b]">{f.label}</span>
                <span className="text-[#f1f5f9] font-medium">{inputs[f.key]} {f.suffix}</span>
              </div>
              <input type="range" min={f.min} max={f.max}
                value={inputs[f.key]}
                onChange={e => set(f.key)(Number(e.target.value))}
                className="w-full accent-[#3b82f6] cursor-pointer"
              />
            </div>
          ))}
          {[
            { label: 'Current Savings ($)', key: 'currentSavings' as const },
            { label: 'Monthly Contribution ($)', key: 'monthlyContribution' as const },
            { label: 'Monthly Expenses in Retirement ($)', key: 'expectedMonthlyExpenses' as const },
          ].map(f => (
            <div key={f.key}>
              <p className="text-xs text-[#64748b] mb-1">{f.label}</p>
              <input
                type="number"
                value={inputs[f.key]}
                onChange={e => set(f.key)(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-[8px] bg-[#0f0f1a] border border-[#1e1e3a] text-sm text-[#f1f5f9] outline-none focus:border-[#3b82f6]"
              />
            </div>
          ))}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Readiness score + status */}
          <div className="flex items-center gap-6 p-4 rounded-[14px] border" style={{ borderColor: `${sd.color}30`, background: sd.bg }}>
            <WealthScoreRing score={result.readinessScore} color={sd.color} size={110} />
            <div>
              <p className="text-xs text-[#64748b] uppercase tracking-wide mb-0.5">Retirement Readiness</p>
              <p className="text-xl font-bold mb-0.5" style={{ color: sd.color }}>{sd.label}</p>
              <p className="text-xs text-[#94a3b8]">
                {result.yearsToRetirement} years to retirement · {result.probabilityOfSuccess}% probability of success
              </p>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Required Nest Egg', val: fmtMoney(result.requiredNestEgg), sub: '25x annual expenses', color: '#f59e0b' },
              { label: 'Projected Value', val: fmtMoney(result.projectedValue), sub: 'at expected 8% return', color: result.projectedValue >= result.requiredNestEgg ? '#10b981' : '#ef4444' },
              { label: 'Monthly Income', val: `$${result.safeWithdrawalMonthly.toLocaleString()}`, sub: '4% safe withdrawal rule', color: '#3b82f6' },
              { label: result.shortfall > 0 ? 'Shortfall' : 'Surplus', val: fmtMoney(Math.abs(result.shortfall)), sub: 'vs required nest egg', color: result.shortfall > 0 ? '#ef4444' : '#10b981' },
            ].map(m => (
              <div key={m.label} className="p-3 rounded-[10px] bg-[#0f0f1a] border border-[#1e1e3a]">
                <p className="text-[10px] text-[#64748b] mb-1">{m.label}</p>
                <p className="text-lg font-bold" style={{ color: m.color }}>{m.val}</p>
                <p className="text-[10px] text-[#64748b]">{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Projection chart */}
          <div>
            <p className="text-xs text-[#64748b] mb-2">Projected Wealth to Retirement</p>
            <ProjectionChart data={result.chartData} target={result.requiredNestEgg} />
          </div>

          {/* Recommendations */}
          <div>
            <p className="text-xs text-[#64748b] uppercase tracking-wide mb-2">Recommendations</p>
            <div className="space-y-1.5">
              {result.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-[#94a3b8]">
                  <ChevronRight className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0 mt-0.5" /> {r}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Simulator Tab ────────────────────────────────────────────────────────────

function SimulatorTab({ goals }: { goals: Goal[] }) {
  const [selectedId, setSelectedId] = useState<string>(goals[0]?.id ?? '')
  const [fireInputs, setFireInputs] = useState<FireInput>({ currentSavings: 100000, annualIncome: 80000, annualExpenses: 40000, monthlyContribution: 2000 })
  const [fireMode, setFireMode] = useState(false)
  const [delta, setDelta] = useState<ScenarioDelta>({ extraMonthly: 0, returnShift: 0, monthsDelay: 0, inflationBump: 0 })

  const selectedGoal = goals.find(g => g.id === selectedId)
  const baseline = useMemo(() => selectedGoal ? projectGoal(selectedGoal) : null, [selectedGoal])
  const scenario = useMemo(() => selectedGoal ? simulateScenario(selectedGoal, delta) : null, [selectedGoal, delta])
  const fire = useMemo(() => fireMode ? calcFire(fireInputs) : null, [fireInputs, fireMode])

  const setD = (k: keyof ScenarioDelta) => (v: number) => setDelta(p => ({ ...p, [k]: v }))
  const setF = (k: keyof FireInput) => (v: number) => setFireInputs(p => ({ ...p, [k]: v }))

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setFireMode(false)}
          className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-colors cursor-pointer',
            !fireMode ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)]' : 'bg-[#0f0f1a] text-[#64748b] border border-[#1e1e3a]')}
        >
          What-If Simulator
        </button>
        <button
          onClick={() => setFireMode(true)}
          className={cn('px-4 py-2 rounded-[8px] text-sm font-medium transition-colors cursor-pointer flex items-center gap-1.5',
            fireMode ? 'bg-[rgba(239,68,68,0.12)] text-[#ef4444] border border-[rgba(239,68,68,0.3)]' : 'bg-[#0f0f1a] text-[#64748b] border border-[#1e1e3a]')}
        >
          <Flame className="w-3.5 h-3.5" /> FIRE Tracker
        </button>
      </div>

      {!fireMode && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Controls */}
          <div className="space-y-4">
            {goals.length > 0 && (
              <div>
                <p className="text-xs text-[#64748b] mb-1.5">Select goal</p>
                <select
                  value={selectedId}
                  onChange={e => setSelectedId(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] bg-[#0f0f1a] border border-[#1e1e3a] text-sm text-[#94a3b8] outline-none"
                >
                  {goals.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
                </select>
              </div>
            )}

            <h4 className="text-xs text-[#64748b] uppercase tracking-wide">Adjust scenario</h4>

            {[
              { label: 'Extra monthly (+$)', key: 'extraMonthly' as const, min: 0, max: 2000, step: 50, suffix: `/mo`, display: `$${delta.extraMonthly}` },
            ].map(s => (
              <div key={s.key}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#64748b]">{s.label}</span>
                  <span className="text-[#10b981] font-medium">{s.display}</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step}
                  value={delta[s.key]} onChange={e => setD(s.key)(Number(e.target.value))}
                  className="w-full accent-[#10b981] cursor-pointer"
                />
              </div>
            ))}

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748b]">Return assumption</span>
                <span className={cn('font-medium', delta.returnShift >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]')}>
                  {delta.returnShift >= 0 ? '+' : ''}{(delta.returnShift * 100).toFixed(1)}%
                </span>
              </div>
              <input type="range" min={-0.04} max={0.04} step={0.005}
                value={delta.returnShift} onChange={e => setD('returnShift')(Number(e.target.value))}
                className="w-full accent-[#3b82f6] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-[#64748b]">Delay / advance target</span>
                <span className={cn('font-medium', delta.monthsDelay >= 0 ? 'text-[#f59e0b]' : 'text-[#10b981]')}>
                  {delta.monthsDelay >= 0 ? '+' : ''}{delta.monthsDelay} months
                </span>
              </div>
              <input type="range" min={-24} max={60} step={3}
                value={delta.monthsDelay} onChange={e => setD('monthsDelay')(Number(e.target.value))}
                className="w-full accent-[#f59e0b] cursor-pointer"
              />
            </div>

            <button
              onClick={() => setDelta({ extraMonthly: 0, returnShift: 0, monthsDelay: 0, inflationBump: 0 })}
              className="w-full py-1.5 rounded-[8px] border border-[#1e1e3a] text-xs text-[#64748b] hover:text-[#94a3b8] hover:border-[#2e2e4a] transition-colors cursor-pointer"
            >
              Reset to baseline
            </button>
          </div>

          {/* Comparison */}
          {baseline && scenario ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Baseline', proj: baseline, accent: '#64748b' },
                  { label: 'Scenario', proj: scenario, accent: '#3b82f6' },
                ].map(({ label, proj, accent }) => (
                  <div key={label} className="p-3 rounded-[12px] border border-[#1e1e3a] bg-[#0f0f1a]">
                    <p className="text-xs font-semibold mb-3" style={{ color: accent }}>{label}</p>
                    {[
                      { k: 'Expected', v: fmtMoney(proj.expected) },
                      { k: 'Probability', v: `${proj.probabilityOfSuccess}%` },
                      { k: 'Gap/mo', v: proj.gapMonthly > 0 ? `$${proj.gapMonthly.toLocaleString()}` : 'None' },
                      { k: 'Years left', v: `${proj.yearsRemaining}y` },
                    ].map(r => (
                      <div key={r.k} className="flex justify-between text-xs py-1 border-b border-[#1e1e3a] last:border-0">
                        <span className="text-[#64748b]">{r.k}</span>
                        <span className="font-semibold text-[#f1f5f9]">{r.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Delta callout */}
              <div className={cn('p-3 rounded-[10px] border flex items-start gap-2 text-xs',
                scenario.probabilityOfSuccess > baseline.probabilityOfSuccess
                  ? 'bg-[rgba(16,185,129,0.06)] border-[rgba(16,185,129,0.2)]'
                  : 'bg-[rgba(245,158,11,0.06)] border-[rgba(245,158,11,0.2)]'
              )}>
                {scenario.probabilityOfSuccess > baseline.probabilityOfSuccess
                  ? <TrendingUp className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                  : <TrendingDown className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />}
                <p className="text-[#94a3b8]">
                  Scenario moves probability from{' '}
                  <strong className="text-[#f1f5f9]">{baseline.probabilityOfSuccess}%</strong> to{' '}
                  <strong style={{ color: scenario.probabilityOfSuccess > baseline.probabilityOfSuccess ? '#10b981' : '#ef4444' }}>
                    {scenario.probabilityOfSuccess}%
                  </strong>{' '}
                  and projected value from{' '}
                  <strong className="text-[#f1f5f9]">{fmtMoney(baseline.expected)}</strong> to{' '}
                  <strong className="text-[#f1f5f9]">{fmtMoney(scenario.expected)}</strong>.
                </p>
              </div>

              <ProjectionChart data={scenario.chartData} target={selectedGoal!.target_amount} />
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center text-[#64748b]">
              <Sliders className="w-10 h-10" />
              <p className="text-sm font-medium text-[#94a3b8]">Create a goal first</p>
              <p className="text-xs">Go to "My Goals" to add a goal, then come back to simulate scenarios.</p>
            </div>
          )}
        </div>
      )}

      {/* FIRE Tracker */}
      {fireMode && (
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#f1f5f9] flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#ef4444]" /> FIRE Calculator
            </h4>
            {[
              { label: 'Current Savings ($)', key: 'currentSavings' as const },
              { label: 'Annual Income ($)', key: 'annualIncome' as const },
              { label: 'Annual Expenses ($)', key: 'annualExpenses' as const },
              { label: 'Monthly Contribution ($)', key: 'monthlyContribution' as const },
            ].map(f => (
              <div key={f.key}>
                <p className="text-xs text-[#64748b] mb-1">{f.label}</p>
                <input
                  type="number"
                  value={fireInputs[f.key]}
                  onChange={e => setF(f.key)(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-[8px] bg-[#0f0f1a] border border-[#1e1e3a] text-sm text-[#f1f5f9] outline-none focus:border-[#ef4444]"
                />
              </div>
            ))}
          </div>

          {fire && (
            <div className="space-y-4">
              {/* FI Number + progress */}
              <div className="p-4 rounded-[14px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)]">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-[#64748b] uppercase tracking-wide mb-0.5">FI Number (25x expenses)</p>
                    <p className="text-2xl font-bold text-[#f1f5f9]">{fmtMoney(fire.fiNumber)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[#64748b]">FI Year</p>
                    <p className="text-xl font-bold text-[#ef4444]">{fire.projectedFiYear}</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full bg-[#1e1e3a] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${fire.progressPct}%` }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-[#ef4444]"
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 text-[#64748b]">
                  <span>{fire.progressPct}% of FI Number</span>
                  <span>{fire.yearsToFi} years to FI</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Monthly Passive Income', val: `$${fire.monthlyPassiveIncome.toLocaleString()}`, sub: 'at FI number, 4% rule', color: '#10b981' },
                  { label: 'Current Savings Rate', val: `${fire.currentSavingsRate}%`, sub: 'of annual income', color: '#3b82f6' },
                  { label: 'Required Savings Rate', val: `${fire.requiredSavingsRate}%`, sub: 'to achieve FI in 30 years', color: '#f59e0b' },
                  { label: 'Years to FI', val: `${fire.yearsToFi}`, sub: `projected ${fire.projectedFiYear}`, color: '#ef4444' },
                ].map(m => (
                  <div key={m.label} className="p-3 rounded-[10px] bg-[#0f0f1a] border border-[#1e1e3a]">
                    <p className="text-[10px] text-[#64748b] mb-1">{m.label}</p>
                    <p className="text-lg font-bold" style={{ color: m.color }}>{m.val}</p>
                    <p className="text-[10px] text-[#64748b]">{m.sub}</p>
                  </div>
                ))}
              </div>

              <div>
                <p className="text-xs text-[#64748b] mb-2">Path to Financial Independence</p>
                <ProjectionChart data={fire.chartData} target={fire.fiNumber} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = 'overview' | 'goals' | 'retire' | 'simulate'

const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<any> }> = [
  { id: 'overview', label: 'Overview', icon: Trophy },
  { id: 'goals', label: 'My Goals', icon: Target },
  { id: 'retire', label: 'Retirement', icon: Calendar },
  { id: 'simulate', label: 'Simulator', icon: Sliders },
]

export function GoalsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('overview')
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)

  const loadGoals = useCallback(async () => {
    if (!user) return
    const { data } = await db.from('financial_goals').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    setGoals(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { loadGoals() }, [loadGoals])

  const handleAdd = (g: Goal) => setGoals(prev => [...prev, g])
  const handleDelete = async (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id))
    await db.from('financial_goals').delete().eq('id', id)
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Target className="w-6 h-6 text-[#3b82f6]" />
            Wealth Planner
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">
            Connect your investments to real-life outcomes — retirement, a home, education, or financial independence
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-[#64748b] bg-[#0f0f1a] border border-[#1e1e3a] px-3 py-2 rounded-[10px]">
          <Info className="w-3.5 h-3.5" />
          <span>{goals.length} goal{goals.length !== 1 ? 's' : ''} tracked</span>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-[#0a0a14] rounded-[14px] border border-[#1e1e3a] overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-[10px] transition-all whitespace-nowrap flex-1 justify-center cursor-pointer',
                active
                  ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.25)]'
                  : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a]'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
        >
          {loading ? (
            <div className="flex justify-center py-16 text-[#64748b] text-sm">Loading your goals...</div>
          ) : (
            <>
              {activeTab === 'overview' && <OverviewTab goals={goals} />}
              {activeTab === 'goals' && <MyGoalsTab goals={goals} userId={user.id} onAdd={handleAdd} onDelete={handleDelete} />}
              {activeTab === 'retire' && <RetirementTab />}
              {activeTab === 'simulate' && <SimulatorTab goals={goals} />}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
