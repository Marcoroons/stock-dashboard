import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

// ─── refresh-quotes ───────────────────────────────────────────────────────────
// Cron-invoked (every ~2 min). Computes the DISTINCT union of every user's
// holdings + watchlist tickers, fetches one Finnhub /quote per unique ticker
// (paced under the 60 calls/min free limit, with 429/Retry-After handling and
// cross-run chunking), and upserts into the shared `quotes` table.
//
// Auth: requires the x-cron-secret header to match the CRON_SECRET secret.
// verify_jwt is disabled for this function (see config.toml) — this header is
// the gate. Finnhub key + service role come from function secrets, never client.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-cron-secret",
}

const FINNHUB_BASE = "https://finnhub.io/api/v1"
const MAX_CALLS_PER_RUN = 50   // headroom under Finnhub's 60/min free limit
const PACE_MS = 1200           // ~50 calls spread across ~60s

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  })
}

interface FinnhubQuote { c: number; d: number; dp: number; pc: number }

// One /quote call, retried once on 429 honoring Retry-After.
async function fetchQuote(sym: string, apiKey: string): Promise<FinnhubQuote> {
  const url = `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(sym)}`
  let res = await fetch(url, { headers: { "X-Finnhub-Token": apiKey } })
  if (res.status === 429) {
    const ra = parseInt(res.headers.get("Retry-After") ?? "2", 10)
    await sleep((isNaN(ra) ? 2 : ra) * 1000)
    res = await fetch(url, { headers: { "X-Finnhub-Token": apiKey } })
  }
  if (!res.ok) throw new Error(`Finnhub ${res.status}`)
  return res.json() as Promise<FinnhubQuote>
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders })

  // ── Auth: shared cron secret ──
  const secret = req.headers.get("x-cron-secret")
  const expected = Deno.env.get("CRON_SECRET")
  if (!expected || secret !== expected) return json({ error: "unauthorized" }, 401)

  const apiKey = Deno.env.get("FINNHUB_API_KEY")
  if (!apiKey) return json({ error: "FINNHUB_API_KEY not configured" }, 503)

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  try {
    // ── 1. Ticker set = DISTINCT union of holdings + watchlist_items ──
    const [{ data: h }, { data: w }] = await Promise.all([
      supabase.from("holdings").select("ticker"),
      supabase.from("watchlist_items").select("ticker"),
    ])
    const set = new Set<string>()
    for (const r of (h ?? []) as { ticker: string }[]) if (r.ticker) set.add(r.ticker.toUpperCase())
    for (const r of (w ?? []) as { ticker: string }[]) if (r.ticker) set.add(r.ticker.toUpperCase())
    let tickers = [...set]
    const total = tickers.length

    if (total === 0) return json({ ok: true, total: 0, processed: 0, upserted: 0 })

    // ── 2. Chunk across runs: refresh the STALEST tickers first so, when the
    //       set exceeds one run's budget, coverage rotates over successive runs. ──
    if (tickers.length > MAX_CALLS_PER_RUN) {
      const { data: existing } = await supabase
        .from("quotes").select("ticker, updated_at").in("ticker", tickers)
      const seen = new Map((existing ?? []).map((r: { ticker: string; updated_at: string }) => [r.ticker, r.updated_at]))
      tickers.sort((a, b) => {
        const ua = seen.get(a), ub = seen.get(b)
        if (!ua && !ub) return 0
        if (!ua) return -1            // never-fetched first
        if (!ub) return 1
        return new Date(ua).getTime() - new Date(ub).getTime()  // then stalest first
      })
      tickers = tickers.slice(0, MAX_CALLS_PER_RUN)
    }

    // ── 3. Fetch paced, one call per ticker ──
    const rows: Record<string, unknown>[] = []
    for (const sym of tickers) {
      try {
        const q = await fetchQuote(sym, apiKey)
        if (q && typeof q.c === "number" && q.c > 0) {
          rows.push({
            ticker: sym,
            price: q.c,
            change: q.d ?? 0,
            percent_change: q.dp ?? 0,
            prev_close: q.pc ?? 0,
            currency: "USD",
            updated_at: new Date().toISOString(),
          })
        }
      } catch (_e) {
        // skip this ticker this cycle; it'll be retried (stalest-first) next run
      }
      await sleep(PACE_MS)
    }

    // ── 4. Upsert into the shared cache ──
    let upserted = 0
    if (rows.length) {
      const { error } = await supabase.from("quotes").upsert(rows, { onConflict: "ticker" })
      if (error) return json({ ok: false, error: error.message, total, processed: tickers.length }, 500)
      upserted = rows.length
    }

    return json({ ok: true, total, processed: tickers.length, upserted })
  } catch (err) {
    return json({ ok: false, error: err instanceof Error ? err.message : "internal error" }, 500)
  }
})
