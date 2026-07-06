-- Persist product-tour completion per account so it isn't shown again after a
-- user finishes it (survives new devices / cleared localStorage). ProductTour
-- already writes this column; App.tsx reads it via the profile row.
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS tour_completed boolean NOT NULL DEFAULT false;
