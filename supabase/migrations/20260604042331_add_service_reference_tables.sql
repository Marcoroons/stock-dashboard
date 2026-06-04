/*
  # Add Reference and Service Tables for Phase 2

  1. New Tables
    - `stocks` - Stock reference data (public)
    - `etfs` - ETF reference data (public)
    - `etf_holdings` - ETF composition (public)
    - `news` - Financial news articles (public read)
    - `recommendations` - AI-powered recommendations (user-specific)
    - `preferences` - User preferences
    - `investor_dna` - Investor DNA assessment (already exists as dna_assessments)

  2. Security
    - Enable RLS on all new tables
    - Add policies for user data isolation
    - Public read for reference data

  3. Indexes
    - Add indexes for frequently queried columns
*/

-- Create stocks table (reference data - public read)
CREATE TABLE IF NOT EXISTS stocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  name text NOT NULL,
  sector text,
  industry text,
  market_cap numeric,
  pe_ratio numeric,
  dividend_yield numeric,
  current_price numeric DEFAULT 0,
  price_52w_high numeric,
  price_52w_low numeric,
  beta numeric,
  eps numeric,
  revenue_ttm numeric,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE stocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view stocks"
  ON stocks FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_stocks_ticker ON stocks(ticker);
CREATE INDEX IF NOT EXISTS idx_stocks_sector ON stocks(sector);
CREATE INDEX IF NOT EXISTS idx_stocks_market_cap ON stocks(market_cap DESC);

-- Create ETFs table (reference data - public read)
CREATE TABLE IF NOT EXISTS etfs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text UNIQUE NOT NULL,
  name text NOT NULL,
  category text,
  net_assets numeric,
  expense_ratio numeric,
  shares_outstanding numeric,
  current_price numeric DEFAULT 0,
  ytd_return numeric,
  three_year_return numeric,
  inception_date date,
  last_updated timestamptz DEFAULT now()
);

ALTER TABLE etfs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ETFs"
  ON etfs FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_etfs_ticker ON etfs(ticker);
CREATE INDEX IF NOT EXISTS idx_etfs_category ON etfs(category);
CREATE INDEX IF NOT EXISTS idx_etfs_expense_ratio ON etfs(expense_ratio);

-- Create ETF holdings table
CREATE TABLE IF NOT EXISTS etf_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  etf_ticker text NOT NULL REFERENCES etfs(ticker),
  holding_ticker text NOT NULL,
  holding_name text,
  weight numeric NOT NULL,
  shares numeric
);

ALTER TABLE etf_holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view ETF holdings"
  ON etf_holdings FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_etf_holdings_etf_ticker ON etf_holdings(etf_ticker);
CREATE INDEX IF NOT EXISTS idx_etf_holdings_weight ON etf_holdings(weight DESC);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker text NOT NULL,
  headline text NOT NULL,
  summary text,
  source text,
  url text UNIQUE,
  sentiment text CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  relevance_score numeric DEFAULT 0.5,
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE news ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view news"
  ON news FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Service role can insert news"
  ON news FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_news_ticker ON news(ticker);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment ON news(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_relevance ON news(relevance_score DESC);

-- Create recommendations table
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  action text NOT NULL CHECK (action IN ('buy', 'hold', 'sell')),
  confidence numeric NOT NULL,
  rationale text,
  target_price numeric,
  dna_alignment_score numeric DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create recommendations"
  ON recommendations FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_recommendations_user_id ON recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_expires_at ON recommendations(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_action ON recommendations(action);

-- Create preferences table
CREATE TABLE IF NOT EXISTS preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  theme text DEFAULT 'dark',
  notifications_enabled boolean DEFAULT true,
  email_alerts boolean DEFAULT true,
  price_alerts boolean DEFAULT true,
  watchlist_alerts boolean DEFAULT true,
  news_digest_frequency text DEFAULT 'daily',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON preferences FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON preferences FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create preferences"
  ON preferences FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create investor_dna table if it doesn't exist (may be named differently)
CREATE TABLE IF NOT EXISTS investor_dna (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  emotional_profile text NOT NULL,
  wealth_style text NOT NULL,
  time_horizon text NOT NULL,
  knowledge_level text NOT NULL,
  risk_tolerance text NOT NULL,
  investment_focus text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE investor_dna ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own DNA"
  ON investor_dna FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own DNA"
  ON investor_dna FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can create DNA"
  ON investor_dna FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
