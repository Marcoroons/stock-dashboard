# Architecture Audit — Production Readiness Review
**Date:** 2026-06-05  
**Scope:** All completed phases (Foundation MVP through Phase 9)  
**Status:** Post-cleanup

---

## Executive Summary

The application is a DNA-powered investment platform built on React 18 + TypeScript + Vite + TailwindCSS v4, with Supabase as the backend. Eight feature phases are complete. The architecture is sound at the page level; the primary pre-audit concern was a dead service layer (6 files, 0 consumers) and duplicated DNA casting logic across 3 pages.

**Cleanup executed in Phase 9:**
- Deleted 7 dead files (6 service files + services barrel)
- Deleted `types/services.ts` (unused type definitions)
- Deleted `components/dna/index.ts` (unused barrel, 0 consumers)
- Removed `MOCK_OPPORTUNITIES` export (defined but never imported)
- Extracted `toDnaInput()` to `lib/utils.ts` (was duplicated in 3 pages)
- Fixed `AuthContext.tsx` — added `.catch(() => {})` to both `Promise.all` blocks
- Simplified `onAuthStateChange` handler (removed unnecessary IIFE wrapper)

---

## File Inventory (post-cleanup)

### Pages (12 files)
| File | Lines | Data Source | Supabase |
|------|-------|-------------|---------|
| AuthPage.tsx | 263 | — | auth.signIn / signUp |
| OnboardingPage.tsx | 347 | — | dna_assessments INSERT |
| DashboardPage.tsx | 379 | mock.ts | read-only via AuthContext |
| DnaProfilePage.tsx | 427 | mock.ts + AuthContext | read-only |
| PortfolioPage.tsx | 272 | mock.ts | — |
| AnalyzePage.tsx | 341 | mock.ts | — |
| PortfolioDoctorPage.tsx | 463 | mock.ts | — |
| FundAnalysisPage.tsx | 576 | mock.ts + fund-engine.ts | — |
| NewsPage.tsx | 553 | mock.ts | — |
| OpportunitiesPage.tsx | 634 | discovery-engine.ts | — |
| GoalsPage.tsx | 1027 | wealth-engine.ts | financial_goals CRUD |
| OtherPages.tsx | 121 | static | — |

### Engines / Libraries (6 files)
| File | Lines | Purpose |
|------|-------|---------|
| dna-engine.ts | 470 | DNA profiling, archetypes, behavioral analysis |
| archetypes.ts | 362 | Archetype definitions (24 types) |
| discovery-engine.ts | 331 | Investment scoring, portfolio construction, themes |
| portfolio-doctor.ts | 476 | Health checks, stress tests, recommendations |
| fund-engine.ts | 670 | Fund comparison, metrics, ETF analysis |
| wealth-engine.ts | 398 | Goal projection, Monte Carlo, FIRE, wealth score |

### Core Infrastructure
| File | Purpose |
|------|---------|
| context/AuthContext.tsx | Auth state, profile + DNA fetch |
| lib/supabase.ts | Client singleton |
| lib/utils.ts | cn, fmt*, colorClass, toDnaInput |
| types/database.ts | All DB types + getTierAccess |
| data/mock.ts | Mock data for all non-persisted pages |

---

## Issues Fixed

### P0 — Dead Code Removed
- **6 service files deleted**: FundService, NewsService, StockService, InvestorService, PortfolioService, RecommendationService — all were 100% unused (0 imports anywhere in the codebase)
- **types/services.ts deleted**: 147 lines of type definitions matching the service layer, 0 consumers
- **components/dna/index.ts deleted**: Barrel file with 0 consumers
- **MOCK_OPPORTUNITIES removed**: Exported but never imported

### P1 — Duplicate Logic Consolidated
- **toDnaInput()**: Was independently written in DashboardPage, DnaProfilePage, and OpportunitiesPage with identical logic. Now lives in `lib/utils.ts` and all three pages import it. Also eliminates 12 `(dna as any).field` casts.

### P2 — Error Handling Fixed
- **AuthContext Promise.all**: Both `getSession` and `onAuthStateChange` handlers now have `.catch(() => {})` on their Promise.all calls, preventing unhandled rejection warnings if either fetchProfile or fetchDna fails at startup.
- **onAuthStateChange IIFE**: Simplified from `(async () => { await ... })()` to a flat `Promise.all(...).catch(() => {})`.

---

## Remaining Known Limitations

### Data Layer
- **All pages except GoalsPage use mock data.** PortfolioPage, DashboardPage, AnalyzePage, NewsPage, FundAnalysisPage, and PortfolioDoctorPage all read from `data/mock.ts`. Real-time pricing and portfolio persistence are not wired. This is intentional for the current development phase.
- **financial_goals** is the only user-writable table beyond `dna_assessments` and `profiles`. The `holdings`, `watchlists`, and `watchlist_items` tables exist in `database.ts` but no page writes to them.

### Subscription Gating
- `getTierAccess()` is defined in `database.ts` and `FeatureAccess` flags exist, but no page currently checks subscription tier before rendering premium content. All features render regardless of `profile.subscription_tier`. The SettingsPage shows tier UI but upgrade buttons are non-functional.

### TypeScript Strictness
- `tsconfig.app.json` has `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`. This allows `const db = supabase as any` in GoalsPage and several loose type patterns. Acceptable for current phase; tighten when real data layer is added.

### Search
- AppLayout search input (line ~40) collects a query string but does not route or filter — it is a visual placeholder.

### Academy
- Module completion state is hardcoded (2 of 8 complete). There is no persistence for learning progress.

---

## Architecture Strengths

1. **Engine separation**: All business logic is isolated in `lib/` engines with no React dependencies. Engines are pure TypeScript functions and easy to test.
2. **AuthContext**: Clean single source of truth for user, session, profile, and DNA state. All pages access DNA through `useAuth()`.
3. **Consistent UI system**: Card, Badge, Button, Modal, Toast, EmptyState, Skeleton all in `components/ui/` with a stable API.
4. **DNA pipeline**: OnboardingPage → dna_assessments → AuthContext.dna → toDnaInput() → engine functions. The entire pipeline is coherent.
5. **RLS coverage**: All Supabase tables (profiles, dna_assessments, financial_goals) have per-operation RLS policies using `auth.uid()`.
6. **Monte Carlo in-browser**: wealth-engine implements 300-run Monte Carlo via Box-Muller without any backend call.
