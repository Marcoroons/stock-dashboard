-- ─── Market data cache ───────────────────────────────────────────────────────
-- Stores Finnhub API responses server-side to avoid rate limits and
-- to serve stale data gracefully when the API is temporarily unavailable.

CREATE TABLE IF NOT EXISTS market_data_cache (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key  text UNIQUE NOT NULL,   -- e.g. "quote:AAPL", "analysis:MSFT"
  data       jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index for fast key lookups
CREATE INDEX IF NOT EXISTS idx_market_data_cache_key ON market_data_cache (cache_key);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_expires ON market_data_cache (expires_at);

ALTER TABLE market_data_cache ENABLE ROW LEVEL SECURITY;

-- Cache is read-only for authenticated users (written by edge functions via service role)
CREATE POLICY "select_market_cache" ON market_data_cache FOR SELECT
  TO authenticated USING (true);

-- Function to purge expired cache entries (can be called from a cron or manually)
CREATE OR REPLACE FUNCTION purge_expired_market_cache()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM market_data_cache WHERE expires_at < now();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;
