
/*
  # Investor Intelligence OS - Core Schema

  1. Tables
    - profiles: User profile data, investor DNA results, subscription status
    - dna_assessments: Full results of investor DNA quiz
    - portfolios: Named portfolios per user
    - holdings: Individual holdings within portfolios
    - watchlists: User watchlists
    - watchlist_items: Tickers in a watchlist
    - saved_reports: User-saved stock/fund analysis reports
    - goal_plans: Life goal planner entries
    - badges: Gamification badge definitions
    - user_badges: Badges earned by users

  2. Security
    - RLS enabled on all tables
    - All policies scoped to authenticated users via auth.uid()
*/

-- profiles
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  subscription_tier text NOT NULL DEFAULT 'free',
  subscription_status text NOT NULL DEFAULT 'inactive',
  stripe_customer_id text,
  stripe_subscription_id text,
  access_code_used text,
  investor_score integer DEFAULT 0,
  portfolio_health_score integer DEFAULT 0,
  risk_management_score integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- dna_assessments
CREATE TABLE IF NOT EXISTS dna_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  emotional_profile text,
  wealth_style text,
  time_horizon text,
  knowledge_level text,
  time_commitment text,
  volatility_tolerance text,
  drawdown_tolerance integer DEFAULT 0,
  liquidity_requirement text,
  sector_interests text[] DEFAULT '{}',
  risk_score integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE dna_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own assessments"
  ON dna_assessments FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assessments"
  ON dna_assessments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON dna_assessments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- portfolios
CREATE TABLE IF NOT EXISTS portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Portfolio',
  description text,
  currency text NOT NULL DEFAULT 'USD',
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own portfolios"
  ON portfolios FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolios"
  ON portfolios FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolios"
  ON portfolios FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolios"
  ON portfolios FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- holdings
CREATE TABLE IF NOT EXISTS holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  name text,
  asset_type text NOT NULL DEFAULT 'stock',
  shares numeric NOT NULL DEFAULT 0,
  cost_basis numeric NOT NULL DEFAULT 0,
  purchase_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE holdings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own holdings"
  ON holdings FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings"
  ON holdings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings"
  ON holdings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings"
  ON holdings FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- watchlists
CREATE TABLE IF NOT EXISTS watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'My Watchlist',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE watchlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own watchlists"
  ON watchlists FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlists"
  ON watchlists FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watchlists"
  ON watchlists FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlists"
  ON watchlists FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- watchlist_items
CREATE TABLE IF NOT EXISTS watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  name text,
  note text,
  added_at timestamptz DEFAULT now(),
  UNIQUE(watchlist_id, ticker)
);

ALTER TABLE watchlist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own watchlist items"
  ON watchlist_items FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist items"
  ON watchlist_items FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist items"
  ON watchlist_items FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- saved_reports
CREATE TABLE IF NOT EXISTS saved_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  report_type text NOT NULL DEFAULT 'stock',
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own saved reports"
  ON saved_reports FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved reports"
  ON saved_reports FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved reports"
  ON saved_reports FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- goal_plans
CREATE TABLE IF NOT EXISTS goal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Retirement',
  goal_type text NOT NULL DEFAULT 'retirement',
  target_amount numeric,
  current_savings numeric DEFAULT 0,
  monthly_contribution numeric DEFAULT 0,
  current_age integer,
  target_age integer,
  expected_return numeric DEFAULT 0.07,
  success_probability numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE goal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own goal plans"
  ON goal_plans FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal plans"
  ON goal_plans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goal plans"
  ON goal_plans FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goal plans"
  ON goal_plans FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- badges
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  icon text,
  category text NOT NULL DEFAULT 'education',
  tier text NOT NULL DEFAULT 'bronze'
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read badges"
  ON badges FOR SELECT TO authenticated
  USING (true);

-- user_badges
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own badges"
  ON user_badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own badges"
  ON user_badges FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Seed badges
INSERT INTO badges (slug, name, description, icon, category, tier) VALUES
  ('dna_complete', 'Investor DNA', 'Completed your investor DNA assessment', 'dna', 'onboarding', 'gold'),
  ('first_holding', 'First Investment', 'Added your first holding to a portfolio', 'briefcase', 'portfolio', 'bronze'),
  ('diversified', 'Diversified', 'Holding 5+ different sectors', 'pie-chart', 'portfolio', 'silver'),
  ('educator_1', 'Curious Mind', 'Completed first academy module', 'book-open', 'education', 'bronze'),
  ('educator_5', 'Scholar', 'Completed 5 academy modules', 'graduation-cap', 'education', 'silver'),
  ('long_holder', 'Diamond Hands', 'Held a position for 1+ year without panic selling', 'gem', 'discipline', 'gold'),
  ('watchlist_10', 'Researcher', 'Added 10 tickers to your watchlist', 'eye', 'research', 'bronze'),
  ('goal_planner', 'Goal Setter', 'Created your first life goal plan', 'target', 'planning', 'bronze')
ON CONFLICT (slug) DO NOTHING;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
