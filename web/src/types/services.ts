export interface InvestorDNA {
  id: string
  user_id: string
  emotional_profile: 'analytical' | 'pragmatic' | 'visionary' | 'cautious'
  wealth_style: 'accumulator' | 'optimizer' | 'protector' | 'experimenter'
  time_horizon: 'short' | 'medium' | 'long'
  knowledge_level: 'beginner' | 'intermediate' | 'advanced'
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive'
  investment_focus: 'growth' | 'income' | 'balanced'
  created_at: string
  updated_at: string
}

export interface Position {
  id: string
  portfolio_id: string
  user_id: string
  ticker: string
  name: string
  shares: number
  cost_basis: number
  asset_type: string
  purchase_date?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface Portfolio {
  id: string
  user_id: string
  name: string
  description?: string
  currency: string
  is_default?: boolean
  created_at: string
  updated_at: string
}

export interface Stock {
  id: string
  ticker: string
  name: string
  sector: string
  industry: string
  market_cap: number
  pe_ratio: number
  dividend_yield: number
  current_price: number
  price_52w_high: number
  price_52w_low: number
  beta: number
  eps: number
  revenue_ttm: number
  last_updated: string
}

export interface ETF {
  id: string
  ticker: string
  name: string
  category: string
  net_assets: number
  expense_ratio: number
  shares_outstanding: number
  current_price: number
  ytd_return: number
  three_year_return: number
  inception_date: string
  last_updated: string
}

export interface News {
  id: string
  ticker: string
  headline: string
  summary: string
  source: string
  url: string
  sentiment: 'positive' | 'neutral' | 'negative'
  relevance_score: number
  published_at: string
  created_at: string
}

export interface Recommendation {
  id: string
  user_id: string
  ticker: string
  action: 'buy' | 'hold' | 'sell'
  confidence: number
  rationale: string
  target_price?: number
  dna_alignment_score: number
  created_at: string
  expires_at: string
}

export interface MarketMetrics {
  sp500_price: number
  sp500_change: number
  nasdaq_price: number
  nasdaq_change: number
  djia_price: number
  djia_change: number
  vix: number
  crude_oil: number
  gold: number
  us_10y_yield: number
  last_updated: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  ticker: string
  name: string
  current_price: number
  added_at: string
  alert_price?: number
  alert_type?: 'above' | 'below'
}

export interface PerformanceMetric {
  date: string
  portfolio_value: number
  sp500_value: number
  cagr: number
  sharpe_ratio: number
  max_drawdown: number
  volatility: number
}

export interface ServiceResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}
