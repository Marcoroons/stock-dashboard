CREATE TABLE financial_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL CHECK (type IN ('retirement', 'house', 'education', 'fire', 'business', 'custom')),
  label text NOT NULL,
  target_amount numeric NOT NULL CHECK (target_amount > 0),
  current_amount numeric NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  monthly_contribution numeric NOT NULL DEFAULT 0 CHECK (monthly_contribution >= 0),
  target_date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_goals" ON financial_goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "insert_own_goals" ON financial_goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_goals" ON financial_goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "delete_own_goals" ON financial_goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX financial_goals_user_id_idx ON financial_goals(user_id);
