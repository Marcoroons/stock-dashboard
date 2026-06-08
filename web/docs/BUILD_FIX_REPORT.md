# BUILD FIX REPORT

**Generated:** 2026-06-08  
**Task:** Fix TypeScript build errors in five specified files  
**Constraint:** No `any`, no `@ts-ignore`, no `eslint-disable`, no refactoring, no file moves  

---

## Files Changed

| File | Change Type |
|---|---|
| `src/lib/analytics.ts` | Fixed `PromiseLike` catch issue |
| `src/pages/GoalsPage.tsx` | Removed `as any` alias, fixed `goal_type` mismatch, added explicit cast |
| `src/types/database.ts` | Added 4 new interfaces + registered 4 tables in `Database` type |

`src/pages/admin/AdminAnalytics.tsx` — no changes required (already had explicit `useState<T>` types and proper casts).  
`src/pages/admin/AdminCodes.tsx` — no changes required (`CodeRow` interface and `useState<CodeRow[]>` were already explicit).  
`src/pages/admin/AdminOverview.tsx` — no changes required (all `useState` calls already typed, all interfaces already declared).

---

## Interfaces Created

### Added to `src/types/database.ts`

**`FinancialGoalRow`**  
Maps the `financial_goals` table. Fields: `id`, `user_id`, `type` (union), `label`, `target_amount`, `current_amount`, `monthly_contribution`, `target_date`, `notes`, `created_at`, `updated_at`.

**`AnalyticsEvent`**  
Maps the `analytics_events` table. Fields: `id`, `user_id`, `event_name`, `properties` (`Record<string, unknown>`), `session_id`, `created_at`.

**`SubscriptionRow`**  
Maps the `subscriptions` table. Fields: `id`, `user_id`, Stripe IDs, `status`, `tier`, period timestamps, `cancel_at_period_end`, `canceled_at`, audit timestamps.

**`AccessCode`**  
Maps the `access_codes` table. Fields: `id`, `code`, `tier`, `max_uses`, `times_used`, `expires_at`, `is_active`, `created_at`.

All four interfaces were also registered in the `Database` type under `public.Tables`, enabling `supabase.from('table_name')` to resolve to the correct row type without casting through `any`.

---

## Errors Resolved

### 1. `analytics.ts` — PromiseLike `.catch()` not assignable

**Error:**  
`Property 'catch' does not exist on type 'PostgrestBuilder<...>'`

**Root cause:**  
`supabase.from(...).insert(...)` returns a `PostgrestBuilder` which is `PromiseLike` (has `.then()`) but not a full `Promise` (no `.catch()`). Calling `.then(() => {}).catch(() => {})` fails because `.then()` on a `PromiseLike` returns a `Promise<void>`, but the `.catch()` was chained off the original `PostgrestBuilder`, not the resulting `Promise`.

**Fix:**  
Wrapped the builder in `Promise.resolve(...)` to coerce it to a true `Promise` before calling `.catch()`:

```ts
// Before
supabase.from('analytics_events').insert({...}).then(() => {}).catch(() => {})

// After
Promise.resolve(
  supabase.from('analytics_events').insert({...})
).catch(() => {})
```

---

### 2. `GoalsPage.tsx` — `supabase as any` escape hatch

**Error:**  
`const db = supabase as any` — suppresses all type checking on Supabase queries, violates the no-`any` requirement.

**Root cause:**  
`financial_goals` was not registered in the `Database` type, so `supabase.from('financial_goals')` would produce `never` typed results. Rather than fix the types, the file used `as any` as a workaround.

**Fix:**  
Removed `const db = supabase as any`. Registered `financial_goals` (via `FinancialGoalRow`) in the `Database` type. Replaced all `db.from(...)` calls with `supabase.from(...)`. Added explicit `as Goal[]` cast on the `select` result (structurally compatible — `FinancialGoalRow` fields match `Goal` fields with `notes: string | null` vs `notes?: string`).

---

### 3. `GoalsPage.tsx` — `row.goal_type` property does not exist

**Error:**  
`Property 'goal_type' does not exist on type '{ user_id: string; type: GoalType; ... }'`

**Root cause:**  
The insert row object uses the field name `type` (matching the DB column and the `Goal` interface). The `track()` call incorrectly referenced `row.goal_type` which was never a property on `row`.

**Fix:**

```ts
// Before
track('goal_created', { goal_type: row.goal_type })

// After
track('goal_created', { goal_type: row.type })
```

---

### 4. `analytics_events` / `access_codes` / `subscriptions` — untyped `supabase.from()` calls

**Error (latent):**  
`supabase.from('analytics_events')`, `supabase.from('access_codes')`, and `supabase.from('subscriptions')` would resolve to `never`-typed results because those tables were absent from the `Database` type. Admin page files worked around this with explicit `as SomeType[]` casts, but the return type of `.data` was `never`, making the cast an unsafe coercion.

**Fix:**  
Added `AnalyticsEvent`, `AccessCode`, and `SubscriptionRow` interfaces and registered all three tables in `Database.public.Tables`. The `supabase.from(...)` calls in `AdminAnalytics`, `AdminCodes`, and `AdminOverview` now resolve to properly typed rows. Existing explicit casts (`as RecentEvent[]`, `as CodeRow[]`) remain valid because `RecentEvent` and `CodeRow` are structurally assignable to the new DB row types.

---

## Summary

| # | File | Error | Fix |
|---|---|---|---|
| 1 | `analytics.ts` | `.catch()` on `PromiseLike` | Wrap with `Promise.resolve()` |
| 2 | `GoalsPage.tsx` | `supabase as any` | Register `financial_goals` in DB type, remove alias |
| 3 | `GoalsPage.tsx` | `row.goal_type` does not exist | Change to `row.type` |
| 4 | `database.ts` | 4 tables missing from `Database` type | Add `FinancialGoalRow`, `AnalyticsEvent`, `SubscriptionRow`, `AccessCode` interfaces |
