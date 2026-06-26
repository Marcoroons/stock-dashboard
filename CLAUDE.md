# CLAUDE.md — Mady Finance

Guidance for Claude Code when working in this repository.

## What this is

**Mady Finance** — a personal investment "operating system" web app: portfolio tracking,
investor-DNA risk profiling, life-goal planning, and market analytics. Black/white
high-contrast brand with full light/dark mode.

## Where the code lives (IMPORTANT)

The **active application is in `web/`** — a React + TypeScript + Vite SPA. Do almost all
work there.

- `web/` — the real app (what deploys to Vercel). **Default to working here.**
- Root-level Python files (`app.py`, `scoring.py`, `stock_analyzer.py`, etc.) — a legacy
  Streamlit prototype. Not deployed, not the current product. Don't touch unless asked.
- `nextjs-app/` — separate/experimental, untracked, not part of the deploy. Ignore unless asked.
- `supabase/` — DB migrations and edge functions (`create-checkout-session`, `market-data`,
  `stripe-webhook`).

## Tech stack (`web/`)

- React 18 + TypeScript, **Vite v8 (rolldown)**, **Tailwind CSS v4** (`@tailwindcss/vite`,
  CSS-first `@theme` — no `tailwind.config.js`)
- **Framer Motion v12**, **Supabase JS v2** (auth + Postgres), **recharts**, **react-router-dom**
- Dark mode: `@custom-variant dark (&:where(.dark, .dark *))` in `index.css`; `.dark` class on `<html>` via `ThemeContext`
- `cn()` util in `lib/utils.ts`: `(...classes) => classes.filter(Boolean).join(' ')` — strings only, no arrays

## Commands (run from `web/`)

```bash
npm run dev      # Vite dev server (port 5173)
npm run build    # tsc -b && vite build  — MUST pass before deploy
npm run lint     # eslint
npx tsc -b       # typecheck only
```

`tsconfig.app.json` has `noUnusedLocals: false` (app code); `tsconfig.node.json` has it `true`.

## Build & deploy (READ BEFORE COMMITTING)

- Git remote: `github.com/Marcoroons/stock-dashboard`. Branch **`main` auto-deploys to Vercel.**
- **`web/dist/` is committed to the repo and serves the deploy.** After any source change that
  should go live, **rebuild (`npm run build`) and commit the regenerated `web/dist/` together
  with the source.** Skipping the rebuild ships stale output.
- Standard deploy flow: edit source → `npm run build` → `git add web/src/... web/dist` →
  commit → push to `main`.
- The user (Marcoroons) sometimes edits `README.md` via GitHub web — **`git fetch` and rebase
  before pushing** to avoid non-fast-forward rejections.
- Commit/push are gated: confirm before committing or pushing (see user's global permission rules).
- After deploy, a **hard refresh (Ctrl+Shift+R)** is needed to bust cached bundles.

## Architecture & flow (`web/src`)

- `App.tsx` — providers (`ThemeProvider > AuthProvider > NotificationProvider > ModalProvider`),
  routing, and the post-auth gate sequence. Pages are **lazy-loaded** (`React.lazy`) and code-split.
- `main.tsx` — root render + a `vite:preloadError` listener that reloads once on a stale chunk.
- `components/ErrorBoundary.tsx` — wraps the app; auto-reloads once on chunk-load errors,
  shows a recovery UI otherwise (prevents the blank-dark-screen failure mode). **Keep this.**
- Post-auth gates (in order): **Disclaimer → DNA assessment → Conclusion → Product tour → main app.**
  Each gate's "seen/accepted" state is per-user in `localStorage` (`disclaimer_<id>`, `dna_skip_<id>`, etc.).
- `/auth/confirm` → `AuthConfirmPage` handles the Supabase email-confirmation callback
  (PKCE / OTP / implicit), then redirects to `/dashboard`. **Supabase dashboard must list
  `<origin>/auth/confirm` under Auth → URL Configuration → Redirect URLs.**
- `context/` — `AuthContext`, `ThemeContext`, `SubscriptionContext`, `AlertsContext`.
- `components/layout/` — `AppLayout` (shell: sidebar + top bar, Suspense around `<Outlet>`),
  `Sidebar` (desktop + mobile).

## Brand & design system

- Name is **"Mady Finance"** everywhere. Logo is the shared **`components/ui/MadyLogo.tsx`**
  (SVG, `fill="currentColor"`). Size/color via className, e.g. `w-7 h-7 text-[#0C0A09] dark:text-white`.
  Never recreate the SVG or reintroduce the old "Investor OS" name or `TrendingUp`-in-a-box logo.
- Core palette: near-black `#0C0A09` / `#080808`, bone-white `#F5F4F0` / `#EEECEA`, pure white/black.
  Older pages still use a stone/sky palette (`theme/variables.css`); migrate toward black/white when redesigning.
- Reference brand treatment lives in `LandingPage.tsx` and `AuthPage.tsx`.

## Conventions & gotchas

- **Input icon padding:** never combine Tailwind `px-*` with a `pl-*`/`pr-*` override on the same
  element — the shorthand can win the cascade and let placeholder text slide under an inset icon.
  `components/ui/Input.tsx` reserves the iconned-side buffer via an **inline style** (44px) so it's
  cascade- and cache-proof. Keep that pattern for any field with an inset icon.
- Respect `prefers-reduced-motion` (wrap motion trees in `<MotionConfig reducedMotion="user">`).
- One hover pattern: opacity shift on text/links, `scale-[1.02]` on cards; transitions 150–200ms.
- Lazy pages are named exports: `lazy(() => import('@/pages/X').then(m => ({ default: m.X })))`.

## Auth & admin

- Supabase email/password. `profiles.is_admin` gates `/admin` (RLS allows a user to update their
  own row, incl. `is_admin`). **Admin unlock:** Settings → enter key **`Admin123`** → sets
  `is_admin = true` → `/admin`. (Client-side check; fine for an internal tool, not truly secure.)
- "Free Trial" CTAs open `AuthPage` directly in **signup** mode; "Log in" opens **signin** mode
  (`AuthPage` takes an `initialMode` prop).

## Known follow-ups / not yet done

- No `vercel.json` yet. Recommended: SPA rewrite (so `/auth/confirm`, `/legal`, `/dashboard`
  resolve on hard refresh) + cache headers (immutable hashed assets, `no-cache` for `index.html`).
  Needs the Vercel project's Root Directory (likely `web`) confirmed first.
- The lazy `LandingPage` chunk is ~520 kB (Three.js shader) — anon-only; left un-split intentionally.
