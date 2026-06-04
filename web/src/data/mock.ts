// Mock data for the dashboard - represents realistic portfolio and market data

export const MOCK_PORTFOLIO = {
  totalValue: 142850.32,
  totalCost: 118200.00,
  dailyReturn: 0.0087,
  weeklyReturn: 0.0234,
  monthlyReturn: 0.0612,
  ytdReturn: 0.2341,
  lifetimeReturn: 0.2084,
  cagr: 0.1423,
  sharpe: 1.82,
  sortino: 2.41,
  beta: 1.12,
  volatility: 0.1834,
  maxDrawdown: -0.1423,
}

export const MOCK_HOLDINGS = [
  { id: '1', ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', shares: 45, costBasis: 158.20, currentPrice: 194.50, change: 0.0124, weight: 0.265 },
  { id: '2', ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', shares: 22, costBasis: 298.50, currentPrice: 412.80, change: 0.0089, weight: 0.184 },
  { id: '3', ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', shares: 18, costBasis: 421.00, currentPrice: 875.40, change: 0.0312, weight: 0.201 },
  { id: '4', ticker: 'JPM',  name: 'JPMorgan Chase', sector: 'Financial', shares: 35, costBasis: 148.30, currentPrice: 198.20, change: -0.0034, weight: 0.112 },
  { id: '5', ticker: 'JNJ',  name: 'Johnson & Johnson', sector: 'Healthcare', shares: 28, costBasis: 162.40, currentPrice: 158.90, change: -0.0021, weight: 0.071 },
  { id: '6', ticker: 'VTI',  name: 'Vanguard Total Stock Market ETF', sector: 'ETF', shares: 40, costBasis: 210.30, currentPrice: 241.60, change: 0.0058, weight: 0.085 },
  { id: '7', ticker: 'BRK.B', name: 'Berkshire Hathaway B', sector: 'Financial', shares: 20, costBasis: 324.10, currentPrice: 358.70, change: 0.0041, weight: 0.082 },
]

export const MOCK_PERFORMANCE_SERIES = (() => {
  const data = []
  const start = new Date('2024-01-01')
  let value = 118200
  for (let i = 0; i < 365; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    if (d.getDay() === 0 || d.getDay() === 6) continue
    const change = (Math.random() - 0.45) * 0.015
    value = value * (1 + change)
    data.push({
      date: d.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
    })
  }
  return data
})()

export const MOCK_SECTOR_ALLOCATION = [
  { sector: 'Technology', weight: 0.65, color: '#3b82f6' },
  { sector: 'Financial', weight: 0.194, color: '#06b6d4' },
  { sector: 'Healthcare', weight: 0.071, color: '#10b981' },
  { sector: 'ETF', weight: 0.085, color: '#f59e0b' },
]

export const MOCK_WATCHLIST = [
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 178.40, change: 0.0145, score: 74 },
  { ticker: 'META',  name: 'Meta Platforms', price: 492.80, change: 0.0231, score: 81 },
  { ticker: 'AMZN',  name: 'Amazon.com Inc.', price: 185.20, change: -0.0042, score: 78 },
  { ticker: 'TSLA',  name: 'Tesla Inc.', price: 248.60, change: 0.0523, score: 52 },
  { ticker: 'AMD',   name: 'Advanced Micro Devices', price: 164.30, change: 0.0289, score: 69 },
]

export const MOCK_NEWS = [
  {
    id: '1',
    ticker: 'AAPL',
    headline: 'Apple reports record services revenue, beating Wall Street estimates by 8%',
    source: 'Reuters',
    timestamp: '2h ago',
    sentiment: 'bullish' as const,
    sentimentScore: 0.82,
    importanceScore: 8,
    timeHorizonImpact: 'medium' as const,
    summary: 'Strong earnings guidance suggests higher future profitability and may improve investor confidence.',
  },
  {
    id: '2',
    ticker: 'NVDA',
    headline: 'NVIDIA announces new AI chip generation, demand expected to outpace supply',
    source: 'Bloomberg',
    timestamp: '4h ago',
    sentiment: 'bullish' as const,
    sentimentScore: 0.91,
    importanceScore: 9,
    timeHorizonImpact: 'long' as const,
    summary: 'Continued dominance in AI infrastructure could sustain above-market growth for 2-3 years.',
  },
  {
    id: '3',
    ticker: 'JPM',
    headline: 'Federal Reserve signals potential rate pause, bank stocks react positively',
    source: 'WSJ',
    timestamp: '6h ago',
    sentiment: 'neutral' as const,
    sentimentScore: 0.55,
    importanceScore: 7,
    timeHorizonImpact: 'short' as const,
    summary: 'Rate stability benefits net interest margins but also signals economic uncertainty.',
  },
]

export const MOCK_OPPORTUNITIES = [
  { ticker: 'META', name: 'Meta Platforms', score: 81, fairValue: 520, currentPrice: 492.80, upside: 0.055, margin: 0.052, sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet', score: 74, fairValue: 205, currentPrice: 178.40, upside: 0.149, margin: 0.129, sector: 'Technology' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway', score: 72, fairValue: 395, currentPrice: 358.70, upside: 0.101, margin: 0.092, sector: 'Financial' },
  { ticker: 'UNH', name: 'UnitedHealth Group', score: 70, fairValue: 580, currentPrice: 520.40, upside: 0.115, margin: 0.103, sector: 'Healthcare' },
]

export const MOCK_STRESS_TESTS = [
  { scenario: '2008 Financial Crisis', projectedDrawdown: -0.412, description: 'Global financial meltdown, credit freeze, housing collapse' },
  { scenario: 'Dot-Com Crash (2000-02)', projectedDrawdown: -0.358, description: 'Tech bubble burst, broad market selloff' },
  { scenario: 'COVID Crash (Mar 2020)', projectedDrawdown: -0.234, description: 'Pandemic shock, rapid V-shaped recovery' },
  { scenario: 'Inflation Shock (2022)', projectedDrawdown: -0.198, description: 'Rate hike cycle, growth stocks repriced' },
  { scenario: 'AI Bubble Burst', projectedDrawdown: -0.445, description: 'Hypothetical: tech concentration amplifies AI selloff' },
]

export const STOCK_MOCK: Record<string, {
  name: string; sector: string; price: number; score: number
  revenue_growth: number; earnings_growth: number; pe: number; peg: number
  roe: number; operating_margin: number; debt_to_equity: number
  dividend_yield: number; beta: number; analyst_target: number
  bull: string[]; bear: string[]; summary: string
}> = {
  AAPL: {
    name: 'Apple Inc.',
    sector: 'Technology',
    price: 194.50,
    score: 76,
    revenue_growth: 0.061,
    earnings_growth: 0.102,
    pe: 30.2,
    peg: 2.8,
    roe: 0.871,
    operating_margin: 0.303,
    debt_to_equity: 1.76,
    dividend_yield: 0.0052,
    beta: 1.28,
    analyst_target: 215,
    bull: ['Ecosystem lock-in drives 95%+ retention rates', 'Services segment growing 15%+ annually', 'Massive $110B annual buyback program', 'iPhone supercycle potential with AI features'],
    bear: ['Premium phone market saturation', 'China revenue concentration risk (18% of revenue)', 'High P/E relative to growth rate', 'Regulatory antitrust headwinds globally'],
    summary: 'Apple is the world\'s largest company by market cap, generating enormous free cash flow from its tightly integrated hardware-software ecosystem. The shift toward services revenue (higher margins, recurring) is a long-term positive.',
  },
  MSFT: {
    name: 'Microsoft Corp.',
    sector: 'Technology',
    price: 412.80,
    score: 84,
    revenue_growth: 0.158,
    earnings_growth: 0.214,
    pe: 35.1,
    peg: 1.6,
    roe: 0.413,
    operating_margin: 0.441,
    debt_to_equity: 0.28,
    dividend_yield: 0.0072,
    beta: 0.89,
    analyst_target: 480,
    bull: ['Azure cloud growing 28% — No. 2 globally', 'OpenAI partnership embeds AI across all products', 'Mission-critical enterprise software moat', 'Low beta relative to tech peers'],
    bear: ['Regulation of AI may constrain growth', 'Copilot monetization slower than expected', 'Valuation pricing in perfection', 'LinkedIn and Gaming are slower growth units'],
    summary: 'Microsoft has successfully reinvented itself as a cloud-first, AI-first company. Azure and the Microsoft 365 suite create powerful recurring revenue streams, while the OpenAI investment positions it at the center of the AI revolution.',
  },
}
