// ─── Finnhub API types ────────────────────────────────────────────────────────

export interface FinnhubQuote {
  c: number   // current price
  d: number   // change
  dp: number  // change percent
  h: number   // high
  l: number   // low
  o: number   // open
  pc: number  // previous close
  t: number   // timestamp (unix)
}

export interface FinnhubProfile {
  country: string
  currency: string
  exchange: string
  finnhubIndustry: string
  ipo: string
  logo: string
  marketCapitalization: number
  name: string
  shareOutstanding: number
  ticker: string
  weburl: string
}

export interface FinnhubMetricSet {
  '10DayAverageTradingVolume': number
  '52WeekHigh': number
  '52WeekLow': number
  '52WeekPriceReturnDaily': number
  beta: number
  peBasicExclExtraTTM: number
  pegFY1: number
  pbAnnual: number
  psAnnual: number
  roeRfy: number
  roaRfy: number
  revenueGrowthTTMYoy: number
  revenueGrowth5Y: number
  epsGrowthTTMYoy: number
  epsGrowth5Y: number
  netProfitMarginTTM: number
  grossMarginTTM: number
  operatingMarginTTM: number
  'totalDebt/totalEquityAnnual': number
  currentRatioAnnual: number
  dividendYieldIndicatedAnnual: number
  epsNormalizedAnnual: number
  revenuePerShareTTM: number
  [key: string]: number
}

export interface FinnhubMetrics {
  metric: Partial<FinnhubMetricSet>
  series?: unknown
}

export interface FinnhubNewsArticle {
  category: string
  datetime: number
  headline: string
  id: number
  image: string
  related: string
  source: string
  summary: string
  url: string
}

export interface FinnhubRecommendation {
  buy: number
  hold: number
  sell: number
  period: string
  strongBuy: number
  strongSell: number
  symbol: string
}

export interface StockAnalysis {
  symbol: string
  quote: FinnhubQuote
  profile: FinnhubProfile
  metrics: FinnhubMetrics
  recommend: FinnhubRecommendation[]
  // Derived
  score: number
  categoryScores: Record<string, number>
  bull: string[]
  bear: string[]
  summary: string
}

// ─── Score computation ────────────────────────────────────────────────────────

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v))
}

function scoreQuality(m: Partial<FinnhubMetricSet>): number {
  let pts = 0
  let total = 0
  if (m.roeRfy != null)           { pts += clamp((m.roeRfy / 30) * 100); total++ }
  if (m.operatingMarginTTM != null) { pts += clamp((m.operatingMarginTTM / 25) * 100); total++ }
  if (m.grossMarginTTM != null)   { pts += clamp((m.grossMarginTTM / 50) * 100); total++ }
  return total > 0 ? Math.round(pts / total) : 60
}

function scoreGrowth(m: Partial<FinnhubMetricSet>): number {
  let pts = 0
  let total = 0
  if (m.revenueGrowthTTMYoy != null) { pts += clamp((m.revenueGrowthTTMYoy / 20) * 100); total++ }
  if (m.epsGrowthTTMYoy != null)     { pts += clamp((m.epsGrowthTTMYoy / 25) * 100); total++ }
  if (m.revenueGrowth5Y != null)     { pts += clamp((m.revenueGrowth5Y / 15) * 100); total++ }
  return total > 0 ? Math.round(pts / total) : 55
}

function scoreValuation(m: Partial<FinnhubMetricSet>): number {
  let pts = 0
  let total = 0
  if (m.peBasicExclExtraTTM != null && m.peBasicExclExtraTTM > 0) {
    // PE < 15 = 100, PE = 30 = 50, PE > 50 = low
    pts += clamp(100 - ((m.peBasicExclExtraTTM - 10) / 40) * 70)
    total++
  }
  if (m.pegFY1 != null && m.pegFY1 > 0) {
    pts += clamp(100 - ((m.pegFY1 - 0.5) / 3) * 100)
    total++
  }
  if (m.pbAnnual != null && m.pbAnnual > 0) {
    pts += clamp(100 - ((m.pbAnnual - 1) / 10) * 80)
    total++
  }
  return total > 0 ? Math.round(pts / total) : 50
}

function scoreHealth(m: Partial<FinnhubMetricSet>): number {
  let pts = 0
  let total = 0
  const de = m['totalDebt/totalEquityAnnual']
  if (de != null) { pts += clamp(100 - (de / 2) * 100); total++ }
  if (m.currentRatioAnnual != null) { pts += clamp((m.currentRatioAnnual / 3) * 100); total++ }
  return total > 0 ? Math.round(pts / total) : 65
}

function scoreCashflow(m: Partial<FinnhubMetricSet>): number {
  let pts = 0
  let total = 0
  if (m.netProfitMarginTTM != null) { pts += clamp((m.netProfitMarginTTM / 25) * 100); total++ }
  if (m.grossMarginTTM != null)     { pts += clamp((m.grossMarginTTM / 50) * 100); total++ }
  return total > 0 ? Math.round(pts / total) : 60
}

function scoreMomentum(m: Partial<FinnhubMetricSet>): number {
  const ret52 = m['52WeekPriceReturnDaily']
  if (ret52 == null) return 55
  // +50% = 100, 0% = 50, -50% = 0
  return clamp(50 + ret52 / 2)
}

export function computeScores(m: Partial<FinnhubMetricSet>) {
  const cat = {
    Quality:   scoreQuality(m),
    Growth:    scoreGrowth(m),
    Valuation: scoreValuation(m),
    Health:    scoreHealth(m),
    Cashflow:  scoreCashflow(m),
    Momentum:  scoreMomentum(m),
  }
  const overall = Math.round(
    cat.Quality * 0.25 +
    cat.Growth * 0.20 +
    cat.Valuation * 0.20 +
    cat.Health * 0.15 +
    cat.Cashflow * 0.10 +
    cat.Momentum * 0.10
  )
  return { overall, categories: cat }
}

// ─── Bull / Bear generation ───────────────────────────────────────────────────

export function generateBull(m: Partial<FinnhubMetricSet>, profile: FinnhubProfile): string[] {
  const pts: string[] = []
  const n = (v: number, d = 1) => v.toFixed(d)
  if ((m.roeRfy ?? 0) > 15)
    pts.push(`Strong ${n(m.roeRfy!)}% return on equity — management creates value efficiently`)
  if ((m.revenueGrowthTTMYoy ?? 0) > 8)
    pts.push(`Revenue growing ${n(m.revenueGrowthTTMYoy!)}% YoY — healthy top-line momentum`)
  if ((m.operatingMarginTTM ?? 0) > 18)
    pts.push(`${n(m.operatingMarginTTM!)}% operating margin signals pricing power and cost discipline`)
  if ((m['totalDebt/totalEquityAnnual'] ?? 99) < 0.5)
    pts.push(`Low debt-to-equity of ${n(m['totalDebt/totalEquityAnnual']!, 2)} — resilient balance sheet`)
  if ((m.currentRatioAnnual ?? 0) > 1.5)
    pts.push(`${n(m.currentRatioAnnual!, 1)}x current ratio gives ample liquidity headroom`)
  if (profile.marketCapitalization > 50_000)
    pts.push(`Large-cap stability with institutional backing and sector leadership`)
  if ((m.grossMarginTTM ?? 0) > 40)
    pts.push(`${n(m.grossMarginTTM!)}% gross margin reflects strong product economics`)
  return pts.slice(0, 4)
}

export function generateBear(m: Partial<FinnhubMetricSet>, quote: FinnhubQuote): string[] {
  const pts: string[] = []
  const n = (v: number, d = 1) => v.toFixed(d)
  const pe = m.peBasicExclExtraTTM
  if (pe != null && pe > 35)
    pts.push(`Elevated P/E of ${n(pe, 0)}x leaves little margin of safety if earnings disappoint`)
  const peg = m.pegFY1
  if (peg != null && peg > 2)
    pts.push(`PEG ratio of ${n(peg, 1)} suggests growth may already be priced in`)
  const de = m['totalDebt/totalEquityAnnual']
  if (de != null && de > 1.5)
    pts.push(`Debt-to-equity of ${n(de, 1)} could stress balance sheet in rising rate environments`)
  if (quote.dp < -10)
    pts.push(`Down ${Math.abs(quote.dp).toFixed(1)}% over recent period — weak near-term price momentum`)
  const rev = m.revenueGrowthTTMYoy
  if (rev != null && rev < 3)
    pts.push(`Revenue growth slowing to ${n(rev, 1)}% — watch for further deceleration`)
  if ((m.netProfitMarginTTM ?? 20) < 5)
    pts.push(`Thin ${n(m.netProfitMarginTTM ?? 0, 1)}% net margin leaves limited buffer for cost shocks`)
  return pts.slice(0, 4)
}

export function generateSummary(
  profile: FinnhubProfile,
  quote: FinnhubQuote,
  m: Partial<FinnhubMetricSet>,
): string {
  const cap = profile.marketCapitalization >= 1000
    ? `$${(profile.marketCapitalization / 1000).toFixed(1)}B`
    : `$${profile.marketCapitalization.toFixed(0)}M`
  const roe = m.roeRfy != null ? ` with ${m.roeRfy.toFixed(1)}% ROE` : ''
  const margin = m.operatingMarginTTM != null
    ? ` and ${m.operatingMarginTTM.toFixed(1)}% operating margin`
    : ''
  return (
    `${profile.name} (${profile.ticker}) is a ${cap} market-cap company in the ${profile.finnhubIndustry} sector` +
    `${roe}${margin}. ` +
    `Current price $${quote.c.toFixed(2)}, ${quote.dp >= 0 ? '+' : ''}${quote.dp.toFixed(2)}% today.`
  )
}

// ─── Supabase edge function client ────────────────────────────────────────────

import { supabase } from '@/lib/supabase'

async function invoke<T>(params: Record<string, string>): Promise<T> {
  const query = new URLSearchParams(params).toString()
  const { data, error } = await supabase.functions.invoke(`market-data?${query}`, {
    method: 'GET',
  })
  if (error) throw error
  if (data?.error) throw new Error(data.error)
  return data as T
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchStockAnalysis(symbol: string): Promise<StockAnalysis> {
  const raw = await invoke<{
    quote: FinnhubQuote
    profile: FinnhubProfile
    metrics: FinnhubMetrics
    recommend: FinnhubRecommendation[]
  }>({ type: 'analysis', symbol })

  const m = raw.metrics?.metric ?? {}
  const { overall, categories } = computeScores(m)

  return {
    symbol,
    quote: raw.quote,
    profile: raw.profile,
    metrics: raw.metrics,
    recommend: raw.recommend ?? [],
    score: overall,
    categoryScores: categories,
    bull: generateBull(m, raw.profile),
    bear: generateBear(m, raw.quote),
    summary: generateSummary(raw.profile, raw.quote, m),
  }
}

export async function fetchBulkQuotes(
  symbols: string[],
): Promise<Record<string, FinnhubQuote>> {
  return invoke<Record<string, FinnhubQuote>>({
    type: 'bulk-quotes',
    symbols: symbols.join(','),
  })
}

export async function fetchMarketNews(
  category = 'general',
): Promise<FinnhubNewsArticle[]> {
  return invoke<FinnhubNewsArticle[]>({ type: 'market-news', category })
}

export async function fetchCompanyNews(
  symbol: string,
  from?: string,
  to?: string,
): Promise<FinnhubNewsArticle[]> {
  const params: Record<string, string> = { type: 'company-news', symbol }
  if (from) params.from = from
  if (to) params.to = to
  return invoke<FinnhubNewsArticle[]>(params)
}

// ─── Formatting helpers (shared) ─────────────────────────────────────────────

export function fmtMarketCap(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}T`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}B`
  return `$${n.toFixed(0)}M`
}

export function fmtChange(dp: number): string {
  return `${dp >= 0 ? '+' : ''}${dp.toFixed(2)}%`
}
