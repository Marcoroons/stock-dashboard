-- Admin flag on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  event_name  text NOT NULL,
  properties  jsonb DEFAULT '{}'::jsonb,
  session_id  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx    ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS analytics_events_created_at_idx ON analytics_events(created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can insert their own events
CREATE POLICY "insert_own_events" ON analytics_events FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Users can read their own events
CREATE POLICY "select_own_events" ON analytics_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

-- Admins can read all events (service role bypasses RLS anyway)
-- SECURITY DEFINER helper so admin checks work without service role
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Admin policies on profiles
CREATE POLICY "admin_select_profiles" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id OR is_admin());

CREATE POLICY "admin_select_events" ON analytics_events FOR SELECT
  TO authenticated USING (auth.uid() = user_id OR is_admin());

-- Admin policies on subscriptions
CREATE POLICY "admin_select_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (
    auth.uid() = (SELECT id FROM profiles WHERE id = user_id) OR is_admin()
  );

-- Admin policies on access_codes
CREATE POLICY "admin_select_access_codes" ON access_codes FOR SELECT
  TO authenticated USING (is_admin());

CREATE POLICY "admin_insert_access_codes" ON access_codes FOR INSERT
  TO authenticated WITH CHECK (is_admin());

CREATE POLICY "admin_update_access_codes" ON access_codes FOR UPDATE
  TO authenticated USING (is_admin()) WITH CHECK (is_admin());
