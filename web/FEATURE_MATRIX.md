# Feature Matrix
**Application:** DNA-Powered Investment Platform  
**Date:** 2026-06-05  
**Legend:** ✅ Complete · ⚠️ Partial · ❌ Missing · 🔒 Gated (not enforced)

---

## Phase 1 — Foundation & Auth

| Feature | Status | Notes |
|---------|--------|-------|
| Email/password sign-up | ✅ | AuthPage + Supabase auth |
| Email/password sign-in | ✅ | AuthPage |
| Session persistence | ✅ | getSession on mount |
| Profile creation trigger | ✅ | DB trigger on auth.users insert |
| Auth loading state | ✅ | LoadingSpinner while fetching |
| Sign out | ✅ | AppLayout header button |
| Error display on auth failure | ✅ | Inline error messages |

---

## Phase 2 — Investor DNA Assessment (Onboarding)

| Feature | Status | Notes |
|---------|--------|-------|
| Multi-step questionnaire (9 steps) | ✅ | OnboardingPage |
| Animated step transitions | ✅ | Framer Motion |
| Progress indicator | ✅ | Step counter + progress bar |
| DNA score computation | ✅ | dna-engine.ts |
| Emotional profile classification | ✅ | 4 profiles |
| Wealth style classification | ✅ | 4 styles |
| Risk score (0–100) | ✅ | Composite formula |
| Assessment persistence to Supabase | ✅ | dna_assessments table + RLS |
| Re-assessment (update existing) | ✅ | UPSERT pattern |
| Redirect after onboarding | ✅ | Navigate to /dashboard |

---

## Phase 3 — Dashboard

| Feature | Status | Notes |
|---------|--------|-------|
| Portfolio summary metrics | ✅ | Mock data |
| Performance chart (area) | ✅ | Recharts AreaChart |
| Sector allocation donut | ✅ | Recharts PieChart |
| Holdings table | ✅ | With P&L colors |
| Watchlist widget | ✅ | Mock tickers |
| News feed widget | ✅ | Mock articles with sentiment |
| DNA archetype card | ✅ | Uses dna-engine via toDnaInput |
| Quick-action links | ✅ | To Doctor, Opportunities, Goals |
| Live portfolio data | ❌ | All mock — no real prices |
| Real watchlist persistence | ❌ | watchlist_items table exists but unused |

---

## Phase 4 — Investor DNA Profile Page

| Feature | Status | Notes |
|---------|--------|-------|
| Primary archetype display | ✅ | Investment + Behavioral |
| Archetype strengths/blind spots | ✅ | From archetypes.ts |
| Risk profile visualization | ✅ | ScoreRing + color coding |
| 8-factor DNA breakdown | ✅ | Radar-style score bars |
| Behavioral archetypes grid | ✅ | All 24 archetypes browsable |
| Compatible stock styles | ✅ | mockCompatibilityScores |
| Risk timeline chart | ✅ | Horizon projections |
| DNA edit / re-assess | ❌ | No link back to onboarding |

---

## Phase 5 — Portfolio Management

| Feature | Status | Notes |
|---------|--------|-------|
| Holdings list with metrics | ✅ | Mock holdings |
| Sector allocation chart | ✅ | Pie chart |
| Gain/loss per position | ✅ | Calculated from cost basis |
| Stress test scenarios | ✅ | 5 historical scenarios (mock) |
| Add holding form | ⚠️ | UI exists but no Supabase write |
| Real holdings persistence | ❌ | holdings table exists but unused |
| Delete / edit holdings | ❌ | Not implemented |
| Benchmark comparison | ⚠️ | Chart shows portfolio only |

---

## Phase 5b — Stock Analyzer

| Feature | Status | Notes |
|---------|--------|-------|
| Ticker search | ✅ | Searches STOCK_MOCK keys |
| Fundamental metrics | ✅ | P/E, PEG, ROE, margin, etc. |
| Bull/bear case display | ✅ | Collapsible sections |
| Score visualization | ✅ | ScoreRing |
| DNA compatibility rating | ✅ | Calls discovery-engine |
| Real-time prices | ❌ | Static mock prices |
| Historical chart | ❌ | Not implemented |
| MSFT / AAPL only | ⚠️ | STOCK_MOCK has 2 entries |

---

## Phase 6 — Portfolio Doctor

| Feature | Status | Notes |
|---------|--------|-------|
| Health score (0–100) | ✅ | portfolio-doctor.ts |
| 5-dimension scoring | ✅ | Concentration/Sectors/Risk/Income/Liquidity |
| Score ring visualization | ✅ | Animated SVG arc |
| Specific recommendations | ✅ | Action items with priority |
| Stress test projections | ✅ | 5 scenarios with drawdown % |
| Rebalancing suggestions | ✅ | Target allocation display |
| Historical health trend | ⚠️ | Single score, no time series |
| Subscription gate (Plus) | 🔒 | Premium badge shown, not enforced |

---

## Phase 6b — Fund Analysis

| Feature | Status | Notes |
|---------|--------|-------|
| ETF comparison by category | ✅ | fund-engine.ts, 6 categories |
| Cost calculator (10yr fee impact) | ✅ | fee drag formula |
| Fund rating (0–100) | ✅ | Composite score |
| Provider comparison | ✅ | Vanguard vs Fidelity vs iShares vs Schwab |
| Risk-adjusted return metrics | ✅ | Sharpe, Sortino estimates |
| Smart diversification score | ✅ | Overlap + concentration analysis |
| Live NAV / fund data | ❌ | All static |
| Subscription gate (Plus) | 🔒 | Shown but not enforced |

---

## Phase 6c — News Intelligence

| Feature | Status | Notes |
|---------|--------|-------|
| News feed with sentiment | ✅ | 16 mock articles |
| Portfolio exposure tagging | ✅ | affectsPortfolio flag |
| Sentiment filter (bullish/neutral/bearish) | ✅ | Tab filters |
| Importance score | ✅ | 1–10 display |
| Why-it-matters insight | ✅ | Per article |
| Actionable insight | ✅ | Per article |
| Time horizon impact badge | ✅ | short/medium/long |
| Live news feed | ❌ | All mock |
| Subscription gate (Plus) | 🔒 | Shown but not enforced |

---

## Phase 7 — Investment Discovery

| Feature | Status | Notes |
|---------|--------|-------|
| For You tab — personalized scoring | ✅ | 29-investment universe |
| DNA compatibility bar | ✅ | 5-factor score |
| Factor breakdown (6 scores) | ✅ | Expandable per card |
| Stock/ETF filter | ✅ | Toggle buttons |
| Sort by composite/DNA/fundamentals | ✅ | 4 sort modes |
| Lazy-load pagination | ✅ | Show more |
| Portfolio Builder tab | ✅ | 3 levels: starter/growth/advanced |
| Core + Satellite display | ✅ | With allocation % |
| ETF Slot comparisons | ✅ | Accordion with 4 providers |
| Explore Themes tab | ✅ | 10 themes |
| Discover / Randomizer tab | ✅ | 6 templates + risk filter |
| Subscription gate (Plus) | 🔒 | Shown but not enforced |

---

## Phase 8 — Wealth Planning & Goals

| Feature | Status | Notes |
|---------|--------|-------|
| Goal CRUD (6 goal types) | ✅ | Supabase financial_goals table |
| 3-scenario projection (5/8/11%) | ✅ | wealth-engine.ts |
| Monte Carlo probability (300 runs) | ✅ | Box-Muller transform |
| Gap analysis + required PMT | ✅ | Solved algebraically |
| Projection chart (Recharts area) | ✅ | 3 gradient bands + target line |
| Wealth Score (0–100) | ✅ | Composite formula |
| Milestone badges (25/50/75/100%) | ✅ | Overview tab |
| Retirement planner (4% rule) | ✅ | RetirementTab sliders |
| FIRE calculator | ✅ | FireResult with years-to-FI |
| Scenario simulator (What-If) | ✅ | 3 sliders + baseline comparison |
| Goal status classification | ✅ | 5-tier status with colors |
| Empty state + add prompt | ✅ | When no goals exist |
| Delete goal | ✅ | With Supabase delete |
| Edit goal | ❌ | Update not implemented |
| Subscription gate (Pro) | 🔒 | Shown but not enforced |

---

## Cross-Cutting Features

| Feature | Status | Notes |
|---------|--------|-------|
| Responsive layout (mobile/tablet/desktop) | ✅ | Sidebar collapses on mobile |
| Dark theme | ✅ | Consistent #09090f base |
| Toast notifications | ✅ | NotificationProvider |
| Modal system | ✅ | ModalProvider |
| Loading skeletons | ✅ | Skeleton + LoadingSpinner |
| Empty states | ✅ | EmptyState component |
| Premium gates UI | ✅ | PremiumGate component |
| Premium gates enforcement | ❌ | getTierAccess() not consumed |
| Search (AppLayout) | ❌ | Input present, no behavior |
| Academy module completion | ❌ | Hardcoded, no persistence |
| Settings — upgrade buttons | ❌ | Visual only, no Stripe |
| Goal edit flow | ❌ | Add exists, edit missing |
| DNA re-assessment | ❌ | No route back to onboarding |
| Real portfolio data | ❌ | All mock prices |
| Watchlist persistence | ❌ | Table exists, unused |
| Holdings persistence | ❌ | Table exists, unused |

---

## Summary Counts

| Category | Count |
|----------|-------|
| Complete features | 74 |
| Partial features | 5 |
| Missing / not implemented | 12 |
| Premium-gated but not enforced | 6 |
| **Total tracked** | **97** |
