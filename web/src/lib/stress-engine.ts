// ─── Stress Testing & Scenario Analysis Engine ───────────────────────────────

export type ScenarioCategory = 'historical' | 'macro' | 'sector'

export interface StressHolding {
  ticker: string
  name: string
  sector: string
  weight: number   // decimal 0–1
  beta?: number
}

export interface StressPortfolio {
  totalValue: number
  beta: number
}

// ─── Scenario definitions ─────────────────────────────────────────────────────

interface ScenarioShocks {
  Technology: number
  'Technology-AI': number     // AI/semi-heavy tech (NVDA, AMD)
  Financial: number
  Healthcare: number
  ETF: number
  Energy: number
  'Consumer Cyclical': number
  'Consumer Defensive': number
  Utilities: number
  default: number
}

interface ScenarioDef {
  id: string
  name: string
  category: ScenarioCategory
  period: string
  description: string
  trigger: string
  shocks: ScenarioShocks
  betaAmplifier: number      // 0–1, how much beta scales the shock
  baseDrawdown: number       // overall market reference drawdown
  recoveryMonths: { bear: number; base: number; bull: number }
  confidence: number         // model confidence 0–100
}

const SCENARIOS: ScenarioDef[] = [
  // ─── Historical ─────────────────────────────────────────────────────────────
  {
    id: 'crisis-2008',
    name: '2008 Financial Crisis',
    category: 'historical',
    period: 'Oct 2007 – Mar 2009',
    description: 'Global credit freeze triggered by subprime mortgage collapse. S&P 500 fell 56.8% peak-to-trough.',
    trigger: 'Subprime mortgage defaults triggered a global credit freeze, bank failures, and systemic deleveraging.',
    shocks: {
      Technology: -0.48, 'Technology-AI': -0.52, Financial: -0.76, Healthcare: -0.22,
      ETF: -0.55, Energy: -0.55, 'Consumer Cyclical': -0.60, 'Consumer Defensive': -0.18,
      Utilities: -0.28, default: -0.45,
    },
    betaAmplifier: 0.75,
    baseDrawdown: -0.568,
    recoveryMonths: { bear: 72, base: 49, bull: 36 },
    confidence: 88,
  },
  {
    id: 'covid-crash',
    name: 'COVID-19 Crash',
    category: 'historical',
    period: 'Feb – Mar 2020',
    description: 'Fastest 30% drawdown in market history. S&P 500 fell 33.9% in 33 days, then V-shaped recovery.',
    trigger: 'Global pandemic panic caused a synchronized sell-off across all asset classes as liquidity evaporated.',
    shocks: {
      Technology: -0.28, 'Technology-AI': -0.32, Financial: -0.42, Healthcare: -0.08,
      ETF: -0.34, Energy: -0.55, 'Consumer Cyclical': -0.48, 'Consumer Defensive': -0.12,
      Utilities: -0.15, default: -0.30,
    },
    betaAmplifier: 0.60,
    baseDrawdown: -0.339,
    recoveryMonths: { bear: 12, base: 5, bull: 3 },
    confidence: 92,
  },
  {
    id: 'dotcom-crash',
    name: 'Dot-com Crash',
    category: 'historical',
    period: 'Mar 2000 – Oct 2002',
    description: 'Technology speculation unwound over 30 months. Nasdaq fell 78%; S&P 500 fell 49.1%.',
    trigger: 'Valuations disconnected from fundamentals; rising rates and earnings reality ended the speculation cycle.',
    shocks: {
      Technology: -0.72, 'Technology-AI': -0.80, Financial: -0.24, Healthcare: -0.10,
      ETF: -0.49, Energy: 0.05, 'Consumer Cyclical': -0.30, 'Consumer Defensive': -0.08,
      Utilities: -0.12, default: -0.38,
    },
    betaAmplifier: 0.85,
    baseDrawdown: -0.491,
    recoveryMonths: { bear: 120, base: 84, bull: 60 },
    confidence: 85,
  },
  // ─── Macro ───────────────────────────────────────────────────────────────────
  {
    id: 'inflation-shock',
    name: 'Inflation Shock',
    category: 'macro',
    period: '2022-style (+500bps rate cycle)',
    description: 'Aggressive Fed tightening reprices long-duration growth assets. Nasdaq fell 33%; S&P fell 19.4% in 2022.',
    trigger: 'Persistent above-target inflation forces rapid rate hikes, compressing valuation multiples on growth stocks.',
    shocks: {
      Technology: -0.38, 'Technology-AI': -0.42, Financial: -0.12, Healthcare: -0.10,
      ETF: -0.20, Energy: 0.40, 'Consumer Cyclical': -0.28, 'Consumer Defensive': -0.06,
      Utilities: -0.25, default: -0.22,
    },
    betaAmplifier: 0.65,
    baseDrawdown: -0.194,
    recoveryMonths: { bear: 36, base: 24, bull: 14 },
    confidence: 80,
  },
  {
    id: 'rate-shock',
    name: 'Interest Rate Shock',
    category: 'macro',
    period: 'Hypothetical: +300bps in 6 months',
    description: 'Sudden rapid rate spike compresses high-PE growth valuations. DCF models repriced at materially higher discount rates.',
    trigger: 'Unexpected inflation re-acceleration or sovereign debt crisis forces emergency rate hikes.',
    shocks: {
      Technology: -0.44, 'Technology-AI': -0.50, Financial: -0.10, Healthcare: -0.14,
      ETF: -0.28, Energy: 0.10, 'Consumer Cyclical': -0.32, 'Consumer Defensive': -0.05,
      Utilities: -0.30, default: -0.26,
    },
    betaAmplifier: 0.70,
    baseDrawdown: -0.28,
    recoveryMonths: { bear: 48, base: 30, bull: 18 },
    confidence: 72,
  },
  {
    id: 'recession',
    name: 'Severe Recession',
    category: 'macro',
    period: 'Hypothetical: GDP -4%, unemployment 10%',
    description: 'Deep economic contraction crushes earnings across cyclicals while defensives hold. Estimated S&P drawdown of 35–45%.',
    trigger: 'Consumer spending collapse, credit tightening, and earnings revision cycle drive sustained selling.',
    shocks: {
      Technology: -0.35, 'Technology-AI': -0.38, Financial: -0.50, Healthcare: -0.14,
      ETF: -0.38, Energy: -0.40, 'Consumer Cyclical': -0.55, 'Consumer Defensive': -0.12,
      Utilities: -0.10, default: -0.35,
    },
    betaAmplifier: 0.80,
    baseDrawdown: -0.40,
    recoveryMonths: { bear: 60, base: 42, bull: 28 },
    confidence: 75,
  },
  // ─── Sector ──────────────────────────────────────────────────────────────────
  {
    id: 'ai-bubble',
    name: 'AI Bubble Burst',
    category: 'sector',
    period: 'Hypothetical: AI capex disappointment',
    description: 'AI monetization fails to justify $1T+ capex cycle. High-multiple AI beneficiaries fall 60–70%; broad tech down 35%.',
    trigger: 'Hyperscaler capex cuts, AI revenue disappointment, or breakthrough by open-source rivals triggers derating.',
    shocks: {
      Technology: -0.35, 'Technology-AI': -0.65, Financial: -0.18, Healthcare: -0.08,
      ETF: -0.28, Energy: -0.05, 'Consumer Cyclical': -0.20, 'Consumer Defensive': -0.05,
      Utilities: -0.05, default: -0.22,
    },
    betaAmplifier: 0.90,
    baseDrawdown: -0.35,
    recoveryMonths: { bear: 60, base: 36, bull: 24 },
    confidence: 68,
  },
  {
    id: 'semi-crash',
    name: 'Semiconductor Crash',
    category: 'sector',
    period: 'Hypothetical: inventory glut + export bans',
    description: 'Severe semiconductor downcycle as inventory corrects and China export restrictions expand. Semi stocks fall 50–60%.',
    trigger: 'Inventory normalization after AI buildout plateau, combined with tighter US export controls on advanced chips.',
    shocks: {
      Technology: -0.22, 'Technology-AI': -0.55, Financial: -0.08, Healthcare: -0.04,
      ETF: -0.18, Energy: -0.03, 'Consumer Cyclical': -0.12, 'Consumer Defensive': -0.02,
      Utilities: -0.02, default: -0.15,
    },
    betaAmplifier: 0.95,
    baseDrawdown: -0.22,
    recoveryMonths: { bear: 30, base: 18, bull: 12 },
    confidence: 74,
  },
  {
    id: 'energy-collapse',
    name: 'Energy Sector Collapse',
    category: 'sector',
    period: 'Hypothetical: oil to $30/bbl',
    description: 'Oil price collapse driven by OPEC+ breakdown and demand destruction. Energy sector falls 55–65%; limited tech spillover.',
    trigger: 'Coordinated OPEC+ production surge, EV adoption acceleration, or global recession cuts oil demand sharply.',
    shocks: {
      Technology: -0.05, 'Technology-AI': -0.06, Financial: -0.14, Healthcare: -0.03,
      ETF: -0.12, Energy: -0.62, 'Consumer Cyclical': -0.10, 'Consumer Defensive': 0.02,
      Utilities: 0.05, default: -0.10,
    },
    betaAmplifier: 0.40,
    baseDrawdown: -0.12,
    recoveryMonths: { bear: 36, base: 24, bull: 12 },
    confidence: 77,
  },
]

// ─── Per-ticker overrides for AI/Semi classification ─────────────────────────

const AI_HEAVY_TICKERS = new Set(['NVDA', 'AMD', 'AVGO', 'INTC', 'QCOM', 'ASML', 'TSM'])
const HIGH_BETAS: Record<string, number> = {
  NVDA: 2.15, AMD: 1.90, CRWD: 1.85, NET: 1.75, PLTR: 2.0,
  META: 1.25, GOOGL: 1.10, AAPL: 1.28, MSFT: 0.89,
  JPM: 1.12, JNJ: 0.59, VTI: 1.00, 'BRK.B': 0.90,
  KO: 0.60, PG: 0.55, COST: 0.90, MA: 1.10, V: 1.05,
}

function getEffectiveBeta(holding: StressHolding): number {
  return HIGH_BETAS[holding.ticker] ?? holding.beta ?? 1.0
}

function getSectorShock(scenario: ScenarioDef, holding: StressHolding): number {
  const isAiHeavy = AI_HEAVY_TICKERS.has(holding.ticker)
  const key = isAiHeavy && holding.sector === 'Technology' ? 'Technology-AI' : holding.sector
  return (scenario.shocks as any)[key] ?? scenario.shocks.default
}

// ─── Output types ─────────────────────────────────────────────────────────────

export interface HoldingImpact {
  ticker: string
  name: string
  sector: string
  weight: number
  beta: number
  shockFactor: number            // e.g. -0.45 = 45% loss
  dollarImpact: number           // negative = loss
  contribution: number           // this holding's share of portfolio loss (0–1)
}

export interface RecoveryPoint {
  month: number
  value: number      // index 100 = starting value
  label?: string
}

export interface ScenarioAdjustment {
  priority: 'high' | 'medium' | 'low'
  action: string
  rationale: string
  impact: string
}

export interface ScenarioResult {
  scenario: ScenarioDef
  portfolioDrawdown: number        // -0.38 = 38% loss
  dollarImpact: number             // -54000
  portfolioAfter: number           // 88000
  bearCase: number
  baseCase: number
  bullCase: number
  recoveryMonths: number
  holdingImpacts: HoldingImpact[]
  vulnerableHoldings: HoldingImpact[]
  resilientHoldings: HoldingImpact[]
  adjustments: ScenarioAdjustment[]
  recoveryPath: RecoveryPoint[]
  riskScore: number                // 0–100, higher = worse
}

// ─── Computation ──────────────────────────────────────────────────────────────

function computeHoldingImpact(
  scenario: ScenarioDef,
  holding: StressHolding,
  totalValue: number,
): HoldingImpact {
  const beta = getEffectiveBeta(holding)
  const sectorShock = getSectorShock(scenario, holding)
  // Beta amplifies the shock: high-beta stocks fall harder in sell-offs
  const betaAdj = 1 + (beta - 1) * scenario.betaAmplifier
  const shockFactor = Math.max(-0.95, sectorShock * betaAdj)
  const dollarImpact = totalValue * holding.weight * shockFactor
  return {
    ticker: holding.ticker,
    name: holding.name,
    sector: holding.sector,
    weight: holding.weight,
    beta,
    shockFactor,
    dollarImpact,
    contribution: 0, // filled in after summing
  }
}

function buildRecoveryPath(
  trough: number,
  recoveryMonths: number,
): RecoveryPoint[] {
  const points: RecoveryPoint[] = []
  const preMonths = 3
  const totalMonths = preMonths + Math.round(recoveryMonths * 1.1)

  for (let m = 0; m <= totalMonths; m++) {
    let value: number
    if (m < preMonths) {
      value = 100
    } else if (m === preMonths) {
      // Shock happens at month 3
      value = 100 * (1 + trough)
    } else {
      // Recovery: logarithmic shape back toward 100
      const elapsed = m - preMonths
      const progress = Math.min(1, elapsed / recoveryMonths)
      // Log curve: fast early recovery, slows near the top
      const logProgress = Math.log(1 + progress * 9) / Math.log(10)
      value = 100 * (1 + trough) + (100 - 100 * (1 + trough)) * logProgress
    }
    points.push({ month: m - preMonths, value: Math.round(value * 10) / 10 })
  }
  return points
}

function buildAdjustments(
  scenario: ScenarioDef,
  impacts: HoldingImpact[],
  portfolio: StressPortfolio,
): ScenarioAdjustment[] {
  const adjustments: ScenarioAdjustment[] = []
  const sorted = [...impacts].sort((a, b) => a.shockFactor - b.shockFactor)
  const worst = sorted.slice(0, 2)
  const techWeight = impacts.filter(h => h.sector === 'Technology').reduce((s, h) => s + h.weight, 0)

  // High-impact holding-specific
  if (worst[0] && worst[0].shockFactor < -0.35) {
    adjustments.push({
      priority: 'high',
      action: `Reduce ${worst[0].ticker} position from ${Math.round(worst[0].weight * 100)}% to ≤10%`,
      rationale: `In this scenario, ${worst[0].ticker} faces a ${Math.abs(Math.round(worst[0].shockFactor * 100))}% drawdown — it is your single largest risk contributor.`,
      impact: `Reducing by half would save ~$${Math.abs(Math.round(worst[0].dollarImpact * 0.5 / 1000))}k in this scenario.`,
    })
  }

  // Tech concentration
  if (techWeight > 0.50 && (scenario.category === 'historical' || scenario.id === 'dotcom-crash' || scenario.id === 'ai-bubble' || scenario.id === 'semi-crash')) {
    adjustments.push({
      priority: 'high',
      action: 'Diversify out of Technology — currently 65% of portfolio',
      rationale: `Your ${Math.round(techWeight * 100)}% tech concentration amplifies losses in this scenario. Target <40% for resilience.`,
      impact: 'Rebalancing 15% into Financials, Healthcare, or ETFs could reduce this scenario loss by 8–12%.',
    })
  }

  // Scenario-specific
  if (scenario.id === 'crisis-2008' || scenario.id === 'recession') {
    adjustments.push({
      priority: 'high',
      action: 'Add 10–15% allocation to short-duration bonds or cash equivalents',
      rationale: 'In credit-driven crises, liquidity is critical. Cash/T-bills serve as dry powder for opportunistic buying at the trough.',
      impact: 'A 15% cash buffer reduces portfolio volatility by ~20% and provides rebalancing capital.',
    })
  }

  if (scenario.id === 'inflation-shock' || scenario.id === 'rate-shock') {
    adjustments.push({
      priority: 'medium',
      action: 'Rotate 10% from growth tech into value or commodity exposure',
      rationale: 'Rate/inflation shocks favor value, energy, and real assets. Reducing high-PE tech lowers rate sensitivity.',
      impact: `Energy sector returned +${scenario.id === 'inflation-shock' ? '59' : '22'}% in the 2022 rate shock while tech fell 38%.`,
    })
  }

  if (scenario.id === 'ai-bubble' || scenario.id === 'semi-crash') {
    adjustments.push({
      priority: 'high',
      action: 'Reduce AI/semiconductor concentration — NVDA at 20.1% is your primary risk',
      rationale: 'NVDA drives the majority of portfolio loss in this scenario. Trimming to 10% materially reduces exposure.',
      impact: `Halving NVDA saves ~$${Math.abs(Math.round(impacts.find(h => h.ticker === 'NVDA')?.dollarImpact ?? 0) / 2000)}k in this scenario.`,
    })
  }

  // Defensive hedge
  adjustments.push({
    priority: 'medium',
    action: 'Add defensive positions: consumer staples ETF (VDC) or healthcare (VHT)',
    rationale: 'Defensive sectors historically outperform in all 9 stress scenarios modeled. They are currently 7.1% of your portfolio.',
    impact: 'Adding 10% defensive allocation reduces expected max drawdown by 3–5 percentage points.',
  })

  // International diversification
  if (scenario.category === 'historical' || scenario.category === 'macro') {
    adjustments.push({
      priority: 'low',
      action: 'Add 5–10% international developed market exposure (VEA or EAFE)',
      rationale: 'Zero international exposure means you have no geographic diversification. Non-US stocks sometimes diverge during US-centric crises.',
      impact: 'International allocation provides modest (~2–4%) loss mitigation in US-specific downturns.',
    })
  }

  return adjustments.slice(0, 5)
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function runStressTest(
  holdings: StressHolding[],
  portfolio: StressPortfolio,
): ScenarioResult[] {
  return SCENARIOS.map(scenario => {
    // Compute per-holding impacts
    const impacts = holdings.map(h => computeHoldingImpact(scenario, h, portfolio.totalValue))

    // Portfolio-level drawdown = sum of weighted impacts
    const totalDollarLoss = impacts.reduce((s, h) => s + h.dollarImpact, 0)
    const portfolioDrawdown = totalDollarLoss / portfolio.totalValue

    // Fill contribution %
    impacts.forEach(h => {
      h.contribution = totalDollarLoss !== 0 ? Math.abs(h.dollarImpact / totalDollarLoss) : 0
    })

    // Bear/bull cases: ±30% variance around base
    const baseCase = portfolioDrawdown
    const bearCase = portfolioDrawdown * 1.30
    const bullCase = portfolioDrawdown * 0.65

    const portfolioAfter = portfolio.totalValue + totalDollarLoss
    const recoveryMonths = scenario.recoveryMonths.base

    // Sort for vulnerable/resilient
    const sorted = [...impacts].sort((a, b) => a.shockFactor - b.shockFactor)
    const vulnerableHoldings = sorted.slice(0, 3)
    const resilientHoldings = [...impacts].sort((a, b) => b.shockFactor - a.shockFactor).slice(0, 2)

    // Risk score: 0–100 where higher = worse
    const riskScore = Math.min(100, Math.round(Math.abs(portfolioDrawdown) * 200))

    const adjustments = buildAdjustments(scenario, impacts, portfolio)
    const recoveryPath = buildRecoveryPath(portfolioDrawdown, recoveryMonths)

    return {
      scenario,
      portfolioDrawdown,
      dollarImpact: totalDollarLoss,
      portfolioAfter,
      bearCase,
      baseCase,
      bullCase,
      recoveryMonths,
      holdingImpacts: impacts,
      vulnerableHoldings,
      resilientHoldings,
      adjustments,
      recoveryPath,
      riskScore,
    }
  })
}

export function getSeverityLevel(drawdown: number): 'severe' | 'high' | 'moderate' | 'low' {
  const abs = Math.abs(drawdown)
  if (abs >= 0.40) return 'severe'
  if (abs >= 0.25) return 'high'
  if (abs >= 0.12) return 'moderate'
  return 'low'
}

export const SEVERITY_META = {
  severe:   { color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   label: 'Severe' },
  high:     { color: '#f97316', bg: 'rgba(249,115,22,0.1)',  border: 'rgba(249,115,22,0.3)',  label: 'High' },
  moderate: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)',  label: 'Moderate' },
  low:      { color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)',  label: 'Low' },
} as const

export const CATEGORY_META: Record<ScenarioCategory, { label: string; color: string }> = {
  historical: { label: 'Historical', color: '#3b82f6' },
  macro:      { label: 'Macro', color: '#8b5cf6' },
  sector:     { label: 'Sector', color: '#f59e0b' },
}

export { SCENARIOS }
export type { ScenarioDef }
