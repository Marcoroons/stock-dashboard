// ─── Wealth Planning & Goal Achievement Engine ────────────────────────────────

export type GoalType = 'retirement' | 'house' | 'education' | 'fire' | 'business' | 'custom'
export type GoalStatus = 'excellent' | 'on_track' | 'slightly_behind' | 'behind' | 'significantly_behind'

export interface Goal {
  id: string
  user_id?: string
  type: GoalType
  label: string
  target_amount: number
  current_amount: number
  monthly_contribution: number
  target_date: string   // YYYY-MM-DD
  notes?: string
  created_at?: string
}

export interface ProjectionPoint {
  year: number
  conservative: number
  expected: number
  optimistic: number
  target: number
}

export interface GoalProjection {
  conservative: number
  expected: number
  optimistic: number
  probabilityOfSuccess: number
  yearsRemaining: number
  monthsRemaining: number
  onTrack: boolean
  projectedSurplus: number    // expected - target (negative = shortfall)
  gapMonthly: number          // extra per month needed at expected rate
  progressPct: number         // current_amount / target_amount
  milestoneIndex: number      // 0=<25%, 1=25%, 2=50%, 3=75%, 4=100%
  recommendations: string[]
  chartData: ProjectionPoint[]
}

// ─── Internal math helpers ────────────────────────────────────────────────────

const RATES = { conservative: 0.05, expected: 0.08, optimistic: 0.11 }
const VOL_BALANCED = 0.12

function fvMonthly(pv: number, annualRate: number, months: number, pmt: number): number {
  const r = annualRate / 12
  if (r === 0 || months === 0) return pv + pmt * months
  const factor = Math.pow(1 + r, months)
  return pv * factor + pmt * (factor - 1) / r
}

function boxMuller(): number {
  const u1 = Math.max(1e-12, Math.random())
  const u2 = Math.random()
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function monteCarlo(pv: number, pmt: number, months: number, target: number): number {
  const SIMS = 300
  const mr = RATES.expected / 12
  const ms = VOL_BALANCED / Math.sqrt(12)
  let successes = 0
  for (let s = 0; s < SIMS; s++) {
    let v = pv
    for (let m = 0; m < months; m++) {
      v = v * (1 + mr + boxMuller() * ms) + pmt
      if (v < 0) v = 0
    }
    if (v >= target) successes++
  }
  return Math.round((successes / SIMS) * 100)
}

function monthsUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return Math.max(1, Math.round((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.44)))
}

function chartData(pv: number, pmt: number, years: number, target: number): ProjectionPoint[] {
  const thisYear = new Date().getFullYear()
  const data: ProjectionPoint[] = []
  for (let y = 0; y <= Math.ceil(years) + 1; y++) {
    data.push({
      year: thisYear + y,
      conservative: Math.round(fvMonthly(pv, RATES.conservative, y * 12, pmt)),
      expected: Math.round(fvMonthly(pv, RATES.expected, y * 12, pmt)),
      optimistic: Math.round(fvMonthly(pv, RATES.optimistic, y * 12, pmt)),
      target,
    })
  }
  return data
}

// ─── Goal Projection ──────────────────────────────────────────────────────────

export function projectGoal(goal: Goal): GoalProjection {
  const months = monthsUntil(goal.target_date)
  const years = months / 12
  const pv = goal.current_amount
  const pmt = goal.monthly_contribution
  const t = goal.target_amount

  const cons = fvMonthly(pv, RATES.conservative, months, pmt)
  const exp = fvMonthly(pv, RATES.expected, months, pmt)
  const opt = fvMonthly(pv, RATES.optimistic, months, pmt)

  const prob = monteCarlo(pv, pmt, months, t)

  // Required monthly at expected rate to hit target
  const mr = RATES.expected / 12
  const factor = Math.pow(1 + mr, months)
  const pvGrown = pv * factor
  const requiredPmt = t > pvGrown ? (t - pvGrown) * mr / (factor - 1) : 0
  const gapMonthly = Math.max(0, Math.round(requiredPmt - pmt))

  const progressPct = t > 0 ? Math.min(100, (pv / t) * 100) : 0
  const milestoneIndex = progressPct >= 100 ? 4 : progressPct >= 75 ? 3 : progressPct >= 50 ? 2 : progressPct >= 25 ? 1 : 0

  const recs: string[] = []
  if (prob < 40) {
    if (gapMonthly > 0) recs.push(`Increase contributions by $${gapMonthly.toLocaleString()}/mo to put this goal on track`)
    recs.push('Consider extending your target date by 12–24 months to improve success odds')
    recs.push('Review if any expenses can be redirected toward this goal')
  } else if (prob < 65) {
    if (gapMonthly > 0 && gapMonthly < 500) recs.push(`A small increase of $${gapMonthly.toLocaleString()}/mo would significantly improve your probability`)
    recs.push('Investing any windfalls (bonuses, tax returns) directly toward this goal helps close the gap')
  } else {
    recs.push("You're on track — maintain your current contribution rate")
    recs.push('Consider automating contributions to avoid missing months')
    if (goal.type !== 'fire' && years > 10) recs.push('As markets grow your balance, consider periodic rebalancing')
  }

  return {
    conservative: Math.round(cons),
    expected: Math.round(exp),
    optimistic: Math.round(opt),
    probabilityOfSuccess: prob,
    yearsRemaining: parseFloat(years.toFixed(1)),
    monthsRemaining: months,
    onTrack: exp >= t,
    projectedSurplus: Math.round(exp - t),
    gapMonthly,
    progressPct: parseFloat(progressPct.toFixed(1)),
    milestoneIndex,
    recommendations: recs,
    chartData: chartData(pv, pmt, years, t),
  }
}

// ─── Retirement Planner ───────────────────────────────────────────────────────

export interface RetirementInput {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyContribution: number
  expectedMonthlyExpenses: number
}

export interface RetirementResult {
  yearsToRetirement: number
  projectedValue: number
  conservativeValue: number
  optimisticValue: number
  requiredNestEgg: number
  safeWithdrawalMonthly: number
  shortfall: number
  readinessScore: number
  status: GoalStatus
  probabilityOfSuccess: number
  recommendations: string[]
  chartData: ProjectionPoint[]
}

export function calcRetirement(input: RetirementInput): RetirementResult {
  const years = Math.max(1, input.retirementAge - input.currentAge)
  const months = years * 12
  const required = input.expectedMonthlyExpenses * 12 * 25   // 4% rule inverted

  const projected = fvMonthly(input.currentSavings, RATES.expected, months, input.monthlyContribution)
  const conservative = fvMonthly(input.currentSavings, RATES.conservative, months, input.monthlyContribution)
  const optimistic = fvMonthly(input.currentSavings, RATES.optimistic, months, input.monthlyContribution)

  const safeMonthly = (projected * 0.04) / 12
  const shortfall = required - projected
  const prob = monteCarlo(input.currentSavings, input.monthlyContribution, months, required)
  const coverage = Math.min(1.5, projected / Math.max(1, required))
  const readinessScore = Math.min(100, Math.round(prob * 0.6 + coverage * 40 * 0.4))

  let status: GoalStatus
  if (readinessScore >= 85) status = 'excellent'
  else if (readinessScore >= 70) status = 'on_track'
  else if (readinessScore >= 52) status = 'slightly_behind'
  else if (readinessScore >= 35) status = 'behind'
  else status = 'significantly_behind'

  const recs: string[] = []
  if (shortfall > 0) {
    const extra = Math.round(shortfall / months)
    recs.push(`Increase contributions by ~$${extra.toLocaleString()}/mo to close the $${Math.round(shortfall / 1000)}k gap`)
  }
  if (years > 20) recs.push('Time is your greatest asset — maximize equity exposure for long-term compounding')
  if (years < 10) recs.push('Minimize lifestyle inflation and direct any raises toward retirement savings')
  recs.push('Maximize tax-advantaged accounts (401k employer match, Roth IRA, HSA)')
  if (projected >= required) recs.push('You\'re on track — consider a drawdown strategy with a fee-only financial advisor')

  const cd = chartData(input.currentSavings, input.monthlyContribution, years, required)
  return {
    yearsToRetirement: years,
    projectedValue: Math.round(projected),
    conservativeValue: Math.round(conservative),
    optimisticValue: Math.round(optimistic),
    requiredNestEgg: Math.round(required),
    safeWithdrawalMonthly: Math.round(safeMonthly),
    shortfall: Math.round(shortfall),
    readinessScore,
    status,
    probabilityOfSuccess: prob,
    recommendations: recs,
    chartData: cd,
  }
}

// ─── FIRE Calculator ──────────────────────────────────────────────────────────

export interface FireInput {
  currentSavings: number
  annualIncome: number
  annualExpenses: number
  monthlyContribution: number
}

export interface FireResult {
  fiNumber: number
  progressPct: number
  yearsToFi: number
  projectedFiYear: number
  currentSavingsRate: number
  requiredSavingsRate: number
  monthlyPassiveIncome: number
  chartData: ProjectionPoint[]
}

export function calcFire(input: FireInput): FireResult {
  const fiNumber = input.annualExpenses * 25
  const progressPct = fiNumber > 0 ? Math.min(100, (input.currentSavings / fiNumber) * 100) : 0
  const currentSavingsRate = input.annualIncome > 0 ? (input.monthlyContribution * 12 / input.annualIncome) * 100 : 0

  // Iterate to find years to FI
  let val = input.currentSavings
  const mr = RATES.expected / 12
  let months = 0
  while (val < fiNumber && months < 720) {
    val = val * (1 + mr) + input.monthlyContribution
    months++
  }
  const yearsToFi = parseFloat((months / 12).toFixed(1))

  // Required savings rate over 30 years
  const f30 = Math.pow(1 + mr, 360)
  const pvGrown30 = input.currentSavings * f30
  const reqPmt = Math.max(0, (fiNumber - pvGrown30) * mr / (f30 - 1))
  const requiredSavingsRate = input.annualIncome > 0 ? (reqPmt * 12 / input.annualIncome) * 100 : 0

  const displayYears = Math.min(Math.ceil(yearsToFi) + 5, 45)
  const cd = chartData(input.currentSavings, input.monthlyContribution, displayYears, fiNumber)

  return {
    fiNumber: Math.round(fiNumber),
    progressPct: parseFloat(progressPct.toFixed(1)),
    yearsToFi,
    projectedFiYear: new Date().getFullYear() + Math.ceil(yearsToFi),
    currentSavingsRate: Math.round(currentSavingsRate),
    requiredSavingsRate: Math.round(requiredSavingsRate),
    monthlyPassiveIncome: Math.round((fiNumber * 0.04) / 12),
    chartData: cd,
  }
}

// ─── Wealth Score ─────────────────────────────────────────────────────────────

export interface WealthScoreResult {
  total: number
  goalProgress: number    // 0-25
  savingsRate: number     // 0-25
  consistency: number     // 0-25
  riskAlignment: number   // 0-25
  label: string
  color: string
  description: string
}

export function calcWealthScore(goals: Goal[], riskScore = 50): WealthScoreResult {
  if (goals.length === 0) {
    return { total: 12, goalProgress: 3, savingsRate: 3, consistency: 3, riskAlignment: 3,
      label: 'Getting Started', color: '#ef4444',
      description: 'Create your first goal to start building your wealth plan.' }
  }
  const projs = goals.map(g => projectGoal(g))
  const avgProb = projs.reduce((s, p) => s + p.probabilityOfSuccess, 0) / projs.length
  const goalProgress = Math.round(avgProb * 0.25)
  const totalContrib = goals.reduce((s, g) => s + g.monthly_contribution, 0)
  const savingsRate = Math.min(25, totalContrib > 0 ? Math.round(Math.log10(totalContrib + 1) * 7) : 4)
  const consistency = Math.round((projs.filter(p => p.onTrack).length / projs.length) * 25)
  const riskAlignment = Math.min(25, Math.max(5, Math.round(15 + (riskScore - 50) * 0.2)))
  const total = Math.min(100, goalProgress + savingsRate + consistency + riskAlignment)

  if (total >= 80) return { total, goalProgress, savingsRate, consistency, riskAlignment, label: 'Financial Champion', color: '#10b981', description: "Outstanding wealth planning — you're well positioned to achieve all your goals." }
  if (total >= 65) return { total, goalProgress, savingsRate, consistency, riskAlignment, label: 'Wealth Builder', color: '#3b82f6', description: 'Strong foundation. Keep up the consistent contributions and you\'re headed for success.' }
  if (total >= 50) return { total, goalProgress, savingsRate, consistency, riskAlignment, label: 'On Track', color: '#f59e0b', description: 'Good progress. A few adjustments could significantly improve your probability of success.' }
  if (total >= 35) return { total, goalProgress, savingsRate, consistency, riskAlignment, label: 'Building Momentum', color: '#f97316', description: "You've started your wealth journey. Increasing contributions will accelerate your progress." }
  return { total, goalProgress, savingsRate, consistency, riskAlignment, label: 'Getting Started', color: '#ef4444', description: 'Set up your goals and start contributing consistently to build your financial future.' }
}

// ─── Scenario Simulator ───────────────────────────────────────────────────────

export interface ScenarioDelta {
  extraMonthly: number      // additional monthly contribution
  returnShift: number       // e.g. -0.02 = 2% lower assumed return
  monthsDelay: number       // delay / advance target date
  inflationBump: number     // inflate target by this fraction (e.g. 0.10 = 10% higher target)
}

export function simulateScenario(goal: Goal, delta: ScenarioDelta): GoalProjection {
  const d = new Date(goal.target_date)
  d.setMonth(d.getMonth() + delta.monthsDelay)
  const adjusted: Goal = {
    ...goal,
    monthly_contribution: goal.monthly_contribution + delta.extraMonthly,
    target_date: d.toISOString().split('T')[0],
    target_amount: goal.target_amount * (1 + delta.inflationBump),
  }
  // Temporarily adjust rates for return shift
  const origRates = { ...RATES }
  if (delta.returnShift !== 0) {
    RATES.conservative += delta.returnShift
    RATES.expected += delta.returnShift
    RATES.optimistic += delta.returnShift
  }
  const result = projectGoal(adjusted)
  // Restore
  RATES.conservative = origRates.conservative
  RATES.expected = origRates.expected
  RATES.optimistic = origRates.optimistic
  return result
}

// ─── Goal type metadata ───────────────────────────────────────────────────────

export const GOAL_META: Record<GoalType, { label: string; icon: string; color: string; defaultLabel: string; defaultYears: number; suggestedTarget: number }> = {
  retirement: { label: 'Retirement', icon: '🏖️', color: '#3b82f6', defaultLabel: 'Retirement Fund', defaultYears: 30, suggestedTarget: 2000000 },
  house: { label: 'Home Purchase', icon: '🏡', color: '#10b981', defaultLabel: 'Home Deposit', defaultYears: 7, suggestedTarget: 150000 },
  education: { label: 'Education', icon: '🎓', color: '#f59e0b', defaultLabel: "Children's Education", defaultYears: 15, suggestedTarget: 300000 },
  fire: { label: 'Financial Independence', icon: '🔥', color: '#ef4444', defaultLabel: 'FIRE Goal', defaultYears: 20, suggestedTarget: 1500000 },
  business: { label: 'Start a Business', icon: '🏢', color: '#8b5cf6', defaultLabel: 'Business Capital', defaultYears: 5, suggestedTarget: 100000 },
  custom: { label: 'Custom Goal', icon: '⭐', color: '#06b6d4', defaultLabel: 'My Goal', defaultYears: 10, suggestedTarget: 500000 },
}

export const STATUS_META: Record<GoalStatus, { label: string; color: string }> = {
  excellent: { label: 'Ahead of Schedule', color: '#10b981' },
  on_track: { label: 'On Track', color: '#3b82f6' },
  slightly_behind: { label: 'Slightly Behind', color: '#f59e0b' },
  behind: { label: 'Behind', color: '#f97316' },
  significantly_behind: { label: 'Needs Attention', color: '#ef4444' },
}

export function goalStatus(proj: GoalProjection): GoalStatus {
  const p = proj.probabilityOfSuccess
  if (p >= 85) return 'excellent'
  if (p >= 70) return 'on_track'
  if (p >= 52) return 'slightly_behind'
  if (p >= 35) return 'behind'
  return 'significantly_behind'
}

// ─── Formatting helpers ───────────────────────────────────────────────────────

export function fmtMoney(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n.toFixed(0)}`
}

export function fmtMoneyFull(n: number): string {
  return `$${Math.abs(n).toLocaleString()}`
}

// Milestone thresholds
export const MILESTONES = [
  { pct: 25, label: '25% Reached', icon: '🌱' },
  { pct: 50, label: 'Halfway There', icon: '🌿' },
  { pct: 75, label: '75% Reached', icon: '🌳' },
  { pct: 100, label: 'Goal Achieved!', icon: '🏆' },
]
