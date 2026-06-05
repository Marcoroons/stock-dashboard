# Locked Modules

This file identifies parts of the codebase that should not be modified without careful review. Each entry explains what it is, why it is sensitive, and what is safe to change vs. what is not.

---

## Database Migrations

**Path:** `supabase/migrations/`
**Risk:** Irreversible data loss

Migrations are append-only. Applied migrations **must never be edited or deleted**. Changes to existing schema must be made via new migrations.

| Migration | What it creates | Why it is locked |
|---|---|---|
| `20260604030705_investor_intelligence_schema.sql` | Core tables: profiles, dna_assessments, portfolios, holdings, watchlists, badges | Foundation — every other migration depends on this |
| `20260604042331_add_service_reference_tables.sql` | stocks, etfs, news, recommendations | Reference data tables |
| `20260604045533_enhance_dna_schema_phase3.sql` | DNA schema extensions | Extends dna_assessments columns |
| `20260605030237_add_financial_goals.sql` | financial_goals | Goal planner data |
| `20260605042520_add_portfolio_alerts.sql` | portfolio_alerts | Alerts system |
| `20260605071845_add_monetization_layer.sql` | subscriptions, access_codes, code_redemptions, `redeem_access_code()` RPC | Stripe integration + access code logic |
| `20260605074512_add_market_data_cache.sql` | market_data_cache | Finnhub cache |
| `20260605085315_add_admin_analytics.sql` | analytics_events, is_admin column, `is_admin()` function | Admin + analytics infrastructure |

**Rules:**
- Never use `DROP TABLE`, `DROP COLUMN`, or `ALTER COLUMN` to change a type — these destroy user data.
- Never rename tables or columns — foreign keys and RLS policies reference them by name.
- New columns must have a `DEFAULT` or be nullable so existing rows are not broken.
- All new tables must have `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and a full set of four policies (SELECT / INSERT / UPDATE / DELETE).

---

## Stripe Edge Functions

**Path:** `supabase/functions/create-checkout-session/index.ts`
**Path:** `supabase/functions/stripe-webhook/index.ts`
**Risk:** Broken checkout / missed subscription events

These functions handle real money. Modifications require:
1. Testing in Stripe's test mode before production.
2. Re-deploying via `mcp__supabase__deploy_edge_function` (not manual file edits — the deploy tool reads from disk and pushes).

**What is safe to change:**
- Adding metadata fields to the Stripe session.
- Extending webhook handling for new event types (e.g., `invoice.payment_failed`).
- Adjusting `allow_promotion_codes` or `billing_address_collection`.

**What must not change without care:**
- The `syncSubscription()` logic in the webhook — it sets `profiles.subscription_tier`. An off-by-one here silently gives wrong tier to all new subscribers.
- The `PRICE_IDS` mapping — the Pro vs Plus distinction controls what checkout session is created.
- Stripe signature verification in the webhook — removing it opens the endpoint to spoofed events.

**Required secrets** (must exist in Supabase Edge Function environment):
- `STRIPE_SECRET_KEY`
- `STRIPE_PLUS_PRICE_ID`
- `STRIPE_PRO_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

---

## Market Data Edge Function

**Path:** `supabase/functions/market-data/index.ts`
**Risk:** Finnhub rate limits, cache invalidation, data freshness

**What is safe to change:**
- Adding new `case` branches for new Finnhub endpoints.
- Adjusting TTL values in the `TTL` map.
- Adding new query parameters to existing endpoints.

**What must not change without care:**
- The `cached()` helper pattern — if bypassed, every request hits Finnhub directly and will exhaust the free-tier quota immediately.
- The cache `upsert` using `onConflict: "cache_key"` — changing this to `insert` will accumulate stale rows indefinitely.
- The 503 + `{ mock: true }` response when `FINNHUB_API_KEY` is absent — the frontend detects `mock: true` to trigger its fallback.

**Required secrets:**
- `FINNHUB_API_KEY`

---

## Authentication Context

**Path:** `web/src/context/AuthContext.tsx`
**Risk:** Silent auth loops, broken session state

This file is the single source of truth for the user session. Mishandling `onAuthStateChange` can create infinite re-render loops or inconsistent state between `user` and `profile`.

**What is safe to change:**
- Adding new fields fetched from `profiles` or `dna_assessments`.
- Adding `track()` calls for additional auth events.
- Extending `refreshProfile()`.

**What must not change without care:**
- The guard pattern: `getSession()` on mount + `onAuthStateChange` listener. Removing either breaks cold-start loading or tab-switch sync.
- `setLoading(false)` must be called in all branches of the initial `getSession()` — if missed, the app shows a spinner forever.
- `setAnalyticsUserId(null)` on sign-out — must always clear so events are not attributed to a stale user ID.

---

## Subscription Context

**Path:** `web/src/context/SubscriptionContext.tsx`
**Risk:** Incorrect feature access, broken upgrade flow

`getTierAccess(tier)` is the single gate for all feature checks. The `hasAccess(feature)` function it exposes is called by every `FeatureGate` component.

**What is safe to change:**
- Adding new features to `FeatureAccess` in `types/database.ts` (requires a matching entry in `getTierAccess()` and `FEATURE_TIERS`).
- Adjusting which tier a feature requires (edit both `getTierAccess()` and `FEATURE_TIERS` in `lib/subscription.ts`).

**What must not change without care:**
- `redeemCode()` calls `supabase.rpc('redeem_access_code', ...)` which is a SECURITY DEFINER function. The function validates limits and records redemptions atomically — do not replicate this logic in client-side JS.
- The `(supabase.rpc as any)` cast is intentional. Supabase's generated types do not include custom functions. Removing the cast causes a TypeScript error.
- The `isLoadingCheckout` flag controls the disabled state on the checkout button — it must be reset in the `finally` block.

---

## RLS Policies

**Context:** All Supabase tables
**Risk:** Data exposure or privilege escalation

Every table uses Row Level Security. The `is_admin()` function is SECURITY DEFINER — it bypasses RLS to read `profiles.is_admin`. This is intentional and correct; do not change it to `SECURITY INVOKER`.

**Rules:**
- Never write `USING (true)` — this makes a policy a no-op and exposes all rows to all users.
- Never use `current_user` in policies — use `auth.uid()`.
- Admin policies use `is_admin()` — adding a new admin-accessible table requires adding both a user-scoped and an admin-scoped SELECT policy.
- The `redeem_access_code()` RPC uses `SECURITY DEFINER` to increment `times_used` and insert into `code_redemptions`. This requires service-level access. Do not split this logic across client calls.

---

## `lib/subscription.ts`

**Path:** `web/src/lib/subscription.ts`
**Risk:** Inconsistent tier gates across the app

`FEATURE_TIERS`, `getTierAccess()`, and `PLANS` must stay in sync. If a feature is added to one but not the others, `FeatureGate` will silently default to the wrong tier.

**Checklist when adding a new gated feature:**
1. Add the feature key to `FeatureAccess` in `types/database.ts`.
2. Add an entry to `FEATURE_TIERS` with the required tier.
3. Add `feature: tier === '...'` in the `getTierAccess()` return.
4. Add a `FEATURE_LABELS` and `FEATURE_DESCRIPTIONS` entry.
5. Add the feature to the appropriate plan's `features` array in `PLANS`.
6. Wrap the page with `<FeatureGate feature="..." hasAccess={hasAccess('...')} onUpgrade={openUpgrade}>`.

---

## `data/mock.ts`

**Path:** `web/src/data/mock.ts`
**Risk:** Pages silently showing stale mock data

Mock data is used by Dashboard, PortfolioPage (holdings), StressTestPage, and PortfolioDoctorPage. These pages have not been connected to real Supabase data yet.

**Rules:**
- When a page is connected to real data, remove its imports from `mock.ts`.
- Do not add new mock data for features that should use real data — this creates a false impression that the feature is complete.
- `MOCK_HOLDINGS` is referenced by `stress-engine.ts` and `portfolio-doctor.ts`. When real holdings are wired up, these engine functions will need to accept a `holdings` parameter instead of importing the mock directly.

---

## Analytics (`lib/analytics.ts`)

**Path:** `web/src/lib/analytics.ts`
**Risk:** Events attributed to wrong user / session bleed

`_userId` is a module-level singleton. It must be set via `setAnalyticsUserId()` before any `track()` calls. `AuthContext` does this on every auth state change.

**Rules:**
- Never call `setAnalyticsUserId()` from anywhere other than `AuthContext`.
- `track()` silently no-ops when `_userId` is null — this is intentional for unauthenticated users (auth page, onboarding).
- Do not add `await` to `track()` calls — it is fire-and-forget by design. Adding `await` will block UI actions on database latency.
- Session ID resets to null on sign-out (via `setAnalyticsUserId(null)`). The next `track()` call after sign-in will generate a new session ID.
