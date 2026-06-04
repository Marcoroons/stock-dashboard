// ─── Fund Intelligence Engine ─────────────────────────────────────────────────

export type FundType = 'etf' | 'mutual_fund' | 'index_fund'
export type RiskRating = 'conservative' | 'moderate_conservative' | 'moderate' | 'moderate_aggressive' | 'aggressive'
export type VerdictRating = 'excellent' | 'good' | 'fair' | 'poor'

export interface FundHolding {
  ticker: string
  name: string
  weight: number       // decimal 0–1
  sector: string
  country?: string
}

export interface FundSectorExposure {
  sector: string
  weight: number
  color: string
}

export interface FundGeoExposure {
  region: string
  weight: number
  flag: string
  color: string
}

export interface FeeImpactRow {
  years: number
  netBalance: number       // balance after fees
  grossBalance: number     // without fees
  feeDrag: number          // cumulative fee cost
}

export interface FundVerdict {
  rating: VerdictRating
  score: number            // 0–100
  headline: string
  detail: string
}

export interface FundProfile {
  ticker: string
  name: string
  type: FundType
  category: string
  subcategory?: string
  provider: string
  description: string
  expenseRatio: number     // 0.0003 = 0.03%
  aum: number              // billions USD
  inceptionYear: number
  price: number
  dividendYield: number
  // Performance
  return1y: number
  return3y: number
  return5y: number
  return10y: number
  ytd: number
  // Risk
  beta: number
  sharpe: number
  stdDev: number
  maxDrawdown: number
  // Composition
  topHoldings: FundHolding[]
  sectorExposure: FundSectorExposure[]
  geoExposure: FundGeoExposure[]
  holdingCount: number
  // Index (optional)
  benchmarkIndex?: string
  trackingError?: number
  // Style
  style?: 'growth' | 'blend' | 'value'
  marketCapBias?: 'large' | 'mid' | 'small' | 'multi'
}

export interface FundAnalysis {
  fund: FundProfile
  overallScore: number
  riskRating: RiskRating
  // Verdicts per dimension
  verdicts: {
    fee: FundVerdict
    diversification: FundVerdict
    performance: FundVerdict
    risk: FundVerdict
  }
  // Fee projections
  feeImpact: FeeImpactRow[]
  // Fit guidance
  suitableFor: string[]
  notSuitableFor: string[]
  strengths: string[]
  weaknesses: string[]
  alternatives: { ticker: string; reason: string }[]
  radarData: { metric: string; score: number; fullMark: number }[]
}

// ─── Color palette ────────────────────────────────────────────────────────────

const SECTOR_COLORS: Record<string, string> = {
  Technology: '#3b82f6',
  Financial: '#06b6d4',
  Healthcare: '#10b981',
  'Consumer Discretionary': '#f59e0b',
  'Consumer Staples': '#84cc16',
  Energy: '#ef4444',
  Utilities: '#64748b',
  'Real Estate': '#ec4899',
  Materials: '#f97316',
  Industrials: '#8b5cf6',
  'Communication Services': '#0ea5e9',
  International: '#94a3b8',
  Bonds: '#475569',
  Cash: '#1e293b',
}

// ─── Fund database ────────────────────────────────────────────────────────────

export const FUND_DB: Record<string, FundProfile> = {
  VTI: {
    ticker: 'VTI', name: 'Vanguard Total Stock Market ETF', type: 'etf',
    category: 'US Total Market', subcategory: 'Blend', provider: 'Vanguard',
    description: 'Tracks the CRSP US Total Market Index, covering nearly 100% of the US equity market including large, mid, small, and micro-cap stocks. The broadest single-fund exposure to US equities.',
    expenseRatio: 0.0003, aum: 1700, inceptionYear: 2001, price: 241.60, dividendYield: 0.014,
    return1y: 0.248, return3y: 0.102, return5y: 0.148, return10y: 0.121, ytd: 0.162,
    beta: 1.0, sharpe: 0.78, stdDev: 0.168, maxDrawdown: -0.346,
    benchmarkIndex: 'CRSP US Total Market', trackingError: 0.02,
    style: 'blend', marketCapBias: 'multi',
    holdingCount: 3800,
    topHoldings: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 0.068, sector: 'Technology' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', weight: 0.063, sector: 'Technology' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', weight: 0.054, sector: 'Technology' },
      { ticker: 'AMZN', name: 'Amazon.com', weight: 0.036, sector: 'Consumer Discretionary' },
      { ticker: 'META', name: 'Meta Platforms', weight: 0.025, sector: 'Communication Services' },
      { ticker: 'GOOGL', name: 'Alphabet A', weight: 0.019, sector: 'Communication Services' },
      { ticker: 'BRK.B', name: 'Berkshire Hathaway B', weight: 0.016, sector: 'Financial' },
      { ticker: 'JPM', name: 'JPMorgan Chase', weight: 0.015, sector: 'Financial' },
      { ticker: 'LLY', name: 'Eli Lilly', weight: 0.013, sector: 'Healthcare' },
      { ticker: 'AVGO', name: 'Broadcom Inc.', weight: 0.012, sector: 'Technology' },
    ],
    sectorExposure: [
      { sector: 'Technology', weight: 0.299, color: SECTOR_COLORS.Technology },
      { sector: 'Financial', weight: 0.138, color: SECTOR_COLORS.Financial },
      { sector: 'Healthcare', weight: 0.122, color: SECTOR_COLORS.Healthcare },
      { sector: 'Consumer Discretionary', weight: 0.098, color: SECTOR_COLORS['Consumer Discretionary'] },
      { sector: 'Industrials', weight: 0.089, color: SECTOR_COLORS.Industrials },
      { sector: 'Communication Services', weight: 0.082, color: SECTOR_COLORS['Communication Services'] },
      { sector: 'Consumer Staples', weight: 0.058, color: SECTOR_COLORS['Consumer Staples'] },
      { sector: 'Energy', weight: 0.038, color: SECTOR_COLORS.Energy },
      { sector: 'Real Estate', weight: 0.034, color: SECTOR_COLORS['Real Estate'] },
      { sector: 'Utilities', weight: 0.026, color: SECTOR_COLORS.Utilities },
      { sector: 'Materials', weight: 0.022, color: SECTOR_COLORS.Materials },
    ],
    geoExposure: [
      { region: 'United States', weight: 1.0, flag: '🇺🇸', color: '#3b82f6' },
    ],
  },

  QQQ: {
    ticker: 'QQQ', name: 'Invesco QQQ Trust', type: 'etf',
    category: 'US Technology', subcategory: 'Growth', provider: 'Invesco',
    description: 'Tracks the Nasdaq-100 Index, comprising 100 of the largest non-financial companies listed on Nasdaq. Tech-heavy with massive concentration in the largest growth stocks.',
    expenseRatio: 0.002, aum: 320, inceptionYear: 1999, price: 487.20, dividendYield: 0.005,
    return1y: 0.342, return3y: 0.148, return5y: 0.208, return10y: 0.182, ytd: 0.224,
    beta: 1.22, sharpe: 0.95, stdDev: 0.216, maxDrawdown: -0.408,
    benchmarkIndex: 'Nasdaq-100', trackingError: 0.03,
    style: 'growth', marketCapBias: 'large',
    holdingCount: 100,
    topHoldings: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 0.091, sector: 'Technology' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', weight: 0.083, sector: 'Technology' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', weight: 0.081, sector: 'Technology' },
      { ticker: 'AMZN', name: 'Amazon.com', weight: 0.051, sector: 'Consumer Discretionary' },
      { ticker: 'META', name: 'Meta Platforms', weight: 0.049, sector: 'Communication Services' },
      { ticker: 'TSLA', name: 'Tesla Inc.', weight: 0.031, sector: 'Consumer Discretionary' },
      { ticker: 'GOOGL', name: 'Alphabet A', weight: 0.028, sector: 'Communication Services' },
      { ticker: 'GOOG', name: 'Alphabet C', weight: 0.027, sector: 'Communication Services' },
      { ticker: 'AVGO', name: 'Broadcom Inc.', weight: 0.026, sector: 'Technology' },
      { ticker: 'COST', name: 'Costco Wholesale', weight: 0.025, sector: 'Consumer Staples' },
    ],
    sectorExposure: [
      { sector: 'Technology', weight: 0.502, color: SECTOR_COLORS.Technology },
      { sector: 'Communication Services', weight: 0.162, color: SECTOR_COLORS['Communication Services'] },
      { sector: 'Consumer Discretionary', weight: 0.132, color: SECTOR_COLORS['Consumer Discretionary'] },
      { sector: 'Consumer Staples', weight: 0.062, color: SECTOR_COLORS['Consumer Staples'] },
      { sector: 'Healthcare', weight: 0.058, color: SECTOR_COLORS.Healthcare },
      { sector: 'Industrials', weight: 0.042, color: SECTOR_COLORS.Industrials },
      { sector: 'Materials', weight: 0.018, color: SECTOR_COLORS.Materials },
      { sector: 'Utilities', weight: 0.016, color: SECTOR_COLORS.Utilities },
      { sector: 'Energy', weight: 0.008, color: SECTOR_COLORS.Energy },
    ],
    geoExposure: [
      { region: 'United States', weight: 0.97, flag: '🇺🇸', color: '#3b82f6' },
      { region: 'Other', weight: 0.03, flag: '🌐', color: '#64748b' },
    ],
  },

  SPY: {
    ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: 'etf',
    category: 'US Large Cap Blend', subcategory: 'Blend', provider: 'State Street',
    description: 'The original and most traded ETF, tracking the S&P 500 — 500 large-cap US companies. The benchmark most investors compare themselves to. Ultra-liquid with tight spreads.',
    expenseRatio: 0.00945, aum: 580, inceptionYear: 1993, price: 521.80, dividendYield: 0.013,
    return1y: 0.231, return3y: 0.101, return5y: 0.148, return10y: 0.128, ytd: 0.153,
    beta: 1.0, sharpe: 0.74, stdDev: 0.162, maxDrawdown: -0.338,
    benchmarkIndex: 'S&P 500', trackingError: 0.02,
    style: 'blend', marketCapBias: 'large',
    holdingCount: 503,
    topHoldings: [
      { ticker: 'AAPL', name: 'Apple Inc.', weight: 0.071, sector: 'Technology' },
      { ticker: 'MSFT', name: 'Microsoft Corp.', weight: 0.066, sector: 'Technology' },
      { ticker: 'NVDA', name: 'NVIDIA Corp.', weight: 0.059, sector: 'Technology' },
      { ticker: 'AMZN', name: 'Amazon.com', weight: 0.038, sector: 'Consumer Discretionary' },
      { ticker: 'META', name: 'Meta Platforms', weight: 0.027, sector: 'Communication Services' },
      { ticker: 'GOOGL', name: 'Alphabet A', weight: 0.021, sector: 'Communication Services' },
      { ticker: 'BRK.B', name: 'Berkshire Hathaway B', weight: 0.017, sector: 'Financial' },
      { ticker: 'GOOG', name: 'Alphabet C', weight: 0.017, sector: 'Communication Services' },
      { ticker: 'JPM', name: 'JPMorgan Chase', weight: 0.016, sector: 'Financial' },
      { ticker: 'LLY', name: 'Eli Lilly', weight: 0.014, sector: 'Healthcare' },
    ],
    sectorExposure: [
      { sector: 'Technology', weight: 0.312, color: SECTOR_COLORS.Technology },
      { sector: 'Financial', weight: 0.134, color: SECTOR_COLORS.Financial },
      { sector: 'Healthcare', weight: 0.124, color: SECTOR_COLORS.Healthcare },
      { sector: 'Consumer Discretionary', weight: 0.098, color: SECTOR_COLORS['Consumer Discretionary'] },
      { sector: 'Communication Services', weight: 0.085, color: SECTOR_COLORS['Communication Services'] },
      { sector: 'Industrials', weight: 0.082, color: SECTOR_COLORS.Industrials },
      { sector: 'Consumer Staples', weight: 0.059, color: SECTOR_COLORS['Consumer Staples'] },
      { sector: 'Energy', weight: 0.036, color: SECTOR_COLORS.Energy },
      { sector: 'Utilities', weight: 0.026, color: SECTOR_COLORS.Utilities },
      { sector: 'Real Estate', weight: 0.023, color: SECTOR_COLORS['Real Estate'] },
      { sector: 'Materials', weight: 0.021, color: SECTOR_COLORS.Materials },
    ],
    geoExposure: [
      { region: 'United States', weight: 1.0, flag: '🇺🇸', color: '#3b82f6' },
    ],
  },

  VXUS: {
    ticker: 'VXUS', name: 'Vanguard Total International Stock ETF', type: 'etf',
    category: 'International', subcategory: 'Blend', provider: 'Vanguard',
    description: 'Provides exposure to stocks outside the United States — covering developed and emerging markets across Europe, Asia, and beyond. The complement to VTI for a globally diversified portfolio.',
    expenseRatio: 0.0007, aum: 70, inceptionYear: 2011, price: 64.30, dividendYield: 0.031,
    return1y: 0.142, return3y: 0.048, return5y: 0.072, return10y: 0.051, ytd: 0.082,
    beta: 0.88, sharpe: 0.39, stdDev: 0.172, maxDrawdown: -0.398,
    benchmarkIndex: 'FTSE Global All Cap ex US', trackingError: 0.04,
    style: 'blend', marketCapBias: 'multi',
    holdingCount: 8400,
    topHoldings: [
      { ticker: 'NOVO-B', name: 'Novo Nordisk', weight: 0.022, sector: 'Healthcare', country: 'Denmark' },
      { ticker: 'ASML', name: 'ASML Holding', weight: 0.018, sector: 'Technology', country: 'Netherlands' },
      { ticker: '2330', name: 'Taiwan Semiconductor', weight: 0.016, sector: 'Technology', country: 'Taiwan' },
      { ticker: 'NESN', name: 'Nestlé', weight: 0.014, sector: 'Consumer Staples', country: 'Switzerland' },
      { ticker: 'SAMSUNG', name: 'Samsung Electronics', weight: 0.013, sector: 'Technology', country: 'South Korea' },
      { ticker: 'ROG', name: 'Roche Holding', weight: 0.012, sector: 'Healthcare', country: 'Switzerland' },
      { ticker: 'SHEL', name: 'Shell PLC', weight: 0.011, sector: 'Energy', country: 'UK' },
      { ticker: 'LVMH', name: 'LVMH Moët Hennessy', weight: 0.010, sector: 'Consumer Discretionary', country: 'France' },
      { ticker: 'AZN', name: 'AstraZeneca', weight: 0.009, sector: 'Healthcare', country: 'UK' },
      { ticker: '005930', name: 'Samsung Electronics Pref.', weight: 0.009, sector: 'Technology', country: 'South Korea' },
    ],
    sectorExposure: [
      { sector: 'Financial', weight: 0.208, color: SECTOR_COLORS.Financial },
      { sector: 'Technology', weight: 0.162, color: SECTOR_COLORS.Technology },
      { sector: 'Industrials', weight: 0.138, color: SECTOR_COLORS.Industrials },
      { sector: 'Healthcare', weight: 0.098, color: SECTOR_COLORS.Healthcare },
      { sector: 'Consumer Discretionary', weight: 0.102, color: SECTOR_COLORS['Consumer Discretionary'] },
      { sector: 'Consumer Staples', weight: 0.092, color: SECTOR_COLORS['Consumer Staples'] },
      { sector: 'Materials', weight: 0.062, color: SECTOR_COLORS.Materials },
      { sector: 'Energy', weight: 0.052, color: SECTOR_COLORS.Energy },
      { sector: 'Communication Services', weight: 0.048, color: SECTOR_COLORS['Communication Services'] },
      { sector: 'Real Estate', weight: 0.022, color: SECTOR_COLORS['Real Estate'] },
      { sector: 'Utilities', weight: 0.016, color: SECTOR_COLORS.Utilities },
    ],
    geoExposure: [
      { region: 'Europe', weight: 0.392, flag: '🇪🇺', color: '#3b82f6' },
      { region: 'Pacific Asia', weight: 0.268, flag: '🌏', color: '#06b6d4' },
      { region: 'Emerging Markets', weight: 0.242, flag: '🌍', color: '#f59e0b' },
      { region: 'Canada', weight: 0.062, flag: '🇨🇦', color: '#10b981' },
      { region: 'Other', weight: 0.036, flag: '🌐', color: '#64748b' },
    ],
  },

  BND: {
    ticker: 'BND', name: 'Vanguard Total Bond Market ETF', type: 'etf',
    category: 'US Total Bond', subcategory: 'Intermediate-term Bond', provider: 'Vanguard',
    description: 'Tracks the Bloomberg US Aggregate Float Adjusted Index — a broad, diversified exposure to the US investment-grade bond market, including government, corporate, and mortgage-backed securities.',
    expenseRatio: 0.0003, aum: 120, inceptionYear: 2007, price: 72.40, dividendYield: 0.044,
    return1y: 0.062, return3y: -0.014, return5y: 0.008, return10y: 0.018, ytd: 0.038,
    beta: 0.04, sharpe: 0.18, stdDev: 0.054, maxDrawdown: -0.172,
    benchmarkIndex: 'Bloomberg US Aggregate', trackingError: 0.02,
    style: 'blend', marketCapBias: 'large',
    holdingCount: 10100,
    topHoldings: [
      { ticker: 'US GOVT', name: 'US Treasury Notes (various)', weight: 0.442, sector: 'Bonds' },
      { ticker: 'FNMA', name: 'Federal National Mortgage (FNMA)', weight: 0.182, sector: 'Bonds' },
      { ticker: 'FHLMC', name: 'Federal Home Loan Mortgage', weight: 0.098, sector: 'Bonds' },
      { ticker: 'IG CORP', name: 'Investment Grade Corporates', weight: 0.248, sector: 'Bonds' },
      { ticker: 'OTHER', name: 'Other Bonds', weight: 0.030, sector: 'Bonds' },
    ],
    sectorExposure: [
      { sector: 'Bonds', weight: 1.0, color: SECTOR_COLORS.Bonds },
    ],
    geoExposure: [
      { region: 'United States', weight: 1.0, flag: '🇺🇸', color: '#3b82f6' },
    ],
  },

  VEA: {
    ticker: 'VEA', name: 'Vanguard FTSE Developed Markets ETF', type: 'etf',
    category: 'International Developed', subcategory: 'Blend', provider: 'Vanguard',
    description: 'Tracks the FTSE Developed All Cap ex US Index, providing exposure to companies in developed markets outside the United States — primarily Europe, Japan, and Australia.',
    expenseRatio: 0.0005, aum: 112, inceptionYear: 2007, price: 48.90, dividendYield: 0.033,
    return1y: 0.138, return3y: 0.054, return5y: 0.082, return10y: 0.062, ytd: 0.091,
    beta: 0.85, sharpe: 0.42, stdDev: 0.158, maxDrawdown: -0.382,
    benchmarkIndex: 'FTSE Developed All Cap ex US', trackingError: 0.04,
    style: 'blend', marketCapBias: 'multi',
    holdingCount: 4100,
    topHoldings: [
      { ticker: 'ASML', name: 'ASML Holding', weight: 0.028, sector: 'Technology', country: 'Netherlands' },
      { ticker: 'NOVO-B', name: 'Novo Nordisk', weight: 0.024, sector: 'Healthcare', country: 'Denmark' },
      { ticker: 'NESN', name: 'Nestlé', weight: 0.018, sector: 'Consumer Staples', country: 'Switzerland' },
      { ticker: 'ROG', name: 'Roche Holding', weight: 0.016, sector: 'Healthcare', country: 'Switzerland' },
      { ticker: 'SHEL', name: 'Shell PLC', weight: 0.014, sector: 'Energy', country: 'UK' },
      { ticker: '7203', name: 'Toyota Motor', weight: 0.012, sector: 'Consumer Discretionary', country: 'Japan' },
      { ticker: 'LVMH', name: 'LVMH Moët Hennessy', weight: 0.012, sector: 'Consumer Discretionary', country: 'France' },
      { ticker: 'AZN', name: 'AstraZeneca', weight: 0.011, sector: 'Healthcare', country: 'UK' },
      { ticker: 'SAP', name: 'SAP SE', weight: 0.010, sector: 'Technology', country: 'Germany' },
      { ticker: 'SIE', name: 'Siemens AG', weight: 0.009, sector: 'Industrials', country: 'Germany' },
    ],
    sectorExposure: [
      { sector: 'Financial', weight: 0.222, color: SECTOR_COLORS.Financial },
      { sector: 'Industrials', weight: 0.158, color: SECTOR_COLORS.Industrials },
      { sector: 'Healthcare', weight: 0.112, color: SECTOR_COLORS.Healthcare },
      { sector: 'Consumer Discretionary', weight: 0.108, color: SECTOR_COLORS['Consumer Discretionary'] },
      { sector: 'Technology', weight: 0.102, color: SECTOR_COLORS.Technology },
      { sector: 'Consumer Staples', weight: 0.098, color: SECTOR_COLORS['Consumer Staples'] },
      { sector: 'Materials', weight: 0.068, color: SECTOR_COLORS.Materials },
      { sector: 'Energy', weight: 0.058, color: SECTOR_COLORS.Energy },
      { sector: 'Communication Services', weight: 0.042, color: SECTOR_COLORS['Communication Services'] },
      { sector: 'Real Estate', weight: 0.018, color: SECTOR_COLORS['Real Estate'] },
      { sector: 'Utilities', weight: 0.014, color: SECTOR_COLORS.Utilities },
    ],
    geoExposure: [
      { region: 'Europe', weight: 0.542, flag: '🇪🇺', color: '#3b82f6' },
      { region: 'Japan', weight: 0.228, flag: '🇯🇵', color: '#06b6d4' },
      { region: 'Asia Pacific', weight: 0.162, flag: '🌏', color: '#f59e0b' },
      { region: 'Canada', weight: 0.062, flag: '🇨🇦', color: '#10b981' },
      { region: 'Other', weight: 0.006, flag: '🌐', color: '#64748b' },
    ],
  },

  SCHD: {
    ticker: 'SCHD', name: 'Schwab US Dividend Equity ETF', type: 'etf',
    category: 'US Dividend', subcategory: 'Value', provider: 'Charles Schwab',
    description: 'Tracks an index of high-dividend-yielding US stocks with a strong track record of consistent dividend payments. Favors companies with quality fundamentals — low debt, high return on equity.',
    expenseRatio: 0.0006, aum: 58, inceptionYear: 2011, price: 27.80, dividendYield: 0.038,
    return1y: 0.148, return3y: 0.082, return5y: 0.128, return10y: 0.122, ytd: 0.112,
    beta: 0.82, sharpe: 0.68, stdDev: 0.148, maxDrawdown: -0.288,
    benchmarkIndex: 'Dow Jones US Dividend 100', trackingError: 0.03,
    style: 'value', marketCapBias: 'large',
    holdingCount: 102,
    topHoldings: [
      { ticker: 'ABBV', name: 'AbbVie Inc.', weight: 0.042, sector: 'Healthcare' },
      { ticker: 'AVGO', name: 'Broadcom Inc.', weight: 0.038, sector: 'Technology' },
      { ticker: 'HD', name: 'Home Depot', weight: 0.036, sector: 'Consumer Discretionary' },
      { ticker: 'AMGN', name: 'Amgen Inc.', weight: 0.033, sector: 'Healthcare' },
      { ticker: 'PEP', name: 'PepsiCo Inc.', weight: 0.031, sector: 'Consumer Staples' },
      { ticker: 'KO', name: 'Coca-Cola', weight: 0.030, sector: 'Consumer Staples' },
      { ticker: 'CVX', name: 'Chevron Corp.', weight: 0.028, sector: 'Energy' },
      { ticker: 'VZ', name: 'Verizon Communications', weight: 0.027, sector: 'Communication Services' },
      { ticker: 'CSCO', name: 'Cisco Systems', weight: 0.026, sector: 'Technology' },
      { ticker: 'IBM', name: 'International Business Machines', weight: 0.025, sector: 'Technology' },
    ],
    sectorExposure: [
      { sector: 'Financial', weight: 0.198, color: SECTOR_COLORS.Financial },
      { sector: 'Healthcare', weight: 0.172, color: SECTOR_COLORS.Healthcare },
      { sector: 'Consumer Staples', weight: 0.148, color: SECTOR_COLORS['Consumer Staples'] },
      { sector: 'Technology', weight: 0.138, color: SECTOR_COLORS.Technology },
      { sector: 'Industrials', weight: 0.118, color: SECTOR_COLORS.Industrials },
      { sector: 'Energy', weight: 0.082, color: SECTOR_COLORS.Energy },
      { sector: 'Consumer Discretionary', weight: 0.078, color: SECTOR_COLORS['Consumer Discretionary'] },
      { sector: 'Communication Services', weight: 0.048, color: SECTOR_COLORS['Communication Services'] },
      { sector: 'Materials', weight: 0.018, color: SECTOR_COLORS.Materials },
    ],
    geoExposure: [
      { region: 'United States', weight: 1.0, flag: '🇺🇸', color: '#3b82f6' },
    ],
  },

  ARKK: {
    ticker: 'ARKK', name: 'ARK Innovation ETF', type: 'etf',
    category: 'Thematic Growth', subcategory: 'Active', provider: 'ARK Invest',
    description: 'An actively managed ETF focused on disruptive innovation — including genomics, autonomous vehicles, fintech, and AI. High conviction bets on emerging technologies. Extremely high volatility and risk.',
    expenseRatio: 0.0075, aum: 6.8, inceptionYear: 2014, price: 48.20, dividendYield: 0.0,
    return1y: 0.068, return3y: -0.298, return5y: -0.062, return10y: 0.094, ytd: 0.038,
    beta: 1.82, sharpe: -0.22, stdDev: 0.512, maxDrawdown: -0.782,
    style: 'growth', marketCapBias: 'small',
    holdingCount: 35,
    topHoldings: [
      { ticker: 'TSLA', name: 'Tesla Inc.', weight: 0.092, sector: 'Consumer Discretionary' },
      { ticker: 'RBLX', name: 'Roblox Corp.', weight: 0.072, sector: 'Technology' },
      { ticker: 'ROKU', name: 'Roku Inc.', weight: 0.068, sector: 'Technology' },
      { ticker: 'COIN', name: 'Coinbase Global', weight: 0.062, sector: 'Financial' },
      { ticker: 'EXAS', name: 'Exact Sciences', weight: 0.052, sector: 'Healthcare' },
      { ticker: 'U', name: 'Unity Software', weight: 0.048, sector: 'Technology' },
      { ticker: 'CRSP', name: 'CRISPR Therapeutics', weight: 0.042, sector: 'Healthcare' },
      { ticker: 'PATH', name: 'UiPath Inc.', weight: 0.038, sector: 'Technology' },
      { ticker: 'PACB', name: 'Pacific Biosciences', weight: 0.032, sector: 'Healthcare' },
      { ticker: 'TWLO', name: 'Twilio Inc.', weight: 0.028, sector: 'Technology' },
    ],
    sectorExposure: [
      { sector: 'Technology', weight: 0.482, color: SECTOR_COLORS.Technology },
      { sector: 'Healthcare', weight: 0.262, color: SECTOR_COLORS.Healthcare },
      { sector: 'Consumer Discretionary', weight: 0.132, color: SECTOR_COLORS['Consumer Discretionary'] },
      { sector: 'Financial', weight: 0.082, color: SECTOR_COLORS.Financial },
      { sector: 'Industrials', weight: 0.042, color: SECTOR_COLORS.Industrials },
    ],
    geoExposure: [
      { region: 'United States', weight: 0.92, flag: '🇺🇸', color: '#3b82f6' },
      { region: 'Other', weight: 0.08, flag: '🌐', color: '#64748b' },
    ],
  },
}

export const FUND_TICKERS = Object.keys(FUND_DB)

// ─── Analysis engine ──────────────────────────────────────────────────────────

function ratingFromScore(score: number): VerdictRating {
  if (score >= 80) return 'excellent'
  if (score >= 60) return 'good'
  if (score >= 40) return 'fair'
  return 'poor'
}

function computeFeeVerdict(fund: FundProfile): FundVerdict {
  const pct = fund.expenseRatio * 100
  let score: number
  if (pct <= 0.05) score = 96
  else if (pct <= 0.10) score = 88
  else if (pct <= 0.20) score = 76
  else if (pct <= 0.50) score = 60
  else if (pct <= 1.0)  score = 38
  else score = 15

  const headline =
    pct <= 0.05 ? `Ultra-low fee — ${pct.toFixed(3)}% per year` :
    pct <= 0.20 ? `Low fee — ${pct.toFixed(2)}% per year` :
    pct <= 0.75 ? `Moderate fee — ${pct.toFixed(2)}% per year` :
    `High fee — ${pct.toFixed(2)}% per year`

  const annual10k = 10000 * fund.expenseRatio
  const detail = pct <= 0.10
    ? `At ${pct.toFixed(3)}%, you pay just $${annual10k.toFixed(2)}/year on a $10,000 investment. This is exceptionally competitive — fees compound against you silently over time, so low fees are one of the most reliable predictors of long-term outperformance.`
    : pct <= 0.75
    ? `At ${pct.toFixed(2)}%, this fund costs $${annual10k.toFixed(2)}/year per $10,000 invested. Reasonable for an actively managed or thematic strategy, but verify the performance justifies the premium over cheaper index alternatives.`
    : `At ${pct.toFixed(2)}%, this fund costs $${annual10k.toFixed(2)}/year per $10,000. Over 20 years, compounding fees can consume 15–30% of potential returns. Active management would need to consistently beat the market by this margin just to break even.`

  return { rating: ratingFromScore(score), score, headline, detail }
}

function computeDiversificationVerdict(fund: FundProfile): FundVerdict {
  let score = 50
  if (fund.holdingCount >= 1000) score += 30
  else if (fund.holdingCount >= 100) score += 20
  else if (fund.holdingCount >= 25) score += 10
  else score -= 10

  const topSector = fund.sectorExposure[0]
  if (topSector?.weight < 0.20) score += 15
  else if (topSector?.weight < 0.35) score += 8
  else if (topSector?.weight > 0.55) score -= 15
  else if (topSector?.weight > 0.45) score -= 8

  const topHolding = fund.topHoldings[0]
  if (topHolding?.weight < 0.05) score += 5
  else if (topHolding?.weight > 0.10) score -= 10

  if (fund.geoExposure.length > 2) score += 10
  score = Math.max(0, Math.min(100, score))

  const headline =
    score >= 80 ? `Highly diversified — ${fund.holdingCount.toLocaleString()} holdings across ${fund.sectorExposure.length} sectors` :
    score >= 60 ? `Moderately diversified — ${fund.holdingCount.toLocaleString()} holdings` :
    `Concentrated fund — ${fund.holdingCount} holdings in narrow exposure`

  const detail = `Top holding is ${fund.topHoldings[0]?.ticker ?? 'n/a'} at ${((fund.topHoldings[0]?.weight ?? 0) * 100).toFixed(1)}% of the fund. ` +
    `Largest sector (${topSector?.sector ?? 'n/a'}) represents ${((topSector?.weight ?? 0) * 100).toFixed(1)}% of assets. ` +
    `${fund.geoExposure.length > 1 ? `Geographic exposure spans ${fund.geoExposure.length} regions.` : 'Geographically concentrated in one market.'}`

  return { rating: ratingFromScore(score), score, headline, detail }
}

function computePerformanceVerdict(fund: FundProfile): FundVerdict {
  let score = 50
  if (fund.return5y >= 0.15) score += 25
  else if (fund.return5y >= 0.10) score += 15
  else if (fund.return5y >= 0.06) score += 5
  else if (fund.return5y < 0) score -= 20

  if (fund.sharpe >= 0.80) score += 20
  else if (fund.sharpe >= 0.50) score += 10
  else if (fund.sharpe < 0) score -= 20
  else if (fund.sharpe < 0.30) score -= 10

  score = Math.max(0, Math.min(100, score))

  const headline =
    fund.return5y >= 0.14 ? `Strong long-term performer — ${(fund.return5y * 100).toFixed(1)}% 5Y annualized` :
    fund.return5y >= 0.07 ? `Solid returns — ${(fund.return5y * 100).toFixed(1)}% 5Y annualized` :
    fund.return5y >= 0 ? `Modest returns — ${(fund.return5y * 100).toFixed(1)}% 5Y annualized` :
    `Negative 5Y returns — ${(fund.return5y * 100).toFixed(1)}% annualized`

  const detail = `5-year annualized return of ${(fund.return5y * 100).toFixed(1)}% (10Y: ${(fund.return10y * 100).toFixed(1)}%). ` +
    `Sharpe ratio of ${fund.sharpe.toFixed(2)} indicates ${fund.sharpe >= 0.7 ? 'strong' : fund.sharpe >= 0.4 ? 'acceptable' : 'weak'} risk-adjusted performance. ` +
    (fund.trackingError != null ? `Tracking error of ${(fund.trackingError * 100).toFixed(2)}% vs ${fund.benchmarkIndex}.` : 'Actively managed — returns depend on manager skill.')

  return { rating: ratingFromScore(score), score, headline, detail }
}

function computeRiskVerdict(fund: FundProfile): FundVerdict {
  let score = 70
  if (fund.beta > 1.8) score -= 30
  else if (fund.beta > 1.3) score -= 15
  else if (fund.beta < 0.6) score += 10

  if (fund.maxDrawdown < -0.60) score -= 25
  else if (fund.maxDrawdown < -0.40) score -= 12
  else if (fund.maxDrawdown > -0.20) score += 10

  if (fund.stdDev > 0.40) score -= 20
  else if (fund.stdDev > 0.25) score -= 8
  else if (fund.stdDev < 0.10) score += 10

  score = Math.max(0, Math.min(100, score))

  const headline =
    score >= 80 ? `Low risk profile — beta ${fund.beta.toFixed(2)}, stable drawdown` :
    score >= 60 ? `Moderate risk — standard market volatility` :
    score >= 40 ? `Above-average risk — expect large swings` :
    `High risk — significant volatility and deep drawdowns possible`

  const detail = `Beta of ${fund.beta.toFixed(2)} vs the S&P 500. Maximum historical drawdown: ${(fund.maxDrawdown * 100).toFixed(1)}%. ` +
    `Annualized volatility (stdDev) of ${(fund.stdDev * 100).toFixed(1)}%. ` +
    (fund.beta > 1.3 ? 'This fund amplifies market moves — losses can be severe in downturns.' : fund.beta < 0.7 ? 'Lower volatility than the broader market, suitable for risk-averse investors.' : 'Risk profile aligns broadly with the overall market.')

  return { rating: ratingFromScore(score), score, headline, detail }
}

function computeRiskRating(fund: FundProfile): RiskRating {
  const b = fund.beta
  if (b < 0.4 || fund.stdDev < 0.06) return 'conservative'
  if (b < 0.75 || fund.stdDev < 0.12) return 'moderate_conservative'
  if (b < 1.1 || fund.stdDev < 0.19) return 'moderate'
  if (b < 1.5 || fund.stdDev < 0.32) return 'moderate_aggressive'
  return 'aggressive'
}

function computeFeeImpact(expenseRatio: number, baseReturn = 0.09): FeeImpactRow[] {
  const years = [1, 5, 10, 20, 30]
  return years.map(y => {
    const grossBalance = 10000 * Math.pow(1 + baseReturn, y)
    const netBalance = 10000 * Math.pow(1 + baseReturn - expenseRatio, y)
    return {
      years: y,
      grossBalance: Math.round(grossBalance),
      netBalance: Math.round(netBalance),
      feeDrag: Math.round(grossBalance - netBalance),
    }
  })
}

export function analyzeFund(ticker: string): FundAnalysis | null {
  const fund = FUND_DB[ticker.toUpperCase()]
  if (!fund) return null

  const feeVerdict = computeFeeVerdict(fund)
  const divVerdict = computeDiversificationVerdict(fund)
  const perfVerdict = computePerformanceVerdict(fund)
  const riskVerdict = computeRiskVerdict(fund)

  const overallScore = Math.round(
    feeVerdict.score * 0.30 +
    divVerdict.score * 0.25 +
    perfVerdict.score * 0.25 +
    riskVerdict.score * 0.20
  )

  const riskRating = computeRiskRating(fund)

  // Suitable for
  const suitableFor: string[] = []
  const notSuitableFor: string[] = []

  if (fund.expenseRatio < 0.002) suitableFor.push('Cost-conscious, long-term investors')
  if (fund.holdingCount > 500) suitableFor.push('Passive investors seeking broad diversification')
  if (fund.dividendYield > 0.025) suitableFor.push('Income investors seeking dividend cash flow')
  if (fund.beta < 0.8) suitableFor.push('Risk-averse investors wanting lower volatility')
  if (fund.geoExposure.length > 2) suitableFor.push('Investors seeking global geographic diversification')
  if (fund.type === 'etf' && fund.benchmarkIndex) suitableFor.push('Index investors who want low tracking error')
  if (fund.return5y > 0.13) suitableFor.push('Growth-oriented investors with a long time horizon')
  if (fund.category.includes('Dividend')) suitableFor.push('Retirees building a dividend income stream')

  if (fund.beta > 1.5) notSuitableFor.push('Conservative or risk-averse investors')
  if (fund.maxDrawdown < -0.5) notSuitableFor.push('Investors who cannot stomach 50%+ drawdowns')
  if (fund.expenseRatio > 0.006) notSuitableFor.push('Fee-sensitive investors with a long time horizon')
  if (fund.holdingCount < 50) notSuitableFor.push('Investors seeking broad diversification in a single fund')
  if (fund.sharpe < 0) notSuitableFor.push('Investors seeking consistent risk-adjusted returns')
  if (fund.geoExposure.length === 1 && fund.geoExposure[0].region === 'United States') notSuitableFor.push('Investors wanting international diversification')
  if (fund.style === 'growth' && fund.beta > 1.2) notSuitableFor.push('Investors near retirement or with short time horizons')

  // Strengths & weaknesses
  const strengths: string[] = []
  const weaknesses: string[] = []

  if (feeVerdict.score >= 80) strengths.push(`Extremely competitive fee: ${(fund.expenseRatio * 100).toFixed(3)}% expense ratio`)
  if (divVerdict.score >= 80) strengths.push(`Excellent diversification across ${fund.holdingCount.toLocaleString()} holdings`)
  if (perfVerdict.score >= 80) strengths.push(`Strong historical performance: ${(fund.return5y * 100).toFixed(1)}% 5Y annualized`)
  if (riskVerdict.score >= 80) strengths.push(`Low risk profile with contained drawdowns`)
  if (fund.dividendYield > 0.025) strengths.push(`Attractive dividend yield of ${(fund.dividendYield * 100).toFixed(1)}%`)
  if (fund.sharpe > 0.7) strengths.push(`High Sharpe ratio (${fund.sharpe.toFixed(2)}) — good return per unit of risk`)
  if (strengths.length === 0) strengths.push('Provides exposure to a distinct market segment')

  if (feeVerdict.score < 50) weaknesses.push(`High expense ratio: ${(fund.expenseRatio * 100).toFixed(2)}% annually`)
  if (divVerdict.score < 50) weaknesses.push(`Concentrated exposure — limited diversification`)
  if (perfVerdict.score < 50) weaknesses.push(`Weak historical performance vs broad market`)
  if (riskVerdict.score < 50) weaknesses.push(`High volatility: beta of ${fund.beta.toFixed(2)}, ${(fund.maxDrawdown * 100).toFixed(0)}% max drawdown`)
  if (fund.geoExposure.length === 1) weaknesses.push('No geographic diversification outside home market')
  if (weaknesses.length === 0) weaknesses.push('No critical structural weaknesses identified')

  // Alternatives
  const alternatives: { ticker: string; reason: string }[] = []
  if (ticker !== 'VTI' && fund.category.includes('US') && fund.expenseRatio > 0.001) {
    alternatives.push({ ticker: 'VTI', reason: 'Broader US market coverage at lower cost' })
  }
  if (ticker !== 'VXUS' && !fund.category.includes('International') && fund.geoExposure.length === 1) {
    alternatives.push({ ticker: 'VXUS', reason: 'Adds international diversification to complement US exposure' })
  }
  if (ticker !== 'BND' && fund.category !== 'US Total Bond' && fund.beta > 1.0) {
    alternatives.push({ ticker: 'BND', reason: 'Lower-volatility bond exposure to balance portfolio risk' })
  }
  if (ticker !== 'SCHD' && fund.dividendYield < 0.015 && fund.category.includes('US')) {
    alternatives.push({ ticker: 'SCHD', reason: 'Higher dividend yield with quality factor tilt' })
  }

  const radarData = [
    { metric: 'Fees', score: feeVerdict.score, fullMark: 100 },
    { metric: 'Diversification', score: divVerdict.score, fullMark: 100 },
    { metric: 'Performance', score: perfVerdict.score, fullMark: 100 },
    { metric: 'Risk Profile', score: riskVerdict.score, fullMark: 100 },
    { metric: 'Dividend', score: Math.min(100, Math.round(fund.dividendYield * 1500)), fullMark: 100 },
  ]

  return {
    fund,
    overallScore,
    riskRating,
    verdicts: { fee: feeVerdict, diversification: divVerdict, performance: perfVerdict, risk: riskVerdict },
    feeImpact: computeFeeImpact(fund.expenseRatio),
    suitableFor: suitableFor.slice(0, 5),
    notSuitableFor: notSuitableFor.slice(0, 4),
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 4),
    alternatives: alternatives.slice(0, 3),
    radarData,
  }
}
