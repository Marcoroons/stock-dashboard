CREATE TABLE portfolio_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('portfolio', 'opportunity', 'news', 'goal')),
  priority text NOT NULL CHECK (priority IN ('critical', 'warning', 'info', 'positive')),
  title text NOT NULL,
  body text NOT NULL,
  meta jsonb NOT NULL DEFAULT '{}',
  read boolean NOT NULL DEFAULT false,
  dismissed boolean NOT NULL DEFAULT false,
  generated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE portfolio_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_alerts" ON portfolio_alerts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_alerts" ON portfolio_alerts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_alerts" ON portfolio_alerts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_alerts" ON portfolio_alerts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);
