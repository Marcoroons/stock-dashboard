import {
  ALL_ARCHETYPES,
  INVESTMENT_ARCHETYPES,
  BEHAVIORAL_ARCHETYPES,
  OPERATIONAL_ARCHETYPES,
  type ArchetypeId,
  type InvestmentArchetypeId,
  type BehavioralArchetypeId,
  type OperationalArchetypeId,
} from './archetypes'

// ─── DNA Input (from dna_assessments table) ───────────────────────────────────

export interface DnaInput {
  emotional_profile: string
  wealth_style: string
  time_horizon: string
  knowledge_level: string
  time_commitment: string
  volatility_tolerance: string
  drawdown_tolerance: number
  sector_interests: string[]
  risk_score: number
  answers?: Record<string, string | number | string[]>
}

// ─── Computed DNA Profile ─────────────────────────────────────────────────────

export interface ComputedDnaProfile {
  primaryInvestmentArchetype: InvestmentArchetypeId
  primaryBehavioralArchetype: BehavioralArchetypeId
  primaryOperationalArchetype: OperationalArchetypeId
  investmentScores: Record<InvestmentArchetypeId, number>
  behavioralScores: Record<BehavioralArchetypeId, number>
  operationalScores: Record<OperationalArchetypeId, number>
  riskLevel: 'very_conservative' | 'conservative' | 'moderate' | 'growth' | 'aggressive'
  riskScore: number
  personalityTags: string[]
  strengths: string[]
  blindSpots: string[]
  compatibilityFactors: CompatibilityFactor[]
}

export interface CompatibilityFactor {
  factor: string
  weight: number
  direction: 'positive' | 'negative'
}

// ─── Stock/Fund Profile for Compatibility Scoring ────────────────────────────

export interface AssetProfile {
  ticker: string
  name: string
  sector: string
  beta?: number
  dividendYield?: number
  revenueGrowth?: number
  peRatio?: number
  marketCap?: number
  hasOptions?: boolean
  esgScore?: number
  analystRating?: string
  isETF?: boolean
  expenseRatio?: number
}

export interface CompatibilityScore {
  ticker: string
  score: number
  label: string
  reasons: string[]
  warnings: string[]
}

// ─── DNA Engine ───────────────────────────────────────────────────────────────

export function computeDnaProfile(dna: DnaInput): ComputedDnaProfile {
  const investmentScores = scoreInvestmentArchetypes(dna)
  const behavioralScores = scoreBehavioralArchetypes(dna)
  const operationalScores = scoreOperationalArchetypes(dna)

  const primaryInvestmentArchetype = topKey(investmentScores) as InvestmentArchetypeId
  const primaryBehavioralArchetype = topKey(behavioralScores) as BehavioralArchetypeId
  const primaryOperationalArchetype = topKey(operationalScores) as OperationalArchetypeId

  const primary = ALL_ARCHETYPES[primaryInvestmentArchetype]
  const behavioral = ALL_ARCHETYPES[primaryBehavioralArchetype]

  const personalityTags = buildPersonalityTags(dna, primaryInvestmentArchetype, primaryBehavioralArchetype)
  const strengths = [...primary.strengths.slice(0, 2), ...behavioral.strengths.slice(0, 1)]
  const blindSpots = [...primary.blindSpots.slice(0, 2), ...behavioral.blindSpots.slice(0, 1)]
  const compatibilityFactors = buildCompatibilityFactors(dna, primaryInvestmentArchetype)

  return {
    primaryInvestmentArchetype,
    primaryBehavioralArchetype,
    primaryOperationalArchetype,
    investmentScores,
    behavioralScores,
    operationalScores,
    riskLevel: dna.volatility_tolerance as ComputedDnaProfile['riskLevel'],
    riskScore: dna.risk_score,
    personalityTags,
    strengths,
    blindSpots,
    compatibilityFactors,
  }
}

function topKey<T extends string>(scores: Record<T, number>): T {
  return (Object.entries(scores) as [T, number][]).reduce((a, b) => b[1] > a[1] ? b : a)[0]
}

// ─── Investment Archetype Scoring ─────────────────────────────────────────────

function scoreInvestmentArchetypes(dna: DnaInput): Record<InvestmentArchetypeId, number> {
  const { wealth_style, time_horizon, volatility_tolerance, drawdown_tolerance, risk_score } = dna

  const scores: Record<InvestmentArchetypeId, number> = {
    wealth_builder: 0,
    growth_hunter: 0,
    income_generator: 0,
    capital_preserver: 0,
    opportunistic_investor: 0,
  }

  // Wealth Builder: long horizon, growth/balanced style, patient
  if (time_horizon === 'long' || time_horizon === 'very_long') scores.wealth_builder += 30
  if (wealth_style === 'growth' || wealth_style === 'balanced') scores.wealth_builder += 25
  if (volatility_tolerance === 'moderate' || volatility_tolerance === 'growth') scores.wealth_builder += 20
  if (drawdown_tolerance >= 20 && drawdown_tolerance <= 35) scores.wealth_builder += 15
  if (dna.time_commitment === 'monthly' || dna.time_commitment === 'weekly') scores.wealth_builder += 10

  // Growth Hunter: high risk tolerance, growth style, long horizon
  if (wealth_style === 'growth') scores.growth_hunter += 35
  if (volatility_tolerance === 'aggressive' || volatility_tolerance === 'growth') scores.growth_hunter += 30
  if (drawdown_tolerance >= 35) scores.growth_hunter += 20
  if (time_horizon === 'long' || time_horizon === 'very_long') scores.growth_hunter += 15
  if (dna.sector_interests?.includes('tech') || dna.sector_interests?.includes('health')) scores.growth_hunter += 10
  if (dna.answers?.investing_style === 'growth') scores.growth_hunter += 20

  // Income Generator: income style, lower risk, dividend focus
  if (wealth_style === 'income') scores.income_generator += 50
  if (volatility_tolerance === 'conservative' || volatility_tolerance === 'very_conservative') scores.income_generator += 20
  if (dna.answers?.investing_style === 'dividend') scores.income_generator += 30
  if (dna.sector_interests?.includes('realestate') || dna.sector_interests?.includes('finance')) scores.income_generator += 10

  // Capital Preserver: preservation style, low risk, short horizon
  if (wealth_style === 'preservation') scores.capital_preserver += 50
  if (volatility_tolerance === 'very_conservative' || volatility_tolerance === 'conservative') scores.capital_preserver += 30
  if (time_horizon === 'short' || time_horizon === 'medium') scores.capital_preserver += 15
  if (drawdown_tolerance <= 10) scores.capital_preserver += 20
  if (dna.answers?.crash_reaction === 'sell' || dna.answers?.crash_reaction === 'reduce') scores.capital_preserver += 10

  // Opportunistic: contrarian, high tolerance, tactical
  if (dna.answers?.crash_reaction === 'buy') scores.opportunistic_investor += 35
  if (volatility_tolerance === 'aggressive') scores.opportunistic_investor += 25
  if (drawdown_tolerance >= 35) scores.opportunistic_investor += 20
  if (dna.answers?.investing_style === 'value') scores.opportunistic_investor += 20
  if (dna.time_commitment === 'weekly' || dna.time_commitment === 'active') scores.opportunistic_investor += 15

  // Normalize to 0–100
  const max = Math.max(...Object.values(scores))
  if (max > 0) {
    for (const k in scores) scores[k as InvestmentArchetypeId] = Math.round((scores[k as InvestmentArchetypeId] / max) * 100)
  }

  return scores
}

// ─── Behavioral Archetype Scoring ─────────────────────────────────────────────

function scoreBehavioralArchetypes(dna: DnaInput): Record<BehavioralArchetypeId, number> {
  const scores: Record<BehavioralArchetypeId, number> = {
    the_follower: 0,
    the_accumulator: 0,
    the_independent: 0,
    the_guardian: 0,
  }

  const { time_commitment, knowledge_level, volatility_tolerance, drawdown_tolerance } = dna

  // The Follower: beginner knowledge, reactive, trend-following
  if (knowledge_level === 'beginner' || knowledge_level === 'starter') scores.the_follower += 30
  if (dna.answers?.crash_reaction === 'sell') scores.the_follower += 25
  if (dna.answers?.investing_style === 'growth' && knowledge_level === 'beginner') scores.the_follower += 20
  if (time_commitment === 'active') scores.the_follower += 15

  // The Accumulator: systematic, consistent, accumulation-focused
  if (time_commitment === 'monthly' || time_commitment === 'passive') scores.the_accumulator += 25
  if (dna.wealth_style === 'growth' || dna.wealth_style === 'balanced') scores.the_accumulator += 20
  if (dna.answers?.crash_reaction === 'hold' || dna.answers?.crash_reaction === 'buy') scores.the_accumulator += 30
  if (dna.answers?.investing_style === 'index') scores.the_accumulator += 25
  if (volatility_tolerance !== 'very_conservative') scores.the_accumulator += 10

  // The Independent: advanced knowledge, contrarian, research-heavy
  if (knowledge_level === 'intermediate' || knowledge_level === 'expert') scores.the_independent += 30
  if (dna.answers?.investing_style === 'value') scores.the_independent += 35
  if (dna.answers?.crash_reaction === 'buy') scores.the_independent += 25
  if (time_commitment === 'weekly' || time_commitment === 'active') scores.the_independent += 20

  // The Guardian: extreme caution, cash preference, low risk
  if (volatility_tolerance === 'very_conservative') scores.the_guardian += 50
  if (drawdown_tolerance <= 10) scores.the_guardian += 30
  if (dna.answers?.return_preference === 'steady') scores.the_guardian += 25
  if (dna.answers?.crash_reaction === 'sell') scores.the_guardian += 20
  if (dna.wealth_style === 'preservation') scores.the_guardian += 20

  const max = Math.max(...Object.values(scores))
  if (max > 0) {
    for (const k in scores) scores[k as BehavioralArchetypeId] = Math.round((scores[k as BehavioralArchetypeId] / max) * 100)
  }

  return scores
}

// ─── Operational Archetype Scoring ────────────────────────────────────────────

function scoreOperationalArchetypes(dna: DnaInput): Record<OperationalArchetypeId, number> {
  const scores: Record<OperationalArchetypeId, number> = {
    impact_investor: 0,
    passive_investor: 0,
    active_speculator: 0,
  }

  const { time_commitment, knowledge_level } = dna

  // Impact Investor: clean energy interests, values-aligned
  if (dna.sector_interests?.includes('energy')) scores.impact_investor += 40
  if (knowledge_level === 'intermediate' || knowledge_level === 'expert') scores.impact_investor += 20
  if (time_commitment !== 'passive') scores.impact_investor += 15
  if (dna.answers?.investing_style === 'index') scores.impact_investor += 10

  // Passive Investor: set-and-forget, index preference, low commitment
  if (time_commitment === 'passive') scores.passive_investor += 50
  if (dna.answers?.investing_style === 'index') scores.passive_investor += 45
  if (knowledge_level === 'beginner' || knowledge_level === 'starter') scores.passive_investor += 20
  if (dna.wealth_style === 'balanced') scores.passive_investor += 10

  // Active Speculator: daily engagement, high knowledge, high risk
  if (time_commitment === 'active') scores.active_speculator += 50
  if (knowledge_level === 'expert') scores.active_speculator += 35
  if (dna.volatility_tolerance === 'aggressive') scores.active_speculator += 30
  if (dna.drawdown_tolerance >= 50) scores.active_speculator += 25
  if (dna.answers?.crash_reaction === 'buy') scores.active_speculator += 15

  const max = Math.max(...Object.values(scores))
  if (max > 0) {
    for (const k in scores) scores[k as OperationalArchetypeId] = Math.round((scores[k as OperationalArchetypeId] / max) * 100)
  }

  return scores
}

// ─── Personality Tags ─────────────────────────────────────────────────────────

function buildPersonalityTags(dna: DnaInput, inv: InvestmentArchetypeId, beh: BehavioralArchetypeId): string[] {
  const tags: string[] = []

  const riskMap: Record<string, string> = {
    very_conservative: 'Very Conservative', conservative: 'Conservative',
    moderate: 'Moderate Risk', growth: 'Growth-Oriented', aggressive: 'High Risk Taker',
  }
  tags.push(riskMap[dna.volatility_tolerance] ?? 'Moderate Risk')

  const horizonMap: Record<string, string> = {
    short: 'Short-Term', medium: 'Mid-Term', long: 'Long-Term', very_long: 'Multi-Decade',
  }
  tags.push(horizonMap[dna.time_horizon] ?? 'Long-Term')

  const commitMap: Record<string, string> = {
    passive: 'Hands-Off', monthly: 'Monthly Reviewer', weekly: 'Active Researcher', active: 'Daily Trader',
  }
  tags.push(commitMap[dna.time_commitment] ?? 'Monthly Reviewer')

  if (ALL_ARCHETYPES[inv]) tags.push(ALL_ARCHETYPES[inv].traits[0])
  if (ALL_ARCHETYPES[beh]) tags.push(ALL_ARCHETYPES[beh].traits[0])

  const styleMap: Record<string, string> = {
    growth: 'Growth Seeker', income: 'Income Focused', preservation: 'Capital Preserver', balanced: 'Balanced Approach',
  }
  if (styleMap[dna.wealth_style]) tags.push(styleMap[dna.wealth_style])

  return [...new Set(tags)].slice(0, 6)
}

// ─── Compatibility Factors ────────────────────────────────────────────────────

function buildCompatibilityFactors(dna: DnaInput, inv: InvestmentArchetypeId): CompatibilityFactor[] {
  const archetype = INVESTMENT_ARCHETYPES[inv]
  const factors: CompatibilityFactor[] = []

  archetype.compatibleWith.forEach(c => {
    factors.push({ factor: c, weight: 0.8, direction: 'positive' })
  })
  archetype.incompatibleWith.forEach(c => {
    factors.push({ factor: c, weight: 0.8, direction: 'negative' })
  })

  // Add risk-based factors
  if (dna.volatility_tolerance === 'very_conservative' || dna.volatility_tolerance === 'conservative') {
    factors.push({ factor: 'low_beta', weight: 1.0, direction: 'positive' })
    factors.push({ factor: 'high_volatility', weight: 1.0, direction: 'negative' })
  }
  if (dna.volatility_tolerance === 'aggressive') {
    factors.push({ factor: 'high_growth', weight: 1.0, direction: 'positive' })
  }
  if (dna.wealth_style === 'income') {
    factors.push({ factor: 'high_dividend_yield', weight: 1.0, direction: 'positive' })
    factors.push({ factor: 'no_dividend', weight: 1.0, direction: 'negative' })
  }

  return factors
}

// ─── Asset Compatibility Scoring ─────────────────────────────────────────────

export function scoreAssetCompatibility(
  asset: AssetProfile,
  dna: DnaInput,
  profile: ComputedDnaProfile
): CompatibilityScore {
  let score = 50 // Start neutral
  const reasons: string[] = []
  const warnings: string[] = []

  const { beta = 1, dividendYield = 0, revenueGrowth = 0, peRatio = 20, esgScore } = asset
  const { volatility_tolerance, wealth_style, time_horizon, drawdown_tolerance } = dna

  // ── Beta / Volatility alignment ──
  if (volatility_tolerance === 'very_conservative' || volatility_tolerance === 'conservative') {
    if (beta < 0.8) { score += 15; reasons.push('Low volatility matches conservative profile') }
    else if (beta > 1.3) { score -= 20; warnings.push('High volatility conflicts with conservative risk profile') }
  } else if (volatility_tolerance === 'aggressive') {
    if (beta > 1.2) { score += 10; reasons.push('Higher beta suits aggressive risk tolerance') }
    if (beta < 0.7) { score -= 10; warnings.push('Low beta may limit returns for aggressive profile') }
  } else {
    if (beta >= 0.8 && beta <= 1.3) { score += 8; reasons.push('Beta aligned with moderate risk tolerance') }
  }

  // ── Dividend / Income alignment ──
  if (wealth_style === 'income') {
    if (dividendYield > 0.03) { score += 20; reasons.push(`${(dividendYield * 100).toFixed(1)}% dividend yield suits income focus`) }
    else if (dividendYield === 0) { score -= 15; warnings.push('No dividend — conflicts with income-focused strategy') }
  } else if (wealth_style === 'growth') {
    if (dividendYield > 0.04) { score -= 5; warnings.push('High yield may indicate slower growth') }
    if (revenueGrowth > 0.15) { score += 15; reasons.push(`Strong ${(revenueGrowth * 100).toFixed(0)}% revenue growth aligns with growth strategy`) }
  }

  // ── Growth / Valuation alignment ──
  if (revenueGrowth > 0.20) {
    if (profile.primaryInvestmentArchetype === 'growth_hunter') { score += 18; reasons.push('High growth rate strongly aligns with Growth Hunter archetype') }
    else { score += 8; reasons.push('Strong revenue growth momentum') }
  } else if (revenueGrowth < 0.03) {
    if (profile.primaryInvestmentArchetype === 'growth_hunter') { score -= 15; warnings.push('Low growth conflicts with Growth Hunter strategy') }
  }

  // ── Time horizon alignment ──
  if (time_horizon === 'short' || time_horizon === 'medium') {
    if (beta > 1.4) { score -= 10; warnings.push('High beta increases drawdown risk for shorter time horizon') }
  }

  // ── Sector interest boost ──
  const sectorMap: Record<string, string[]> = {
    Technology: ['tech', 'ai_exposure'],
    Healthcare: ['health'],
    Energy: ['energy'],
    'Real Estate': ['realestate'],
    Financial: ['finance'],
    Consumer: ['consumer'],
  }
  const sectorTags = sectorMap[asset.sector] ?? []
  const hasInterest = sectorTags.some(t => dna.sector_interests?.includes(t))
  if (hasInterest) { score += 12; reasons.push(`${asset.sector} sector matches your stated interests`) }

  // ── Archetype-specific boosts ──
  if (profile.primaryInvestmentArchetype === 'capital_preserver') {
    if (beta < 0.8 && dividendYield > 0.02) { score += 15; reasons.push('Defensive characteristics align with Capital Preserver archetype') }
    if (peRatio > 40) { score -= 10; warnings.push('High valuation adds risk for Capital Preserver') }
  }

  if (profile.primaryInvestmentArchetype === 'income_generator') {
    if (dividendYield > 0.04) { score += 20; reasons.push('High yield is core to Income Generator strategy') }
  }

  if (profile.primaryInvestmentArchetype === 'wealth_builder') {
    if (revenueGrowth > 0.08 && beta < 1.3) { score += 12; reasons.push('Steady growth profile suits long-term Wealth Builder strategy') }
  }

  if (profile.primaryInvestmentArchetype === 'opportunistic_investor') {
    if (peRatio < 15 && revenueGrowth > 0) { score += 15; reasons.push('Attractive valuation aligns with Opportunistic Investor strategy') }
  }

  // ── Passive investor ETF preference ──
  if (profile.primaryOperationalArchetype === 'passive_investor' && asset.isETF) {
    score += 15; reasons.push('ETF structure aligns with passive investing strategy')
    if (asset.expenseRatio && asset.expenseRatio < 0.002) { score += 10; reasons.push('Low expense ratio maximizes passive returns') }
  }

  // ── ESG alignment ──
  if (profile.primaryOperationalArchetype === 'impact_investor') {
    if (esgScore && esgScore > 70) { score += 18; reasons.push('Strong ESG score aligns with Impact Investor values') }
    else if (!esgScore || esgScore < 40) { score -= 10; warnings.push('Weak ESG profile conflicts with Impact Investor values') }
  }

  // Clamp score between 0–100
  score = Math.max(0, Math.min(100, Math.round(score)))

  const label = score >= 85 ? 'Excellent Match'
    : score >= 70 ? 'Strong Match'
    : score >= 55 ? 'Good Match'
    : score >= 40 ? 'Partial Match'
    : 'Poor Match'

  return { ticker: asset.ticker, score, label, reasons, warnings }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getRiskLabel(level: string): string {
  const map: Record<string, string> = {
    very_conservative: 'Very Conservative',
    conservative: 'Conservative',
    moderate: 'Moderate',
    growth: 'Growth',
    aggressive: 'Aggressive',
  }
  return map[level] ?? 'Moderate'
}

export function getRiskColor(level: string): string {
  const map: Record<string, string> = {
    very_conservative: '#3b82f6',
    conservative: '#06b6d4',
    moderate: '#f59e0b',
    growth: '#10b981',
    aggressive: '#ef4444',
  }
  return map[level] ?? '#f59e0b'
}

export function getScoreColor(score: number): string {
  if (score >= 80) return '#10b981'
  if (score >= 60) return '#3b82f6'
  if (score >= 40) return '#f59e0b'
  return '#ef4444'
}

// ─── Mock compatibility scores for demonstration ─────────────────────────────

export function mockCompatibilityScores(dna: DnaInput): CompatibilityScore[] {
  const profile = computeDnaProfile(dna)
  const mockAssets: AssetProfile[] = [
    { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', beta: 1.28, dividendYield: 0.0052, revenueGrowth: 0.061, peRatio: 30 },
    { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', beta: 0.89, dividendYield: 0.0072, revenueGrowth: 0.158, peRatio: 35 },
    { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', beta: 1.72, dividendYield: 0.001, revenueGrowth: 1.22, peRatio: 65 },
    { ticker: 'JNJ', name: 'Johnson & Johnson', sector: 'Healthcare', beta: 0.54, dividendYield: 0.032, revenueGrowth: 0.065, peRatio: 22 },
    { ticker: 'VTI', name: 'Vanguard Total Market ETF', sector: 'ETF', beta: 1.0, dividendYield: 0.014, revenueGrowth: 0.07, peRatio: 22, isETF: true, expenseRatio: 0.0003 },
    { ticker: 'JPM', name: 'JPMorgan Chase', sector: 'Financial', beta: 1.12, dividendYield: 0.023, revenueGrowth: 0.08, peRatio: 12 },
    { ticker: 'BRK.B', name: 'Berkshire Hathaway', sector: 'Financial', beta: 0.88, dividendYield: 0, revenueGrowth: 0.045, peRatio: 24 },
    { ticker: 'META', name: 'Meta Platforms', sector: 'Technology', beta: 1.31, dividendYield: 0.004, revenueGrowth: 0.22, peRatio: 28 },
    { ticker: 'GOOGL', name: 'Alphabet', sector: 'Technology', beta: 1.05, dividendYield: 0, revenueGrowth: 0.12, peRatio: 25 },
    { ticker: 'O', name: 'Realty Income', sector: 'Real Estate', beta: 0.51, dividendYield: 0.056, revenueGrowth: 0.025, peRatio: 45 },
  ]

  return mockAssets
    .map(a => scoreAssetCompatibility(a, dna, profile))
    .sort((a, b) => b.score - a.score)
}
