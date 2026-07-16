import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
}

// ─── Cache TTL (seconds) ──────────────────────────────────────────────────────
const TTL: Record<string, number> = {
  quote:         5 * 60,
  profile:       24 * 60 * 60,
  metrics:       60 * 60,
  "company-news": 30 * 60,
  "market-news": 15 * 60,
  recommend:     60 * 60,
  analysis:      5 * 60,   // combined endpoint — uses quote TTL
  "bulk-quotes": 5 * 60,
}

const FINNHUB_BASE = "https://finnhub.io/api/v1"

async function finnhub(path: string, apiKey: string): Promise<unknown> {
  const url = `${FINNHUB_BASE}${path}`
  let res = await fetch(url, { headers: { "X-Finnhub-Token": apiKey } })
  // On rate limit, wait out Retry-After (default 2s) and try once more.
  if (res.status === 429) {
    const ra = parseInt(res.headers.get("Retry-After") ?? "2", 10)
    await new Promise((r) => setTimeout(r, (isNaN(ra) ? 2 : ra) * 1000))
    res = await fetch(url, { headers: { "X-Finnhub-Token": apiKey } })
  }
  if (!res.ok) throw new Error(`Finnhub ${res.status}: ${await res.text()}`)
  return res.json()
}

async function getCache(supabase: ReturnType<typeof createClient>, key: string) {
  const { data } = await supabase
    .from("market_data_cache")
    .select("data, expires_at")
    .eq("cache_key", key)
    .maybeSingle()
  if (!data) return null
  if (new Date(data.expires_at) < new Date()) return null
  return data.data
}

async function setCache(
  supabase: ReturnType<typeof createClient>,
  key: string,
  data: unknown,
  ttlSeconds: number,
) {
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  await supabase.from("market_data_cache").upsert(
    { cache_key: key, data, expires_at: expiresAt },
    { onConflict: "cache_key" },
  )
}

async function cached<T>(
  supabase: ReturnType<typeof createClient>,
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = await getCache(supabase, key)
  if (hit !== null) return hit as T
  const fresh = await fetcher()
  setCache(supabase, key, fresh, ttlSeconds).catch(() => {})  // fire-and-forget
  return fresh
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders })
  }

  const apiKey = Deno.env.get("FINNHUB_API_KEY")
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "FINNHUB_API_KEY not configured", mock: true }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }

  // Verify JWT
  const authHeader = req.headers.get("Authorization")
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Missing authorization" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  )

  const url = new URL(req.url)
  const type = url.searchParams.get("type") ?? "quote"
  const symbol = (url.searchParams.get("symbol") ?? "").toUpperCase().trim()

  try {
    let result: unknown

    switch (type) {
      // ─── Single quote ──────────────────────────────────────────────────────
      case "quote": {
        if (!symbol) throw new Error("symbol required")
        result = await cached(supabase, `quote:${symbol}`, TTL.quote, () =>
          finnhub(`/quote?symbol=${symbol}`, apiKey)
        )
        break
      }

      // ─── Bulk quotes ───────────────────────────────────────────────────────
      case "bulk-quotes": {
        const symbols = (url.searchParams.get("symbols") ?? "")
          .split(",")
          .map(s => s.trim().toUpperCase())
          .filter(Boolean)
        if (!symbols.length) throw new Error("symbols required")

        result = Object.fromEntries(
          await Promise.all(
            symbols.map(async sym => [
              sym,
              await cached(supabase, `quote:${sym}`, TTL["bulk-quotes"], () =>
                finnhub(`/quote?symbol=${sym}`, apiKey)
              ),
            ])
          )
        )
        break
      }

      // ─── Company profile ───────────────────────────────────────────────────
      case "profile": {
        if (!symbol) throw new Error("symbol required")
        result = await cached(supabase, `profile:${symbol}`, TTL.profile, () =>
          finnhub(`/stock/profile2?symbol=${symbol}`, apiKey)
        )
        break
      }

      // ─── Financial metrics ─────────────────────────────────────────────────
      case "metrics": {
        if (!symbol) throw new Error("symbol required")
        result = await cached(supabase, `metrics:${symbol}`, TTL.metrics, () =>
          finnhub(`/stock/metric?symbol=${symbol}&metric=all`, apiKey)
        )
        break
      }

      // ─── Company news ──────────────────────────────────────────────────────
      case "company-news": {
        if (!symbol) throw new Error("symbol required")
        const today = new Date()
        const from = url.searchParams.get("from")
          ?? new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const to = url.searchParams.get("to")
          ?? today.toISOString().split("T")[0]
        result = await cached(supabase, `company-news:${symbol}:${from}`, TTL["company-news"], () =>
          finnhub(`/company-news?symbol=${symbol}&from=${from}&to=${to}`, apiKey)
        )
        break
      }

      // ─── Market news ───────────────────────────────────────────────────────
      case "market-news": {
        const category = url.searchParams.get("category") ?? "general"
        result = await cached(supabase, `market-news:${category}`, TTL["market-news"], () =>
          finnhub(`/news?category=${category}`, apiKey)
        )
        break
      }

      // ─── Recommendation trends ─────────────────────────────────────────────
      case "recommend": {
        if (!symbol) throw new Error("symbol required")
        result = await cached(supabase, `recommend:${symbol}`, TTL.recommend, () =>
          finnhub(`/stock/recommendation?symbol=${symbol}`, apiKey)
        )
        break
      }

      // ─── Full analysis (quote + profile + metrics + recommend) ─────────────
      case "analysis": {
        if (!symbol) throw new Error("symbol required")
        const cacheKey = `analysis:${symbol}`
        result = await cached(supabase, cacheKey, TTL.analysis, async () => {
          const [quote, profile, metrics, recommend] = await Promise.all([
            finnhub(`/quote?symbol=${symbol}`, apiKey),
            finnhub(`/stock/profile2?symbol=${symbol}`, apiKey),
            finnhub(`/stock/metric?symbol=${symbol}&metric=all`, apiKey),
            finnhub(`/stock/recommendation?symbol=${symbol}`, apiKey),
          ])
          return { quote, profile, metrics, recommend }
        })
        break
      }

      default:
        throw new Error(`Unknown type: ${type}`)
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error"
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
