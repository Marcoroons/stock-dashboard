/*
  # Enhance DNA Schema for Phase 3 — Investor DNA 2.0

  1. Changes to dna_assessments
    - Add `primary_investment_archetype` — computed investment archetype ID
    - Add `primary_behavioral_archetype` — computed behavioral archetype ID
    - Add `primary_operational_archetype` — computed operational archetype ID
    - Add `investment_scores` — JSONB scores for all 5 investment archetypes
    - Add `behavioral_scores` — JSONB scores for all 4 behavioral archetypes
    - Add `operational_scores` — JSONB scores for all 3 operational archetypes
    - Add `personality_tags` — text array of computed personality tags

  2. New table: asset_compatibility_cache
    - Caches computed compatibility scores per user per asset
    - Avoids recomputing on every page load
    - Expires and refreshes when DNA changes

  3. Security
    - RLS enabled on new table
    - User can only see their own compatibility cache
*/

-- Extend dna_assessments with archetype columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'dna_assessments' AND column_name = 'primary_investment_archetype'
  ) THEN
    ALTER TABLE dna_assessments ADD COLUMN primary_investment_archetype text;
    ALTER TABLE dna_assessments ADD COLUMN primary_behavioral_archetype text;
    ALTER TABLE dna_assessments ADD COLUMN primary_operational_archetype text;
    ALTER TABLE dna_assessments ADD COLUMN investment_scores jsonb DEFAULT '{}'::jsonb;
    ALTER TABLE dna_assessments ADD COLUMN behavioral_scores jsonb DEFAULT '{}'::jsonb;
    ALTER TABLE dna_assessments ADD COLUMN operational_scores jsonb DEFAULT '{}'::jsonb;
    ALTER TABLE dna_assessments ADD COLUMN personality_tags text[] DEFAULT '{}'::text[];
  END IF;
END $$;

-- Create asset compatibility cache table
CREATE TABLE IF NOT EXISTS asset_compatibility_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ticker text NOT NULL,
  score integer NOT NULL,
  label text NOT NULL,
  reasons text[] DEFAULT '{}'::text[],
  warnings text[] DEFAULT '{}'::text[],
  dna_version text,
  computed_at timestamptz DEFAULT now(),
  UNIQUE(user_id, ticker)
);

ALTER TABLE asset_compatibility_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own compatibility cache"
  ON asset_compatibility_cache FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own compatibility cache"
  ON asset_compatibility_cache FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own compatibility cache"
  ON asset_compatibility_cache FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own compatibility cache"
  ON asset_compatibility_cache FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_compatibility_user_id ON asset_compatibility_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_ticker ON asset_compatibility_cache(ticker);
CREATE INDEX IF NOT EXISTS idx_compatibility_score ON asset_compatibility_cache(score DESC);
