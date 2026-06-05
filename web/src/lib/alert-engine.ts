import type { DnaInput } from './dna-engine'
import type { Goal } from './wealth-engine'
import { projectGoal } from './wealth-engine'

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertType = 'portfolio' | 'opportunity' | 'news' | 'goal'
export type AlertPriority = 'critical' | 'warning' | 'info' | 'positive'

export interface GeneratedAlert {
  type: AlertType
  priority: AlertPriority
  title: string
  body: string
  meta: Record<string, unknown>
}

export interface AlertCounts {
  total: number
  unread: number
  portfolio: number
  opportunity: number
  news: number
  goal: number
}

// ─── Input shapes (matches mock.ts) ──────────────────────────────────────────

export interface AlertHolding {
  ticker: string
  name: string
  sector: string
  weight: number
  change: number
  costBasis: number
  currentPrice: number
}

export interface AlertPortfolio {
  totalValue: number
  beta: number
  volatility: number
  sharpe: number
  ytdReturn: number
  maxDrawdown: number
}

export interface AlertNews {
  ticker: string
  headline: string
  sentiment: 'bullish' | 'neutral' | 'bearish'
  sentimentScore: number
  importanceScore: number
  affectsPortfolio: boolean
  portfolioExposure: number
  whyItMatters: string
  actionableInsight: string
  timeHorizonImpact: 'short' | 'medium' | 'long'
  category: string
}

// ─── Portfolio alerts ─────────────────────────────────────────────────────────

function portfolioAlerts(holdings: AlertHolding[], portfolio: AlertPortfolio): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = []

  // Sector concentration
  const bySector: Record<string, number> = {}
  for (const h of holdings) {
    bySector[h.sector] = (bySector[h.sector] ?? 0) + h.weight
  }
  for (const [sector, weight] of Object.entries(bySector)) {
    if (weight >= 0.6) {
      alerts.push({
        type: 'portfolio',
        priority: 'critical',
        title: `${sector} concentration at ${Math.round(weight * 100)}%`,
        body: `Your portfolio is ${Math.round(weight * 100)}% concentrated in ${sector} stocks — significantly above the 40% diversification threshold. A sector-specific downturn could cause outsized losses.`,
        meta: { sector, weight, threshold: 0.4 },
      })
    } else if (weight >= 0.45) {
      alerts.push({
        type: 'portfolio',
        priority: 'warning',
        title: `${sector} exposure elevated at ${Math.round(weight * 100)}%`,
        body: `${sector} represents ${Math.round(weight * 100)}% of your portfolio. Consider whether this aligns with your risk tolerance and whether gradual diversification is warranted.`,
        meta: { sector, weight, threshold: 0.4 },
      })
    }
  }

  // Single-stock concentration
  for (const h of holdings) {
    if (h.weight >= 0.20) {
      alerts.push({
        type: 'portfolio',
        priority: 'warning',
        title: `${h.ticker} is ${Math.round(h.weight * 100)}% of your portfolio`,
        body: `${h.name} represents ${Math.round(h.weight * 100)}% of total holdings. A single stock above 15% introduces meaningful idiosyncratic risk that diversification cannot eliminate.`,
        meta: { ticker: h.ticker, weight: h.weight, threshold: 0.15 },
      })
    }
  }

  // High beta
  if (portfolio.beta >= 1.2) {
    alerts.push({
      type: 'portfolio',
      priority: 'warning',
      title: `Portfolio beta ${portfolio.beta.toFixed(2)} — above-market sensitivity`,
      body: `Your portfolio moves ${portfolio.beta.toFixed(2)}x the market on average. In a 10% market decline, expect roughly a ${Math.round(portfolio.beta * 10)}% drawdown. This is consistent with growth positioning but worth monitoring.`,
      meta: { beta: portfolio.beta, threshold: 1.2 },
    })
  }

  // Strong Sharpe (positive alert)
  if (portfolio.sharpe >= 1.5) {
    alerts.push({
      type: 'portfolio',
      priority: 'positive',
      title: `Excellent risk-adjusted returns — Sharpe ratio ${portfolio.sharpe.toFixed(2)}`,
      body: `Your portfolio's Sharpe ratio of ${portfolio.sharpe.toFixed(2)} is well above the 1.0 institutional benchmark. You are generating strong returns relative to the volatility you're accepting.`,
      meta: { sharpe: portfolio.sharpe, benchmark: 1.0 },
    })
  }

  // YTD performance
  if (portfolio.ytdReturn >= 0.20) {
    alerts.push({
      type: 'portfolio',
      priority: 'positive',
      title: `Portfolio up ${Math.round(portfolio.ytdReturn * 100)}% year-to-date`,
      body: `Your portfolio has outperformed the S&P 500 year-to-date. Consider whether taking some profits to rebalance toward your target allocation makes sense given current valuations.`,
      meta: { ytdReturn: portfolio.ytdReturn },
    })
  }

  return alerts
}

// ─── Opportunity alerts ───────────────────────────────────────────────────────

interface OpportunityCandidate {
  ticker: string
  name: string
  dnaScore: number    // 0-100
  sector: string
  analystTarget: number
  currentPrice: number
  pe: number
  fundamentalsScore: number
  reason: string
}

const OPPORTUNITY_CANDIDATES: OpportunityCandidate[] = [
  {
    ticker: 'MSFT', name: 'Microsoft Corp.', dnaScore: 84, sector: 'Technology',
    analystTarget: 480, currentPrice: 412.80, pe: 35.1, fundamentalsScore: 84,
    reason: 'Azure acceleration + OpenAI monetization beginning to show in revenue',
  },
  {
    ticker: 'META', name: 'Meta Platforms', dnaScore: 78, sector: 'Technology',
    analystTarget: 520, currentPrice: 492.80, pe: 24.2, fundamentalsScore: 79,
    reason: 'Trading at 5.6% discount to consensus target with strong ad recovery',
  },
  {
    ticker: 'GOOGL', name: 'Alphabet Inc.', dnaScore: 74, sector: 'Technology',
    analystTarget: 205, currentPrice: 178.40, pe: 21.8, fundamentalsScore: 74,
    reason: 'Search moat intact; 14.9% upside to fair value with AI search integration',
  },
  {
    ticker: 'SCHD', name: 'Schwab US Dividend ETF', dnaScore: 71, sector: 'ETF',
    analystTarget: 88, currentPrice: 79.20, pe: 18.5, fundamentalsScore: 72,
    reason: 'High-quality dividend exposure with 3.5% yield and low expense ratio',
  },
]

function opportunityAlerts(dna: DnaInput | null): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = []

  for (const opp of OPPORTUNITY_CANDIDATES) {
    const upside = (opp.analystTarget - opp.currentPrice) / opp.currentPrice

    if (opp.dnaScore >= 80) {
      alerts.push({
        type: 'opportunity',
        priority: 'positive',
        title: `${opp.ticker} matches your DNA at ${opp.dnaScore}/100`,
        body: `${opp.name} is your highest-compatibility opportunity right now. ${opp.reason}. Analyst consensus target implies ${Math.round(upside * 100)}% upside.`,
        meta: { ticker: opp.ticker, dnaScore: opp.dnaScore, upside, analystTarget: opp.analystTarget },
      })
    } else if (opp.dnaScore >= 70 && upside >= 0.10) {
      alerts.push({
        type: 'opportunity',
        priority: 'info',
        title: `${opp.ticker} in target range — ${Math.round(upside * 100)}% to fair value`,
        body: `${opp.name} has entered an attractive entry range. ${opp.reason}. DNA compatibility: ${opp.dnaScore}/100.`,
        meta: { ticker: opp.ticker, dnaScore: opp.dnaScore, upside, analystTarget: opp.analystTarget },
      })
    }

    // Income-focused DNA gets dividend alert
    if (dna?.wealth_style === 'income' && opp.ticker === 'SCHD') {
      alerts.push({
        type: 'opportunity',
        priority: 'info',
        title: 'Income-focused ETF matches your wealth style',
        body: `Based on your income-focused DNA, ${opp.name} (${opp.ticker}) is worth considering. It offers a 3.5% dividend yield with 10-year CAGR of 11.2% and an expense ratio of just 0.06%.`,
        meta: { ticker: opp.ticker, dividendYield: 0.035, expenseRatio: 0.0006 },
      })
    }
  }

  // Diversification opportunity if tech-heavy
  if (dna) {
    alerts.push({
      type: 'opportunity',
      priority: 'info',
      title: 'International diversification opportunity detected',
      body: 'Your portfolio has zero international exposure. VEA (Developed Markets ETF) and IEMG (Emerging Markets) offer low-cost access to 3,000+ non-US companies currently trading at a ~30% P/E discount to US equities.',
      meta: { tickers: ['VEA', 'IEMG'], usValuationPremium: 0.30 },
    })
  }

  return alerts
}

// ─── News alerts ──────────────────────────────────────────────────────────────

function newsAlerts(news: AlertNews[], holdings: AlertHolding[]): GeneratedAlert[] {
  const holdingTickers = new Set(holdings.map(h => h.ticker))

  return news
    .filter(n => n.affectsPortfolio && n.importanceScore >= 7 && holdingTickers.has(n.ticker))
    .slice(0, 5)
    .map(n => {
      const holding = holdings.find(h => h.ticker === n.ticker)
      const exposure = holding ? Math.round(holding.weight * 100) : 0
      const priority: AlertPriority =
        n.sentiment === 'bearish' ? (n.importanceScore >= 9 ? 'critical' : 'warning')
        : n.sentiment === 'bullish' ? (n.importanceScore >= 9 ? 'positive' : 'info')
        : 'info'

      return {
        type: 'news' as AlertType,
        priority,
        title: n.headline,
        body: `${n.whyItMatters} ${n.actionableInsight}`,
        meta: {
          ticker: n.ticker,
          sentiment: n.sentiment,
          sentimentScore: n.sentimentScore,
          importanceScore: n.importanceScore,
          exposure,
          timeHorizonImpact: n.timeHorizonImpact,
          category: n.category,
          whyItMatters: n.whyItMatters,
          actionableInsight: n.actionableInsight,
        },
      }
    })
}

// ─── Goal alerts ──────────────────────────────────────────────────────────────

function goalAlerts(goals: Goal[]): GeneratedAlert[] {
  const alerts: GeneratedAlert[] = []

  for (const goal of goals) {
    const proj = projectGoal(goal)
    const monthsRemaining = proj.monthsRemaining
    const progressPct = Math.round(proj.progressPct * 100)

    if (proj.probabilityOfSuccess >= 85 && proj.projectedSurplus > 0) {
      alerts.push({
        type: 'goal',
        priority: 'positive',
        title: `${goal.label} — on track with ${proj.probabilityOfSuccess}% probability`,
        body: `You are projected to exceed your ${goal.label} target by ${formatAlertMoney(proj.projectedSurplus)} at the expected return rate. Keep your current ${formatAlertMoney(goal.monthly_contribution)}/mo contribution going.`,
        meta: { goalId: goal.id, goalType: goal.type, probability: proj.probabilityOfSuccess, surplus: proj.projectedSurplus },
      })
    } else if (proj.probabilityOfSuccess < 50) {
      alerts.push({
        type: 'goal',
        priority: proj.probabilityOfSuccess < 30 ? 'critical' : 'warning',
        title: `${goal.label} — behind schedule by ${Math.round(Math.abs(monthsRemaining - proj.monthsRemaining))} months`,
        body: `Your ${goal.label} goal has a ${proj.probabilityOfSuccess}% probability of success at current savings rate. Adding ${formatAlertMoney(Math.abs(proj.gapMonthly))}/mo would bring this back on track.`,
        meta: { goalId: goal.id, goalType: goal.type, probability: proj.probabilityOfSuccess, gapMonthly: proj.gapMonthly },
      })
    } else if (progressPct >= 50 && progressPct < 75) {
      alerts.push({
        type: 'goal',
        priority: 'info',
        title: `${goal.label} — halfway milestone reached (${progressPct}%)`,
        body: `You've reached the 50% milestone for your ${goal.label} goal with ${formatAlertMoney(goal.current_amount)} saved toward your ${formatAlertMoney(goal.target_amount)} target.`,
        meta: { goalId: goal.id, goalType: goal.type, progressPct },
      })
    } else if (progressPct >= 75 && progressPct < 100) {
      alerts.push({
        type: 'goal',
        priority: 'positive',
        title: `${goal.label} — 75% milestone! Final stretch`,
        body: `Outstanding progress on your ${goal.label} goal — ${progressPct}% funded. At your current pace you'll reach 100% in approximately ${Math.round(proj.monthsRemaining)} months.`,
        meta: { goalId: goal.id, goalType: goal.type, progressPct },
      })
    }
  }

  return alerts
}

function formatAlertMoney(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(0)}k`
  return `${sign}$${abs.toFixed(0)}`
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export function generateAlerts(params: {
  holdings: AlertHolding[]
  portfolio: AlertPortfolio
  dna: DnaInput | null
  news: AlertNews[]
  goals: Goal[]
}): GeneratedAlert[] {
  const { holdings, portfolio, dna, news, goals } = params
  return [
    ...portfolioAlerts(holdings, portfolio),
    ...opportunityAlerts(dna),
    ...newsAlerts(news, holdings),
    ...goalAlerts(goals),
  ]
}

export function countAlerts(alerts: { type: AlertType; read: boolean }[]): AlertCounts {
  return {
    total: alerts.length,
    unread: alerts.filter(a => !a.read).length,
    portfolio: alerts.filter(a => a.type === 'portfolio').length,
    opportunity: alerts.filter(a => a.type === 'opportunity').length,
    news: alerts.filter(a => a.type === 'news').length,
    goal: alerts.filter(a => a.type === 'goal').length,
  }
}
