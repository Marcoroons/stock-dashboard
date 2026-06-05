# Feature Matrix

**Application:** Investor OS — DNA-Powered Investment Platform
**Last updated:** 2026-06-05
**Legend:** ✅ Complete · ⚠️ Partial (UI only / mock data) · ❌ Not implemented

---

## Subscription Tiers

| Tier | Price | Early Bird | Original Price |
|---|---|---|---|
| Free | $0 | — | — |
| Plus | $5/mo | Yes (locked for life) | $12/mo |
| Pro | $15/mo | Yes (locked for life) | $29/mo |

---

## Phase 1 — Auth & Onboarding

| Feature | Status | Notes |
|---|---|---|
| Email / password sign-up | ✅ | AuthPage + Supabase Auth |
| Email / password sign-in | ✅ | |
| Session persistence across reloads | ✅ | `getSession()` on mount |
| Profile row auto-created on sign-up | ✅ | DB trigger on `auth.users` |
| Auth loading state | ✅ | `LoadingSpinner` |
| Sign out | ✅ | Sidebar footer |
| Investor DNA questionnaire (9 steps) | ✅ | `OnboardingPage` |
| Animated step transitions | ✅ | Framer Motion slide |
| DNA score computation on submit | ✅ | `dna-engine.ts` |
| Assessment persisted to `dna_assessments` | ✅ | With RLS |
| Gate: redirect to onboarding if no DNA | ✅ | `AppRoutes` |
| Re-assess DNA (edit existing profile) | ❌ | No route back to onboarding |
| `onboarding_completed` analytics event | ✅ | |

---

## Phase 2 — Dashboard

| Feature | Status | Notes |
|---|---|---|
| Portfolio summary metrics (value, gain, day P&L) | ⚠️ | Mock data only |
| Performance area chart | ⚠️ | Mock data |
| Sector allocation pie chart | ⚠️ | Mock data |
| Holdings table with P&L | ⚠️ | Mock data |
| Watchlist widget | ⚠️ | Mock tickers |
| News feed widget | ⚠️ | Mock articles |
| DNA archetype card | ✅ | Reads real `dna_assessments` |
| Quick-action links (Doctor, Discover, Goals) | ✅ | |
| Live portfolio value from real prices | ❌ | `holdings` table not wired to UI |
| Watchlist persistence | ❌ | `watchlist_items` table exists, unused |

---

## Phase 3 — Portfolio Management

| Feature | Status | Notes |
|---|---|---|
| Holdings list with gain/loss | ⚠️ | Mock data |
| Add holding form (UI) | ⚠️ | UI exists, no Supabase write |
| Holdings persistence to DB | ❌ | `holdings` table exists, unused |
| Live quotes merged into holdings | ⚠️ | `fetchBulkQuotes()` called but over mock data |
| Sector allocation chart | ⚠️ | Mock |
| Edit / delete holding | ❌ | Not implemented |
| Multiple named portfolios | ❌ | `portfolios` table exists, unused |

---

## Phase 4 — Stock Analyzer

| Feature | Status | Notes |
|---|---|---|
| Ticker search | ✅ | Finnhub live search |
| Live quote (price, change, market cap) | ✅ | Finnhub via Edge Function |
| Company profile (logo, sector, exchange) | ✅ | Finnhub |
| Financial metrics (P/E, ROE, margins, etc.) | ✅ | Finnhub |
| Analyst recommendation consensus bar | ✅ | Finnhub |
| Composite score (0–100) with 4 categories | ✅ | `computeScores()` |
| Bull case / bear case generation | ✅ | `generateBull()` / `generateBear()` |
| DNA compatibility rating | ✅ | `discovery-engine.ts` |
| 4-tab breakdown (Overview / Quality / Valuation / Technicals) | ✅ | |
| Mock fallback for AAPL / MSFT | ✅ | When Finnhub key absent |
| Historical price chart | ❌ | Not implemented |
| Free tier analysis limit (5/day) | ❌ | Logic defined, not enforced |

---

## Phase 5 — Investor DNA Profile

| Feature | Status | Notes |
|---|---|---|
| Primary investment archetype | ✅ | From `dna-engine.ts` |
| Primary behavioral archetype | ✅ | |
| Archetype strengths and blind spots | ✅ | From `archetypes.ts` |
| Risk profile ring + label | ✅ | |
| 8-factor DNA breakdown (score bars) | ✅ | |
| All 24 archetypes explorer grid | ✅ | Browsable |
| Asset class compatibility scores | ✅ | `mockCompatibilityScores()` |
| Risk timeline horizon chart | ✅ | |
| DNA edit / re-assess link | ❌ | Not implemented |

---

## Phase 6 — Portfolio Doctor (Plus)

| Feature | Status | Notes |
|---|---|---|
| Health score (0–100) | ✅ | `portfolio-doctor.ts` |
| 5-dimension scoring | ✅ | Concentration, Sectors, Risk, Income, Liquidity |
| Animated score ring | ✅ | SVG arc |
| Prescriptions with priority levels | ✅ | |
| Rebalancing target allocation display | ✅ | |
| Sector / geographic exposure charts | ✅ | |
| Feature gate (Plus required) | ✅ | `FeatureGate` component enforced |
| Works on real portfolio data | ❌ | Runs on `MOCK_HOLDINGS` |

---

## Phase 7 — Fund Analysis (Plus)

| Feature | Status | Notes |
|---|---|---|
| ETF comparison by category (6 categories) | ✅ | `fund-engine.ts` |
| 4 verdict dimensions (fees, diversification, performance, risk) | ✅ | |
| 10-year fee drag calculator | ✅ | |
| Provider comparison (Vanguard, Fidelity, iShares, Schwab) | ✅ | |
| Fund composite rating (0–100) | ✅ | |
| Feature gate (Plus required) | ⚠️ | Shown in sidebar, no `FeatureGate` on page |
| Live NAV / fund data | ❌ | All static |

---

## Phase 8 — News Intelligence (Plus)

| Feature | Status | Notes |
|---|---|---|
| Sentiment-tagged news feed | ✅ | Mock + live Finnhub |
| Portfolio exposure tagging | ✅ | `affectsPortfolio` flag |
| Sentiment filter tabs (bullish / neutral / bearish) | ✅ | |
| Importance score display | ✅ | |
| "Why it matters" insight | ✅ | |
| Actionable insight per article | ✅ | |
| Live Finnhub general news | ✅ | `fetchMarketNews()` |
| Live company-specific news | ✅ | `fetchCompanyNews()` |
| Feature gate (Plus required) | ⚠️ | Listed as Plus in sidebar, no `FeatureGate` on page |

---

## Phase 9 — Investment Discovery (Plus)

| Feature | Status | Notes |
|---|---|---|
| For You tab — DNA-matched scoring | ✅ | 29-stock universe |
| DNA compatibility bar (5-factor) | ✅ | |
| Factor score breakdown per card | ✅ | Expandable |
| Stock / ETF filter + 4 sort modes | ✅ | |
| Lazy-load pagination | ✅ | |
| Portfolio Builder — 3 complexity levels | ✅ | starter / growth / advanced |
| Core + Satellite allocation display | ✅ | |
| ETF slot comparisons (4 providers) | ✅ | Accordion |
| Explore Themes tab (10 themes) | ✅ | |
| Discover / Randomizer tab (6 templates) | ✅ | |
| Feature gate (Plus required) | ⚠️ | Sidebar only, no `FeatureGate` on page |

---

## Phase 10 — Wealth Planning & Goals (Plus)

| Feature | Status | Notes |
|---|---|---|
| Goal CRUD — 6 goal types | ✅ | Persisted to `financial_goals` |
| Add goal form | ✅ | |
| Delete goal | ✅ | |
| Edit goal | ❌ | Update flow not implemented |
| 3-scenario projection (5 / 8 / 11%) | ✅ | `wealth-engine.ts` |
| Monte Carlo probability (300 sims) | ✅ | Box-Muller |
| Gap analysis + required PMT | ✅ | |
| Projection area chart | ✅ | 3 gradient bands + target line |
| Wealth Score (0–100) | ✅ | |
| Milestone badges (25 / 50 / 75 / 100%) | ✅ | |
| Retirement Planner (4% rule) | ✅ | Slider-driven |
| FIRE Calculator | ✅ | Years-to-FI |
| What-If Scenario Simulator | ✅ | 3 sliders + baseline delta |
| `goal_created` analytics event | ✅ | |
| Feature gate (Plus required) | ⚠️ | Listed Plus in sidebar, no `FeatureGate` on page |

---

## Phase 11 — Smart Alerts (Pro)

| Feature | Status | Notes |
|---|---|---|
| Alert generation engine | ✅ | `alert-engine.ts` |
| Alert types: portfolio / opportunity / news / goal | ✅ | |
| Importance scoring | ✅ | |
| Unread count badge in sidebar + topbar | ✅ | |
| Mark read / mark all read | ✅ | `AlertsContext` |
| Dismiss alert | ✅ | |
| Filter by type | ✅ | |
| Persistence to `portfolio_alerts` | ✅ | Supabase with RLS |
| Feature gate (Pro required) | ✅ | `FeatureGate` enforced |

---

## Phase 12 — Stress Testing (Pro)

| Feature | Status | Notes |
|---|---|---|
| 9 institutional scenarios | ✅ | `stress-engine.ts` |
| Historical scenarios (2008 Crisis, Dot-com, COVID, 1970s Stagflation) | ✅ | |
| Macro shock scenarios (Rate Shock, USD Collapse, Recession) | ✅ | |
| Sector shock scenarios (Tech Crash, ESG Transition) | ✅ | |
| Holdings impact table | ✅ | Per-position drawdown |
| Portfolio drawdown % + recovery months | ✅ | |
| Severity classification | ✅ | `getSeverityLevel()` |
| Feature gate (Pro required) | ✅ | `FeatureGate` enforced |
| Runs on real holdings | ❌ | Uses `MOCK_HOLDINGS` |

---

## Phase 13 — Monetization (Stripe)

| Feature | Status | Notes |
|---|---|---|
| Pricing page | ✅ | `/pricing` — 3 plans, FAQ, feature table |
| Access code redemption (UI + RPC) | ✅ | `redeem_access_code()` Supabase function |
| Seeded access codes | ✅ | EARLY2026, PROEARLYBIRD, FOUNDER50, PLUSFREE |
| Upgrade modal (contextual, per feature) | ✅ | `UpgradeModal` component |
| `FeatureGate` component | ✅ | Blurred preview + lock overlay |
| `create-checkout-session` Edge Function | ✅ | Creates Stripe checkout |
| `stripe-webhook` Edge Function | ✅ | Syncs subscription events to DB |
| Stripe customer creation | ✅ | First checkout creates customer record |
| Tier downgrade on cancellation | ✅ | Webhook resets to `free` |
| `allow_promotion_codes` on checkout | ✅ | |
| Stripe secrets configured | ⚠️ | Must be added via Bolt UI: `STRIPE_SECRET_KEY`, `STRIPE_PLUS_PRICE_ID`, `STRIPE_PRO_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` |
| Customer portal (manage subscription) | ❌ | Not implemented |

---

## Phase 14 — Live Market Data (Finnhub)

| Feature | Status | Notes |
|---|---|---|
| `market-data` Edge Function | ✅ | Finnhub proxy with Supabase cache |
| Quote endpoint | ✅ | 5-min TTL |
| Company profile endpoint | ✅ | 24-h TTL |
| Financial metrics endpoint | ✅ | 1-h TTL |
| Company news endpoint | ✅ | 30-min TTL |
| Market news endpoint | ✅ | 15-min TTL |
| Analyst recommendations endpoint | ✅ | 1-h TTL |
| Combined analysis endpoint (parallel 4-fetch) | ✅ | |
| Bulk quotes endpoint | ✅ | |
| Mock fallback when key absent | ✅ | Returns `{ mock: true }`, frontend degrades gracefully |
| `market_data_cache` table + purge function | ✅ | |
| `FINNHUB_API_KEY` configured | ⚠️ | Must be added via Bolt UI |

---

## Phase 15 — Admin & Product Analytics

| Feature | Status | Notes |
|---|---|---|
| `analytics_events` table | ✅ | With RLS + indexes |
| `is_admin` flag on profiles | ✅ | `boolean`, default false |
| `is_admin()` SECURITY DEFINER function | ✅ | Used in RLS policies |
| Fire-and-forget `track()` utility | ✅ | `lib/analytics.ts` |
| `setAnalyticsUserId()` on auth change | ✅ | `AuthContext` |
| Automatic `page_viewed` events | ✅ | `PageTracker` in `AppLayout` |
| `feature_gate_hit` events | ✅ | `SubscriptionContext` |
| `onboarding_completed` event | ✅ | `OnboardingPage` |
| `goal_created` event | ✅ | `GoalsPage` |
| Admin panel at `/admin` | ✅ | Redirects non-admins |
| Admin: Overview (KPIs + charts) | ✅ | Total users, paying, MRR, conversion, signup trend, feature usage |
| Admin: Users table (searchable) | ✅ | Tier badges, admin flags, join date |
| Admin: Subscriptions table | ✅ | Status, renewal dates |
| Admin: Access Codes (view + create) | ✅ | Toggle active/inactive |
| Admin: Analytics (event counts, DAU, event stream) | ✅ | |
| Admin link in sidebar (admin only) | ✅ | Red `ShieldAlert` icon |
| Grant admin via SQL | ✅ | `UPDATE profiles SET is_admin = true WHERE email = '...'` |

---

## Pending / Not Yet Built

| Feature | Priority | Notes |
|---|---|---|
| Real holdings persistence | High | `holdings` table exists, UI form exists — needs Supabase write |
| Customer portal (manage subscription) | High | Stripe billing portal for cancellations/upgrades |
| DNA re-assessment | Medium | Link from `/dna` back to onboarding |
| Edit goal | Medium | Update flow for existing goals |
| Watchlist persistence | Medium | `watchlist_items` table exists |
| InsiderActivity page | Medium | Sidebar link `/insider` has no route/component |
| Free-tier analysis rate limit (5/day) | Low | Logic in `subscription.ts`, not enforced in UI |
| Fund / News / Opportunities / Goals feature gates | Low | Plus-tier pages visible without gate component |
| Academy completion persistence | Low | |
| Search (AppLayout topbar) | Low | Input exists, no handler |
| Dashboard live prices | Low | Depends on holdings persistence |
