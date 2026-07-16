-- ─── Shared market-data quote cache ──────────────────────────────────────────
-- One row per ticker, refreshed by the refresh-quotes edge function (cron).
-- The app reads prices from here instead of calling Finnhub per page load, so
-- one Finnhub call per unique ticker per cycle serves all users.

CREATE TABLE IF NOT EXISTS quotes (
  ticker          text PRIMARY KEY,
  price           numeric NOT NULL DEFAULT 0,
  change          numeric NOT NULL DEFAULT 0,
  percent_change  numeric NOT NULL DEFAULT 0,
  prev_close      numeric NOT NULL DEFAULT 0,
  currency        text    NOT NULL DEFAULT 'USD',
  updated_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Shared, non-sensitive market data: any authenticated user may read.
CREATE POLICY "select_quotes" ON quotes FOR SELECT
  TO authenticated USING (true);

-- No INSERT / UPDATE / DELETE policies on purpose: writes happen only through
-- the service role (the refresh-quotes edge function), which bypasses RLS.
