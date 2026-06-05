-- ─── Subscriptions ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id    text,
  stripe_subscription_id text UNIQUE,
  status                text NOT NULL DEFAULT 'inactive',
  tier                  text NOT NULL DEFAULT 'free',
  current_period_start  timestamptz,
  current_period_end    timestamptz,
  cancel_at_period_end  boolean NOT NULL DEFAULT false,
  canceled_at           timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_subscription" ON subscriptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_subscription" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_subscription" ON subscriptions FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "delete_own_subscription" ON subscriptions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── Access Codes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS access_codes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text UNIQUE NOT NULL,
  tier        text NOT NULL CHECK (tier IN ('plus', 'pro')),
  max_uses    int NOT NULL DEFAULT 1,
  used_count  int NOT NULL DEFAULT 0,
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read codes (to validate them)
CREATE POLICY "select_access_codes" ON access_codes FOR SELECT
  TO authenticated USING (true);

-- ─── Code Redemptions ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS code_redemptions (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  code_id      uuid NOT NULL REFERENCES access_codes(id),
  redeemed_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, code_id)
);

ALTER TABLE code_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_redemptions" ON code_redemptions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_redemptions" ON code_redemptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- ─── Seed access codes ────────────────────────────────────────────────────────
INSERT INTO access_codes (code, tier, max_uses, expires_at) VALUES
  ('EARLY2026',    'plus', 200, '2026-12-31 23:59:59+00'),
  ('PROEARLYBIRD', 'pro',  100, '2026-12-31 23:59:59+00'),
  ('FOUNDER50',    'pro',   50, NULL),
  ('PLUSFREE',     'plus', 500, '2026-09-30 23:59:59+00')
ON CONFLICT (code) DO NOTHING;

-- ─── Redeem access code RPC ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION redeem_access_code(input_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_rec    access_codes%ROWTYPE;
  already_used boolean;
BEGIN
  -- Normalise to uppercase
  input_code := UPPER(TRIM(input_code));

  -- Find valid, non-expired, not-exhausted code
  SELECT * INTO code_rec
  FROM access_codes
  WHERE code = input_code
    AND (expires_at IS NULL OR expires_at > now())
    AND used_count < max_uses;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired access code');
  END IF;

  -- Check duplicate redemption
  SELECT EXISTS (
    SELECT 1 FROM code_redemptions
    WHERE user_id = auth.uid() AND code_id = code_rec.id
  ) INTO already_used;

  IF already_used THEN
    RETURN jsonb_build_object('success', false, 'error', 'You have already redeemed this code');
  END IF;

  -- Record redemption
  INSERT INTO code_redemptions (user_id, code_id)
  VALUES (auth.uid(), code_rec.id);

  UPDATE access_codes
  SET used_count = used_count + 1
  WHERE id = code_rec.id;

  -- Upgrade profile tier (only upgrade, never downgrade)
  UPDATE profiles
  SET
    subscription_tier   = CASE
      WHEN subscription_tier = 'pro' THEN 'pro'
      WHEN subscription_tier = 'plus' AND code_rec.tier = 'pro' THEN 'pro'
      ELSE code_rec.tier
    END,
    access_code_used    = input_code,
    subscription_status = 'active',
    updated_at          = now()
  WHERE id = auth.uid();

  RETURN jsonb_build_object('success', true, 'tier', code_rec.tier);
END;
$$;
