# Architecture

## Overview

Investor OS is a React 19 single-page application backed by Supabase (PostgreSQL + Auth + Edge Functions) and Stripe for monetization. The frontend is bundled by Vite, styled with Tailwind CSS v4, and deployed as a static site. Live market data is proxied through a Supabase Edge Function that caches Finnhub responses in the database.

---

## Stack

| Layer | Technology |
|---|---|
| UI Framework | React 19 |
| Routing | React Router DOM 7 |
| Build Tool | Vite |
| Styling | Tailwind CSS v4 + inline CSS-in-JS for dynamic colors |
| Animation | Framer Motion 12 |
| Charts | Recharts 3 |
| Icons | Lucide React |
| Database / Auth | Supabase (PostgreSQL + Supabase Auth) |
| Edge Functions | Supabase Edge Functions (Deno runtime) |
| Payments | Stripe Checkout + Webhooks |
| Market Data | Finnhub (via Edge Function proxy) |

---

## Directory Structure

```
web/src/
├── App.tsx                  Route tree + provider composition
├── main.tsx                 Entry point
├── index.css                Global styles
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx    Shell: sidebar + topbar + <Outlet>
│   │   └── Sidebar.tsx      Navigation, tier badge, admin link
│   ├── dna/
│   │   └── DnaComponents.tsx  Archetype cards and DNA display
│   └── ui/                  Design-system components (see COMPONENT_REGISTRY.md)
├── context/
│   ├── AuthContext.tsx       User, session, profile, DNA state
│   ├── SubscriptionContext.tsx  Tier, feature gates, upgrade modals
│   └── AlertsContext.tsx    Smart alerts state + unread count
├── data/
│   └── mock.ts              Static mock data for un-connected pages
├── lib/
│   ├── supabase.ts          Supabase client singleton
│   ├── analytics.ts         Fire-and-forget event tracker
│   ├── subscription.ts      PLANS, FEATURE_TIERS, getTierAccess()
│   ├── market-data.ts       Finnhub API client + helpers
│   ├── archetypes.ts        12 investor archetype definitions
│   ├── dna-engine.ts        DNA profile computation
│   ├── fund-engine.ts       Fund analysis verdicts
│   ├── alert-engine.ts      Portfolio alert generation
│   ├── stress-engine.ts     9-scenario stress testing
│   ├── wealth-engine.ts     Goal projections, FIRE, retirement
│   ├── discovery-engine.ts  DNA-matched stock recommendations
│   ├── portfolio-doctor.ts  5-dimension portfolio health analysis
│   └── utils.ts             Formatting helpers, cn()
├── pages/
│   ├── admin/               Admin sub-page components
│   └── *.tsx                Route-level page components
├── theme/
│   ├── tokens.ts            Design tokens
│   └── variables.css        CSS custom properties
└── types/
    └── database.ts          TypeScript types for all DB rows
```

---

## Provider Composition

Providers are composed in `App.tsx`. The order is significant — inner providers can depend on outer ones.

```
BrowserRouter
└── AuthProvider                          reads Supabase session
    ├── NotificationProvider (Toast)
    ├── ModalProvider
    └── AppRoutes (conditional render)
        ├── AuthPage                       (no user)
        ├── OnboardingPage                 (user, no DNA)
        └── AlertsProvider                 (authenticated)
            └── SubscriptionProvider       (reads profile.subscription_tier)
                └── AppLayout
                    └── [Page Routes]
```

`SubscriptionProvider` must be inside `AuthProvider` because it reads `profile` from `useAuth()`.
`AlertsProvider` wraps `SubscriptionProvider` so alerts can be accessed from any page.

---

## Authentication Flow

1. `supabase.auth.getSession()` runs on mount in `AuthContext`.
2. `onAuthStateChange` listener keeps state in sync.
3. `setAnalyticsUserId()` is called on every auth state change.
4. If no authenticated user → `<AuthPage />` is rendered.
5. If user exists but has no DNA assessment → `<OnboardingPage />`.
6. After onboarding, `refreshDna()` resolves the gate and the app loads.

---

## Subscription Flow

```
User hits locked feature
  → FeatureGate renders lock overlay
  → onUpgrade(feature) calls SubscriptionContext.openUpgrade()
  → track('feature_gate_hit', ...) fires
  → UpgradeModal renders with plan details
  → User clicks CTA
  → create-checkout-session Edge Function creates Stripe session
  → User completes Stripe Checkout
  → stripe-webhook receives checkout.session.completed
  → profiles.subscription_tier updated in DB
  → SubscriptionContext re-reads profile on next auth refresh
```

Tier is stored on `profiles.subscription_tier` and read synchronously from `profile` in AuthContext. `getTierAccess(tier)` returns a `FeatureAccess` map; `hasAccess(feature)` returns a boolean.

---

## Market Data Flow

```
Page component
  → fetchStockAnalysis(symbol)          lib/market-data.ts
  → fetch('market-data' edge function)  with JWT
  → Edge Function checks market_data_cache table
  → Cache hit: return cached JSONB
  → Cache miss: fetch Finnhub API → store in cache → return
```

Cache TTLs: quotes 5 min, profiles 24 h, metrics 1 h, news 15–30 min.
If `FINNHUB_API_KEY` is not set, the Edge Function returns `{ error: "...", mock: true }` and the frontend falls back to static mock data for known tickers.

---

## Analytics Flow

`lib/analytics.ts` exposes two functions:

- `setAnalyticsUserId(id)` — called from AuthContext on session changes.
- `track(eventName, properties)` — inserts a row into `analytics_events` via the Supabase client. Fire-and-forget (errors silently dropped). No-ops if no user ID is set.

Automatic events: `page_viewed` (AppLayout PageTracker), `feature_gate_hit` (SubscriptionContext).
Manual events: `onboarding_completed` (OnboardingPage), `goal_created` (GoalsPage).

---

## Database Schema (summary)

| Table | Purpose |
|---|---|
| `profiles` | One row per user; stores tier, Stripe IDs, scores, is_admin |
| `dna_assessments` | Investor DNA quiz responses and computed profile |
| `portfolios` | Named portfolios per user |
| `holdings` | Individual positions within a portfolio |
| `financial_goals` | Retirement, FIRE, custom wealth goals |
| `portfolio_alerts` | Triggered alerts with type, importance, read state |
| `subscriptions` | Stripe subscription lifecycle records |
| `access_codes` | Promo codes for tier upgrades |
| `code_redemptions` | Audit trail of code uses |
| `market_data_cache` | Server-side cache for Finnhub responses |
| `analytics_events` | User event stream for product analytics |

All tables have RLS enabled. Users can only read/write their own rows. Admin access is gated by `is_admin()` SECURITY DEFINER function.

---

## Edge Functions

| Slug | Trigger | Auth |
|---|---|---|
| `create-checkout-session` | POST from frontend | JWT required |
| `stripe-webhook` | POST from Stripe | Stripe signature |
| `market-data` | GET from frontend | JWT required |

---

## Key Constraints

- The Supabase CLI is not available in this environment. All migrations use the `apply_migration` MCP tool.
- `supabase.rpc()` for custom functions requires `(supabase.rpc as any)` cast when the generated types do not include the function signature.
- PortfolioPage and DashboardPage use `data/mock.ts` for holdings — these are not persisted to the database.
- The `InsiderActivity` page (`/insider`) is listed in sidebar navigation but has no route or page component yet.
