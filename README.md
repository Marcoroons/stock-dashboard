Mady Finance — Master Build & Fix Plan

Verdict: EDIT the existing app, do not rebuild. The architecture is sound
(separated engines, contexts, hooks, typed components, a token system) and the
build is green. The work is correctness + consistency in passes, not a teardown.

North star (applies to EVERY phase, it is a filter not a step):
A beginner must never feel overwhelmed. Decision quality over prediction. Every
number gets a plain-English "what this means" within reach. Nothing predicts
prices — we assess value, quality, risk, and fit to the user's profile.

Prompt template:
In [PROWORD], [change]. First read the file(s) and give me your plan
before editing. Use TOKENS only, no hardcoded colors. Touch only
[PROWORD] and its direct children — don't refactor shared engines/
contexts. Run typecheck when done. Done = [checklist].


Honesty flags carried through the whole app:
No price prediction anywhere. Suitability/valuation/risk only.
News "confidence" = labeled context, NOT a precise predictive score.
Insider data is sparse/US-biased — show coverage, don't imply completeness.
Stress tests are rough scenario estimates, labeled as such.
Suitability = fit to the user's STATED profile; not financial advice.


PHASE 0 — Foundation & identity (mostly done)


 Green build (tsc -b && vite build exits clean)
 Dependencies sane (single supabase copy, no SSR cruft)
 Set app identity: change <title> from default "web" → "Mady Finance";
add favicon, meta description, social/OG tags
 Resolve naming: pick ONE — "Mady Finance" everywhere (app shell currently
says "Investor OS"). Update SIDEBAR, APP LAYOUT, AUTH brand panel
 Plugin audit (read-only): for every dependency, grep for its import;
list which are unused (dead weight) vs load-bearing. Remove dead ones
 Confirm all env vars present in Vercel (Supabase URL/key, Finnhub key);
confirm none are hardcoded in source
 Add an error boundary at the app root so one crash doesn't white-screen


PHASE 1 — Data spine correctness (THE APP MUST WORK)

The value chain: AUTH → profile → DNA → holdings → quotes → engines.
Fix it end-to-end for one real test account before any design work.

1a. Error surfacing (do this first — it reveals the rest)


 Audit every Supabase write for swallowed errors (insert/update/upsert
where { error } is ignored). Surface via TOAST. Prowords/files:

 ASSESSMENT (writes dna_assessments)
 PORTFOLIO HOOK addHolding (portfolio_holdings)
 WATCHLIST HOOK addToWatchlist (watchlist)
 GOALS (financial_goals)
 ALERTS writes (alerts)





1b. RLS policies (the usual cause of "some saves don't persist")


 For EACH table, read current RLS policies and confirm SELECT/INSERT/
UPDATE exist and use auth.uid() = user_id:

 dna_assessments  - [ ] portfolio_holdings  - [ ] watchlist
 financial_goals  - [ ] alerts  - [ ] profiles



 For EACH insert, confirm the code sets user_id on the row (a missing
user_id silently fails an auth.uid() = user_id policy)
 Fix one table at a time; verify a write persists after each


1c. Known visible bugs (from screenshots)


 DASHBOARD Watchlist stuck on "Loading…" — trace MARKET DATA
fetchBulkQuotes; ensure loading state clears on error; handle Finnhub
429 (rate limit) with fallback (see Phase 2 for the real fix)
 DASHBOARD Portfolio Health rings show 0/0/0 — trace PORTFOLIO DOCTOR
analyzePortfolio; find why it returns empty for a 1-holding portfolio
 Verify the full chain on a fresh account: sign up → DNA writes →
add holding → quote loads → dashboard numbers populate → health computes


PHASE 2 — Decouple market data (scale + the "won't it crash" fix)

Never call a rate-limited API per-user-per-load. Cache once, read many.


 Create a quotes table (ticker PK, price, change, prev_close,
updated_at) + news_cache table if news is shared
 Build a scheduled job (Supabase Edge Function cron OR GitHub Action cron
OR Vercel Cron) that fetches quotes for all held/watchlisted tickers
every 1–5 min and upserts into quotes
 Swap MARKET DATA so the app reads quotes from Supabase, not Finnhub,
on user load (one-line source swap behind the same function signature)
 Keep a direct Finnhub call ONLY for on-demand ANALYZE ticker searches
(with rate-limit handling + caching of recent lookups)
 Decide Finnhub tier AFTER caching (caching slashes call volume, so you
may stay free or on a low tier much longer)
 Document: Vercel (frontend, auto-scales) + Supabase (DB + serverless,
pooling when needed) + one cron job = handles 10k users. No Railway.


PHASE 3 — Theme unification (one system, applied everywhere)


 Lock the system in TOKENS: near-black dark / bone-white (not #FFF) light;
ONE brand accent (extract from the existing hero shader); green/red
reserved EXCLUSIVELY for financial data (gain/loss, risk, sentiment)
 Kill the color scatter (current screens mix blue/green/red/orange/purple
decoratively) — decoration uses chrome + accent only
 Audit EVERY page/tab to consume TOKENS, no hardcoded hex
 Verify THEME CTX toggle: respects prefers-color-scheme, persists,
both modes look intentional (not just inverted)
 Standardize one interactive pattern for tabs/nav (pick ONE: underline
slide / glow / opacity) and one hover-lift for cards/buttons


PHASE 4 — Feature correctness + personalization (function by function)

The directive's mandate: every score/report personalized to the DNA profile.
Go engine-by-engine, then page-by-page. For each: (1) does it work, (2) is it
DNA-personalized, (3) does it have a beginner "what this means" layer.

Engines (lib/) — verify logic + wire personalization


 DNA ENGINE computeDnaProfile — the brain; confirm risk score,
archetypes, allocation weights are sane and feed everything downstream
 DISCOVERY ENGINE scoreInvestments/buildPortfolio/discover — confirm it
consumes the DNA profile (not generic scores)
 WEALTH ENGINE projectGoal/calcFire/calcRetirement — label projections
as assumptions, not forecasts
 PORTFOLIO DOCTOR analyzePortfolio — concentration/sector/geo/correlation
(powers the "5 AI stocks aren't diversified" insight)
 STRESS ENGINE runStressTest — label scenarios as rough estimates
 FUND ENGINE analyzeFund — objective/holdings/sector/geo/fees/verdict
 ALERT ENGINE generateAlerts — personalize to holdings + goals + profile
 SUBSCRIPTION getTierAccess/getRequiredPlan — confirm gating logic


Pages — verify each works, is personalized, and has the education layer


 DASHBOARD /dashboard — fix data (Phase 1), then suitability framing
 PORTFOLIO /portfolio — Holdings/Doctor/Stress/Build tabs all functional
 ANALYZE /analyze — scores + a "Does this suit YOU?" panel from DNA
 DNA /dna — archetypes, risk ring, compatibility
 DOCTOR /doctor — health dimensions + prescriptions (PLUS gate works)
 FUNDS /funds — fund deep-dive + suitability
 NEWS /news — sentiment as labeled context (PLUS gate)
 OPPORTUNITIES /opportunities — DNA-scored discovery; explain the score
 GOALS /goals — FIRE/retirement calcs (fix the financial_goals write)
 ALERTS /alerts — smart alerts (PRO gate)
 STRESS TEST /stress-test — scenarios + per-holding impact (PRO gate)


PHASE 5 — Beginner layer (the north star, made concrete)


 EDUCATIONAL HANDBOOK: one source of truth for every metric (definition,
formula, interpretation, good/bad, higher-or-lower, mistakes, limits)
 Every metric shown anywhere links/tooltips to its handbook entry
 Progressive disclosure: each page leads with a plain Executive Summary;
advanced metrics live behind an "details" expander, not in your face
 Each Stock/Fund report: Exec summary → Bull → Bear → Valuation → Quality
→ Risk → News → Technical → Insider → Suitability (why it fits YOU)
 PRODUCT TOUR refreshed to match the new theme; triggers once
 Plain-language everywhere: no naked jargon without a hover explanation


PHASE 6 — Subscription & payment correctness


 Confirm FEATURE GATE / UPGRADE MODAL actually block content (not just
show a badge) for PLUS/PRO features
 Verify SIDEBAR tier badges match FEATURE_TIERS reality
 PRICING page + LANDING PRICING: align copy/tiers; wire real checkout
 ACCESS CODES (AdminCodes) generate/redeem path works end-to-end
 ADMIN gated by is_admin; verify each admin sub-tab loads real data


PHASE 7 — Landing page wow-factor (only after core works)


 Keep the LOGO and hero ShaderAnimation untouched (they're final)
 Fix the hero subheading copy
 Scroll-continuation sections match the hero's motion language
(fade + slight translate, once per session, prefers-reduced-motion safe)
 Pull LANDING PRICING into the scroll flow, themed to match
 Bouncing scroll-down chevron (subtle, fades on scroll)
 All tabs/CTAs interactive + consistent; readable in both modes


PHASE 8 — Pre-launch hardening


 Loading + empty + error states on every data view (no infinite spinners)
 Mobile pass (MOBILE SIDEBAR, responsive charts/tables)
 Code-split the 2.0 MB bundle (lazy-load heavy routes/charts) — do this
LATE, after imports stabilize, so it isn't redone
 ANALYTICS wired (track key funnel: signup → DNA → first holding)
 DISCLAIMER legal gate reviewed; "not financial advice" visible
 Basic monitoring (Vercel + Supabase logs; error alerts)



Appendix — directive features → status & honesty notes

Directive featureWhere it livesNoteInvestor profiling (mandatory)ASSESSMENT, DNA ENGINEBuilt — verify it gates + personalizes everythingPortfolio health metricsPORTFOLIO DOCTOR, DASHBOARDFix 0/0/0 bug; add handbook linksPosition intelligencePORTFOLIO, ANALYZEVerify per-holding data + DNA fitTechnical indicators(to add)Pure math; label as one input, not a signalRisk intelligence (concentration/correlation)PORTFOLIO DOCTORReal & valuable; the "AI stocks" insightStress testingSTRESS ENGINERough estimates — label clearlyOpportunity scannerDISCOVERY ENGINE, OPPORTUNITIESExplain how scores deriveNews intelligenceNEWS, MARKET DATALabeled context, NOT a precise confidence scoreInsider activity(to add)Data sparse/US-biased — show coverage honestlyStock/fund reportANALYZE, FUNDSAdd the Suitability sectionFund intelligenceFUND ENGINE, FUNDSyfinance/Finnhub coverage incomplete abroadPortfolio builderPORTFOLIO BUILDER, DISCOVERYExplain every recommendationPortfolio evaluationPORTFOLIO DOCTORScore vs the user's profileEducational handbook(Phase 5)The beginner backbone — wire tooltips everywhere
