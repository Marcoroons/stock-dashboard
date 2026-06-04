// ─── Portfolio Doctor — Analysis Engine ──────────────────────────────────────

export interface Holding {
  id: string
  ticker: string
  name: string
  sector: string
  shares: number
  costBasis: number
  currentPrice: number
  weight: number        // decimal 0–1
  change?: number
  country?: string      // default 'US'
  beta?: number
  dividendYield?: number
  marketCap?: number    // in billions
  assetType?: 'stock' | 'etf' | 'bond' | 'cash'
}

// ─── Dimension results ────────────────────────────────────────────────────────

export interface RiskDimension {
  id: string
  label: string
  score: number         // 0–100 (100 = perfect health)
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  status: 'healthy' | 'caution' | 'critical'
  headline: string      // one-line verdict
  detail: string        // 2-3 sentence explanation
  findings: Finding[]
}

export interface Finding {
  type: 'strength' | 'warning' | 'critical' | 'info'
  message: string
  metric?: string
  value?: string
}

export interface Prescription {
  priority: 'high' | 'medium' | 'low'
  action: string
  rationale: string
  tickers?: string[]
}

export interface CorrelationPair {
  tickerA: string
  tickerB: string
  correlation: number   // -1 to 1
  label: string
}

export interface SectorBreakdown {
  sector: string
  weight: number
  count: number
  color: string
  tickers: string[]
}

export interface GeographicBreakdown {
  region: string
  weight: number
  flag: string
  color: string
}

// ─── Full report ──────────────────────────────────────────────────────────────

export interface PortfolioDoctorReport {
  healthScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  verdict: string
  dimensions: {
    concentration: RiskDimension
    sector: RiskDimension
    geographic: RiskDimension
    diversification: RiskDimension
    correlation: RiskDimension
  }
  sectorBreakdown: SectorBreakdown[]
  geographicBreakdown: GeographicBreakdown[]
  correlationMatrix: CorrelationPair[]
  topHeaviness: { top1: number; top3: number; top5: number }
  strengths: string[]
  weaknesses: string[]
  prescriptions: Prescription[]
  radarData: { metric: string; score: number; fullMark: number }[]
}

// ─── Sector metadata ─────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Financial: '#06b6d4',
  Healthcare: '#10b981',
  'Consumer Discretionary': '#f59e0b',
  'Consumer Staples': '#84cc16',
  Energy: '#ef4444',
  Utilities: '#8b5cf6',
  'Real Estate': '#ec4899',
  Materials: '#f97316',
  Industrials: '#64748b',
  'Communication Services': '#0ea5e9',
  ETF: '#94a3b8',
  Bond: '#cbd5e1',
  Cash: '#475569',
}

// Approximate beta by sector
const SECTOR_BETA: Record<string, number> = {
  Technology: 1.3,
  Financial: 1.1,
  Healthcare: 0.7,
  'Consumer Discretionary': 1.2,
  'Consumer Staples': 0.5,
  Energy: 1.0,
  Utilities: 0.4,
  'Real Estate': 0.9,
  Materials: 1.1,
  Industrials: 1.0,
  'Communication Services': 1.1,
  ETF: 1.0,
}

// Approximate correlation between sectors (-1 to 1)
const SECTOR_CORRELATION: Record<string, Record<string, number>> = {
  Technology: { Technology: 1.0, Financial: 0.55, Healthcare: 0.30, Energy: 0.10, Utilities: -0.15, 'Consumer Staples': 0.20, ETF: 0.80 },
  Financial: { Financial: 1.0, Technology: 0.55, Healthcare: 0.35, Energy: 0.45, Utilities: 0.20, 'Consumer Staples': 0.30, ETF: 0.70 },
  Healthcare: { Healthcare: 1.0, Technology: 0.30, Financial: 0.35, Energy: 0.15, Utilities: 0.25, 'Consumer Staples': 0.45, ETF: 0.60 },
  Energy: { Energy: 1.0, Technology: 0.10, Financial: 0.45, Healthcare: 0.15, Utilities: 0.30, ETF: 0.50 },
  Utilities: { Utilities: 1.0, Technology: -0.15, Financial: 0.20, Healthcare: 0.25, Energy: 0.30, ETF: 0.40 },
  'Consumer Staples': { 'Consumer Staples': 1.0, Technology: 0.20, Healthcare: 0.45, Financial: 0.30, ETF: 0.55 },
  ETF: { ETF: 0.85, Technology: 0.80, Financial: 0.70, Healthcare: 0.60, Energy: 0.50, Utilities: 0.40, 'Consumer Staples': 0.55 },
}

function getSectorCorrelation(sA: string, sB: string): number {
  if (sA === sB) return 0.92
  return SECTOR_CORRELATION[sA]?.[sB] ?? SECTOR_CORRELATION[sB]?.[sA] ?? 0.4
}

// ─── Grade helpers ────────────────────────────────────────────────────────────

function grade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 85) return 'A'
  if (score >= 70) return 'B'
  if (score >= 55) return 'C'
  if (score >= 40) return 'D'
  return 'F'
}

function status(score: number): 'healthy' | 'caution' | 'critical' {
  if (score >= 70) return 'healthy'
  if (score >= 45) return 'caution'
  return 'critical'
}

// ─── Main engine ──────────────────────────────────────────────────────────────

export function analyzePortfolio(holdings: Holding[]): PortfolioDoctorReport {
  if (!holdings.length) return emptyReport()

  // Normalize weights to sum to 1
  const totalValue = holdings.reduce((s, h) => s + h.currentPrice * h.shares, 0)
  const normalized = holdings.map(h => ({
    ...h,
    weight: (h.currentPrice * h.shares) / totalValue,
    country: h.country ?? 'US',
    beta: h.beta ?? SECTOR_BETA[h.sector] ?? 1.0,
  }))

  // Sort by weight desc
  const byWeight = [...normalized].sort((a, b) => b.weight - a.weight)

  // ─── 1. Concentration ────────────────────────────────────────────────────
  const top1 = byWeight[0]?.weight ?? 0
  const top3 = byWeight.slice(0, 3).reduce((s, h) => s + h.weight, 0)
  const top5 = byWeight.slice(0, 5).reduce((s, h) => s + h.weight, 0)
  const hhi = normalized.reduce((s, h) => s + h.weight * h.weight, 0) * 10000

  let concScore = 100
  if (top1 > 0.35) concScore -= 30
  else if (top1 > 0.25) concScore -= 18
  else if (top1 > 0.15) concScore -= 8

  if (top3 > 0.70) concScore -= 25
  else if (top3 > 0.55) concScore -= 14
  else if (top3 > 0.40) concScore -= 6

  if (hhi > 3000) concScore -= 20
  else if (hhi > 2000) concScore -= 10
  concScore = Math.max(0, concScore)

  const concFindings: Finding[] = []
  if (top1 > 0.35) concFindings.push({ type: 'critical', message: `${byWeight[0].ticker} is ${pct(top1)} of the portfolio — single-stock concentration is very high`, metric: 'Largest position', value: pct(top1) })
  else if (top1 > 0.20) concFindings.push({ type: 'warning', message: `${byWeight[0].ticker} is ${pct(top1)} of the portfolio`, metric: 'Largest position', value: pct(top1) })
  else concFindings.push({ type: 'strength', message: `Largest position (${byWeight[0].ticker}) is ${pct(top1)} — well sized`, metric: 'Largest position', value: pct(top1) })

  if (top3 > 0.65) concFindings.push({ type: 'warning', message: `Top 3 holdings are ${pct(top3)} of total — consider rebalancing`, metric: 'Top 3 weight', value: pct(top3) })
  else concFindings.push({ type: 'strength', message: `Top 3 holdings represent ${pct(top3)} — reasonable spread`, metric: 'Top 3 weight', value: pct(top3) })

  concFindings.push({ type: hhi > 2500 ? 'warning' : 'info', message: `HHI concentration index: ${hhi.toFixed(0)} (lower is better, <1500 is diversified)`, metric: 'HHI Index', value: hhi.toFixed(0) })

  // ─── 2. Sector ───────────────────────────────────────────────────────────
  const sectorMap: Record<string, { weight: number; tickers: string[] }> = {}
  for (const h of normalized) {
    if (!sectorMap[h.sector]) sectorMap[h.sector] = { weight: 0, tickers: [] }
    sectorMap[h.sector].weight += h.weight
    sectorMap[h.sector].tickers.push(h.ticker)
  }
  const sectors = Object.entries(sectorMap).sort((a, b) => b[1].weight - a[1].weight)
  const topSector = sectors[0]
  const sectorCount = sectors.length

  let sectScore = 100
  if (topSector[1].weight > 0.65) sectScore -= 30
  else if (topSector[1].weight > 0.50) sectScore -= 18
  else if (topSector[1].weight > 0.35) sectScore -= 8
  if (sectorCount < 3) sectScore -= 20
  else if (sectorCount < 4) sectScore -= 8
  if (sectorCount >= 5) sectScore += 5
  sectScore = Math.max(0, Math.min(100, sectScore))

  const sectFindings: Finding[] = []
  if (topSector[1].weight > 0.60) sectFindings.push({ type: 'critical', message: `${topSector[0]} is ${pct(topSector[1].weight)} of the portfolio — dangerously concentrated in one sector`, metric: 'Top sector', value: pct(topSector[1].weight) })
  else if (topSector[1].weight > 0.40) sectFindings.push({ type: 'warning', message: `${topSector[0]} is ${pct(topSector[1].weight)} of the portfolio — elevated sector concentration`, metric: 'Top sector', value: pct(topSector[1].weight) })
  else sectFindings.push({ type: 'strength', message: `Sector concentration is reasonable — ${topSector[0]} at ${pct(topSector[1].weight)}`, metric: 'Top sector', value: pct(topSector[1].weight) })
  sectFindings.push({ type: sectorCount >= 4 ? 'strength' : 'warning', message: `Portfolio spans ${sectorCount} sector${sectorCount !== 1 ? 's' : ''} — ${sectorCount >= 5 ? 'good breadth' : sectorCount >= 3 ? 'moderate breadth' : 'limited diversification'}`, metric: 'Sector count', value: String(sectorCount) })

  // ─── 3. Geographic ───────────────────────────────────────────────────────
  const geoMap: Record<string, number> = {}
  for (const h of normalized) {
    const country = h.country ?? 'US'
    geoMap[country] = (geoMap[country] ?? 0) + h.weight
  }
  const usWeight = geoMap['US'] ?? 1.0
  const intlWeight = 1 - usWeight
  const geoCount = Object.keys(geoMap).length

  let geoScore = 100
  if (usWeight > 0.95) geoScore -= 30
  else if (usWeight > 0.85) geoScore -= 15
  else if (usWeight > 0.70) geoScore -= 5
  if (geoCount === 1) geoScore -= 15
  geoScore = Math.max(0, geoScore)

  const geoFindings: Finding[] = []
  if (usWeight > 0.95) geoFindings.push({ type: 'warning', message: `Portfolio is ${pct(usWeight)} US-listed — no international exposure`, metric: 'US exposure', value: pct(usWeight) })
  else geoFindings.push({ type: 'strength', message: `US exposure at ${pct(usWeight)} with ${pct(intlWeight)} international`, metric: 'US exposure', value: pct(usWeight) })
  geoFindings.push({ type: 'info', message: 'Consider international ETFs (VEA, EFA, VWO) for geographic diversification', metric: 'Suggestion', value: 'Intl ETFs' })

  // ─── 4. Diversification ──────────────────────────────────────────────────
  const count = normalized.length
  const etfWeight = normalized.filter(h => h.sector === 'ETF' || h.assetType === 'etf').reduce((s, h) => s + h.weight, 0)
  const avgBeta = normalized.reduce((s, h) => s + (h.beta ?? 1) * h.weight, 0)
  const effectiveN = 1 / normalized.reduce((s, h) => s + h.weight * h.weight, 0)

  let divScore = 100
  if (count < 5) divScore -= 35
  else if (count < 8) divScore -= 15
  else if (count < 12) divScore -= 5
  if (effectiveN < 3) divScore -= 20
  else if (effectiveN < 5) divScore -= 10
  if (avgBeta > 1.3) divScore -= 10
  else if (avgBeta > 1.5) divScore -= 20
  divScore = Math.max(0, divScore)

  const divFindings: Finding[] = []
  divFindings.push({ type: count >= 8 ? 'strength' : count >= 5 ? 'info' : 'warning', message: `${count} holdings — ${count >= 10 ? 'well diversified' : count >= 6 ? 'moderate diversification' : 'limited diversification'}`, metric: 'Holding count', value: String(count) })
  divFindings.push({ type: avgBeta > 1.3 ? 'warning' : 'strength', message: `Portfolio beta of ${avgBeta.toFixed(2)} — ${avgBeta > 1.3 ? 'more volatile than the market' : avgBeta > 0.9 ? 'aligned with the market' : 'lower volatility than the market'}`, metric: 'Portfolio beta', value: avgBeta.toFixed(2) })
  if (etfWeight > 0.05) divFindings.push({ type: 'strength', message: `ETF exposure (${pct(etfWeight)}) provides broad market diversification within your portfolio`, metric: 'ETF weight', value: pct(etfWeight) })
  divFindings.push({ type: effectiveN >= 6 ? 'strength' : 'info', message: `Effective N of ${effectiveN.toFixed(1)} — represents the "equivalent" number of equal-weight positions`, metric: 'Effective N', value: effectiveN.toFixed(1) })

  // ─── 5. Correlation ──────────────────────────────────────────────────────
  const pairs: CorrelationPair[] = []
  for (let i = 0; i < normalized.length; i++) {
    for (let j = i + 1; j < normalized.length; j++) {
      const corr = getSectorCorrelation(normalized[i].sector, normalized[j].sector)
      pairs.push({
        tickerA: normalized[i].ticker,
        tickerB: normalized[j].ticker,
        correlation: corr,
        label: corr >= 0.8 ? 'Very High' : corr >= 0.6 ? 'High' : corr >= 0.4 ? 'Moderate' : corr >= 0.2 ? 'Low' : 'Very Low',
      })
    }
  }
  const avgCorr = pairs.length > 0 ? pairs.reduce((s, p) => s + p.correlation, 0) / pairs.length : 0
  const highCorrPairs = pairs.filter(p => p.correlation >= 0.75)
  const topPairs = [...pairs].sort((a, b) => b.correlation - a.correlation).slice(0, 6)

  let corrScore = 100
  if (avgCorr > 0.75) corrScore -= 30
  else if (avgCorr > 0.60) corrScore -= 18
  else if (avgCorr > 0.50) corrScore -= 8
  if (highCorrPairs.length > normalized.length * 0.5) corrScore -= 15
  corrScore = Math.max(0, corrScore)

  const corrFindings: Finding[] = []
  corrFindings.push({ type: avgCorr > 0.65 ? 'warning' : avgCorr > 0.50 ? 'info' : 'strength', message: `Average inter-holding correlation is ${avgCorr.toFixed(2)} — ${avgCorr > 0.65 ? 'holdings move together, limiting diversification benefit' : avgCorr > 0.50 ? 'moderate correlation, some diversification benefit' : 'good diversification — holdings are relatively independent'}`, metric: 'Avg correlation', value: avgCorr.toFixed(2) })
  if (highCorrPairs.length > 0) corrFindings.push({ type: 'warning', message: `${highCorrPairs.length} high-correlation pair${highCorrPairs.length > 1 ? 's' : ''} — these holdings often move together`, metric: 'High corr pairs', value: String(highCorrPairs.length) })
  else corrFindings.push({ type: 'strength', message: 'No highly correlated pairs — holdings provide genuine diversification benefit', metric: 'High corr pairs', value: '0' })

  // ─── Composite health score ──────────────────────────────────────────────
  const weights = { concentration: 0.25, sector: 0.25, geographic: 0.15, diversification: 0.20, correlation: 0.15 }
  const healthScore = Math.round(
    concScore * weights.concentration +
    sectScore * weights.sector +
    geoScore * weights.geographic +
    divScore * weights.diversification +
    corrScore * weights.correlation
  )

  // ─── Sector breakdown ────────────────────────────────────────────────────
  const sectorBreakdown: SectorBreakdown[] = sectors.map(([sector, data]) => ({
    sector,
    weight: data.weight,
    count: data.tickers.length,
    color: SECTOR_COLORS[sector] ?? '#64748b',
    tickers: data.tickers,
  }))

  // ─── Geographic breakdown ────────────────────────────────────────────────
  const GEO_META: Record<string, { flag: string; color: string }> = {
    US: { flag: '🇺🇸', color: '#3b82f6' },
    EU: { flag: '🇪🇺', color: '#06b6d4' },
    UK: { flag: '🇬🇧', color: '#10b981' },
    Asia: { flag: '🌏', color: '#f59e0b' },
    Emerging: { flag: '🌍', color: '#ef4444' },
    Global: { flag: '🌐', color: '#8b5cf6' },
  }
  const geographicBreakdown: GeographicBreakdown[] = Object.entries(geoMap).map(([region, weight]) => ({
    region,
    weight,
    flag: GEO_META[region]?.flag ?? '🌐',
    color: GEO_META[region]?.color ?? '#64748b',
  }))

  // ─── Strengths & weaknesses ──────────────────────────────────────────────
  const allDims = [
    { id: 'concentration', score: concScore, label: 'Position Concentration' },
    { id: 'sector', score: sectScore, label: 'Sector Balance' },
    { id: 'geographic', score: geoScore, label: 'Geographic Spread' },
    { id: 'diversification', score: divScore, label: 'Overall Diversification' },
    { id: 'correlation', score: corrScore, label: 'Correlation Profile' },
  ]
  const strengths = allDims.filter(d => d.score >= 70).map(d => `Strong ${d.label} (${d.score}/100)`)
  const weaknesses = allDims.filter(d => d.score < 55).map(d => `${d.label} needs attention (${d.score}/100)`)

  // ─── Prescriptions ───────────────────────────────────────────────────────
  const prescriptions: Prescription[] = []

  if (geoScore < 55) {
    prescriptions.push({
      priority: 'high',
      action: 'Add international diversification',
      rationale: `Your portfolio is ${pct(usWeight)} US-concentrated. Adding 10–20% in international ETFs reduces home-country bias and smooths long-term returns.`,
      tickers: ['VEA', 'EFA', 'VWO', 'VXUS'],
    })
  }

  if (topSector[1].weight > 0.55) {
    prescriptions.push({
      priority: 'high',
      action: `Reduce ${topSector[0]} sector concentration`,
      rationale: `${topSector[0]} is ${pct(topSector[1].weight)} of your portfolio. A sector-specific shock could cause outsized drawdown. Target 30–40% maximum for any single sector.`,
      tickers: topSector[1].tickers,
    })
  }

  if (top1 > 0.25) {
    prescriptions.push({
      priority: 'medium',
      action: `Trim ${byWeight[0].ticker} to below 20%`,
      rationale: `${byWeight[0].ticker} at ${pct(top1)} creates meaningful single-stock risk. Trimming and redeploying into complementary positions improves the risk profile.`,
      tickers: [byWeight[0].ticker],
    })
  }

  if (usWeight > 0.95 && prescriptions.findIndex(p => p.action.includes('international')) === -1) {
    prescriptions.push({
      priority: 'medium',
      action: 'Introduce international exposure',
      rationale: 'Allocating 15–20% to international markets reduces country-specific risk and captures global growth opportunities.',
      tickers: ['VEA', 'VXUS'],
    })
  }

  if (avgBeta > 1.3) {
    prescriptions.push({
      priority: 'medium',
      action: 'Add defensive positions to lower portfolio beta',
      rationale: `Portfolio beta of ${avgBeta.toFixed(2)} means higher-than-market volatility. Adding low-beta defensive names (utilities, staples, healthcare) would smooth returns.`,
      tickers: ['JNJ', 'PG', 'KO', 'VPU'],
    })
  }

  if (count < 7 && divScore < 65) {
    prescriptions.push({
      priority: 'medium',
      action: 'Increase position count to improve diversification',
      rationale: `With ${count} holdings, your effective diversification is limited. Expanding to 10–15 positions (or adding a broad-market ETF) materially reduces idiosyncratic risk.`,
      tickers: ['VTI', 'QQQ', 'SPY'],
    })
  }

  if (highCorrPairs.length > normalized.length * 0.4) {
    prescriptions.push({
      priority: 'low',
      action: 'Introduce low-correlation assets',
      rationale: 'Several holdings move in the same direction simultaneously. Adding assets from uncorrelated sectors (e.g. utilities, consumer staples, REITs) improves portfolio efficiency.',
      tickers: ['O', 'XLU', 'VNQ'],
    })
  }

  if (prescriptions.length === 0) {
    prescriptions.push({
      priority: 'low',
      action: 'Portfolio is well balanced — maintain and review quarterly',
      rationale: 'Your portfolio shows good diversification across sectors and positions. Continue dollar-cost averaging and rebalance if any position exceeds 25% of total value.',
    })
  }

  // ─── Radar ───────────────────────────────────────────────────────────────
  const radarData = [
    { metric: 'Concentration', score: concScore, fullMark: 100 },
    { metric: 'Sector Balance', score: sectScore, fullMark: 100 },
    { metric: 'Geography', score: geoScore, fullMark: 100 },
    { metric: 'Diversification', score: divScore, fullMark: 100 },
    { metric: 'Correlation', score: corrScore, fullMark: 100 },
  ]

  const verdict = healthScore >= 80
    ? 'Portfolio is in excellent health with strong diversification and balanced risk.'
    : healthScore >= 65
      ? 'Portfolio is generally healthy with a few areas worth monitoring.'
      : healthScore >= 50
        ? 'Portfolio has meaningful risk concentrations that warrant attention.'
        : 'Portfolio has significant structural risks. Immediate rebalancing is recommended.'

  return {
    healthScore,
    grade: grade(healthScore),
    verdict,
    dimensions: {
      concentration: { id: 'concentration', label: 'Concentration Risk', score: concScore, grade: grade(concScore), status: status(concScore), headline: concScore >= 70 ? 'Well-distributed positions' : concScore >= 45 ? 'Moderate concentration detected' : 'High single-position concentration', detail: `Largest position is ${pct(top1)}, top 3 positions are ${pct(top3)} of the portfolio. HHI index: ${hhi.toFixed(0)}.`, findings: concFindings },
      sector: { id: 'sector', label: 'Sector Risk', score: sectScore, grade: grade(sectScore), status: status(sectScore), headline: sectScore >= 70 ? 'Balanced sector allocation' : `${topSector[0]} sector over-weight`, detail: `Portfolio spans ${sectorCount} sectors. Largest sector (${topSector[0]}) is ${pct(topSector[1].weight)} of portfolio.`, findings: sectFindings },
      geographic: { id: 'geographic', label: 'Geographic Risk', score: geoScore, grade: grade(geoScore), status: status(geoScore), headline: usWeight > 0.90 ? 'US-only portfolio — no international exposure' : 'Reasonable geographic distribution', detail: `US-listed holdings represent ${pct(usWeight)} of portfolio. International exposure: ${pct(intlWeight)}.`, findings: geoFindings },
      diversification: { id: 'diversification', label: 'Diversification', score: divScore, grade: grade(divScore), status: status(divScore), headline: count >= 8 ? 'Well-diversified portfolio' : `Limited diversification — ${count} holdings`, detail: `Portfolio has ${count} holdings with an effective N of ${effectiveN.toFixed(1)}. Portfolio beta is ${avgBeta.toFixed(2)}.`, findings: divFindings },
      correlation: { id: 'correlation', label: 'Correlation Risk', score: corrScore, grade: grade(corrScore), status: status(corrScore), headline: avgCorr < 0.5 ? 'Holdings are well-uncorrelated' : avgCorr < 0.65 ? 'Moderate correlation between holdings' : 'High inter-holding correlation', detail: `Average pairwise correlation: ${avgCorr.toFixed(2)}. ${highCorrPairs.length} high-correlation pairs detected.`, findings: corrFindings },
    },
    sectorBreakdown,
    geographicBreakdown,
    correlationMatrix: topPairs,
    topHeaviness: { top1, top3, top5 },
    strengths: strengths.length > 0 ? strengths : ['Portfolio constructed and active'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No critical weaknesses detected'],
    prescriptions,
    radarData,
  }
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`
}

function emptyReport(): PortfolioDoctorReport {
  const empty: RiskDimension = { id: '', label: '', score: 0, grade: 'F', status: 'critical', headline: 'No data', detail: '', findings: [] }
  return {
    healthScore: 0, grade: 'F', verdict: 'No holdings to analyze.',
    dimensions: { concentration: empty, sector: empty, geographic: empty, diversification: empty, correlation: empty },
    sectorBreakdown: [], geographicBreakdown: [], correlationMatrix: [],
    topHeaviness: { top1: 0, top3: 0, top5: 0 },
    strengths: [], weaknesses: [], prescriptions: [], radarData: [],
  }
}
