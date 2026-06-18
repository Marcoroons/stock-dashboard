import { STOCK_UNIVERSE, FX, toUSD, type Market, type RiskTier, type UniverseStock } from '@/data/stock-universe'

export interface SuggestedPosition {
  stock: UniverseStock
  allocationPct: number   // 0-100, share of total budget
  allocationUSD: number   // budget × allocationPct / 100
  approxShares: number    // estimated shares based on approxPrice converted to USD
}

export interface BuildInput {
  riskScore: number       // 0-100 from DNA, or 50 default
  budgetUSD: number
  markets: Market[]
  seed: number            // increment for "Remake" to get different picks
}

// Seeded PRNG so same seed → same portfolio
function makePRNG(seed: number) {
  let s = (seed + 1) * 1664525 + 1013904223
  return () => {
    s = Math.imul(s, 1664525) + 1013904223
    return (s >>> 0) / 0xffffffff
  }
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Number of positions scaled to budget
function positionCount(budgetUSD: number): number {
  if (budgetUSD < 2000) return 3
  if (budgetUSD < 5000) return 4
  if (budgetUSD < 10000) return 5
  if (budgetUSD < 25000) return 7
  if (budgetUSD < 75000) return 9
  return 11
}

// Tier distribution [T1, T2, T3, T4] as fractions of total positions
function tierDistribution(riskScore: number): [number, number, number, number] {
  if (riskScore <= 20) return [0.50, 0.35, 0.15, 0.00]
  if (riskScore <= 40) return [0.30, 0.40, 0.25, 0.05]
  if (riskScore <= 60) return [0.15, 0.35, 0.38, 0.12]
  if (riskScore <= 80) return [0.05, 0.25, 0.45, 0.25]
  return [0.00, 0.15, 0.42, 0.43]
}

// Weight multiplier per tier (T1 gets larger individual positions)
const TIER_WEIGHT: Record<RiskTier, number> = { 1: 1.6, 2: 1.2, 3: 0.9, 4: 0.65 }

export function buildPortfolio({ riskScore, budgetUSD, markets, seed }: BuildInput): SuggestedPosition[] {
  const rng = makePRNG(seed)
  const n = positionCount(budgetUSD)
  const dist = tierDistribution(riskScore)

  // How many positions from each tier (always at least 1 in T2)
  const tierCounts: Record<RiskTier, number> = {
    1: Math.round(dist[0] * n),
    2: Math.max(1, Math.round(dist[1] * n)),
    3: Math.round(dist[2] * n),
    4: Math.round(dist[3] * n),
  }

  // Adjust counts to exactly n
  const total = tierCounts[1] + tierCounts[2] + tierCounts[3] + tierCounts[4]
  if (total < n) tierCounts[2] += n - total
  if (total > n) {
    const excess = total - n
    for (const t of [4, 1, 3, 2] as RiskTier[]) {
      const cut = Math.min(excess, tierCounts[t])
      tierCounts[t] -= cut
      if (tierCounts[1] + tierCounts[2] + tierCounts[3] + tierCounts[4] === n) break
    }
  }

  // Filter universe by selected markets and shuffle within each tier
  const byTier = (tier: RiskTier) =>
    shuffle(STOCK_UNIVERSE.filter(s => s.riskTier === tier && markets.includes(s.market)), rng)

  // Ensure market representation: if a market is selected, try to include ≥1 stock
  const selected: UniverseStock[] = []
  const usedSectors = new Map<string, number>()

  function pick(pool: UniverseStock[], count: number) {
    let picked = 0
    for (const stock of pool) {
      if (picked >= count) break
      const sectorCount = usedSectors.get(stock.sector) ?? 0
      if (sectorCount >= 2) continue  // max 2 per sector
      if (selected.some(s => s.ticker === stock.ticker)) continue
      selected.push(stock)
      usedSectors.set(stock.sector, sectorCount + 1)
      picked++
    }
  }

  // First pass: pick from each tier
  pick(byTier(1), tierCounts[1])
  pick(byTier(2), tierCounts[2])
  pick(byTier(3), tierCounts[3])
  pick(byTier(4), tierCounts[4])

  // Second pass: ensure each selected market has ≥1 stock (swap in if missing)
  for (const market of markets) {
    if (!selected.some(s => s.market === market)) {
      // Find a candidate from this market not yet selected
      const candidate = shuffle(
        STOCK_UNIVERSE.filter(s => s.market === market && !selected.some(x => x.ticker === s.ticker)),
        rng,
      )[0]
      if (candidate) {
        // Replace a non-core stock (T3/T4) that has the same market as another selected
        const dupMarketIdx = selected.findLastIndex(s => s.riskTier >= 3 && selected.filter(x => x.market === s.market).length > 1)
        if (dupMarketIdx >= 0) selected.splice(dupMarketIdx, 1, candidate)
        else selected.push(candidate)
      }
    }
  }

  // Assign weights proportional to tier multiplier, then normalize
  const rawWeights = selected.map(s => TIER_WEIGHT[s.riskTier])
  const weightSum = rawWeights.reduce((a, b) => a + b, 0)
  const normalizedWeights = rawWeights.map(w => w / weightSum)

  return selected.map((stock, i) => {
    const allocationPct = normalizedWeights[i] * 100
    const allocationUSD = budgetUSD * normalizedWeights[i]
    const priceUSD = toUSD(stock.approxPrice, stock.currency)
    const approxShares = priceUSD > 0 ? allocationUSD / priceUSD : 0
    return { stock, allocationPct, allocationUSD, approxShares }
  })
}
