import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Wand2, CircleCheck as CheckCircle, ChevronRight, AlertTriangle, Loader2 } from 'lucide-react'
import { Button, Card, Input } from '@/components/ui'
import { cn, fmt, fmtBig } from '@/lib/utils'
import { buildPortfolio, type SuggestedPosition } from '@/lib/portfolio-builder'
import { FX, type Market, type Currency } from '@/data/stock-universe'
import { fetchBulkQuotes } from '@/lib/market-data'
import type { DnaInput } from '@/lib/dna-engine'

const MARKETS: { key: Market; label: string; desc: string }[] = [
  { key: 'US', label: 'US Markets', desc: 'NYSE & NASDAQ' },
  { key: 'JP', label: 'Nikkei (Japan)', desc: 'Tokyo Stock Exchange' },
  { key: 'SG', label: 'Singapore', desc: 'SGX' },
]

const CURRENCIES: { key: Currency; symbol: string }[] = [
  { key: 'USD', symbol: '$' },
  { key: 'SGD', symbol: 'S$' },
  { key: 'JPY', symbol: '¥' },
]

const RISK_TIER_LABEL: Record<number, string> = { 1: 'Conservative', 2: 'Moderate', 3: 'Growth', 4: 'Speculative' }
const RISK_TIER_COLOR: Record<number, string> = {
  1: '#10b981',
  2: '#3b82f6',
  3: '#f59e0b',
  4: '#ef4444',
}
const MARKET_CURRENCY_NOTE: Record<Market, string> = {
  US: 'USD',
  JP: 'JPY',
  SG: 'SGD',
}

interface Props {
  dna: DnaInput | null
  riskScore: number
  addHolding: (ticker: string, shares: number, costBasis: number) => Promise<{ error: string | null }>
  onDone: () => void
}

export function PortfolioBuilder({ dna, riskScore, addHolding, onDone }: Props) {
  const [selectedMarkets, setSelectedMarkets] = useState<Market[]>(['US'])
  const [budgetRaw, setBudgetRaw] = useState('')
  const [budgetCurrency, setBudgetCurrency] = useState<Currency>('USD')
  const [seed, setSeed] = useState(1)
  const [portfolio, setPortfolio] = useState<SuggestedPosition[] | null>(null)
  const [building, setBuilding] = useState(false)
  const [buildError, setBuildError] = useState<string | null>(null)
  const [built, setBuilt] = useState(false)

  const budgetUSD = useMemo(() => {
    const raw = parseFloat(budgetRaw)
    if (isNaN(raw) || raw <= 0) return 0
    return raw * FX[budgetCurrency]
  }, [budgetRaw, budgetCurrency])

  function toggleMarket(m: Market) {
    setSelectedMarkets(prev =>
      prev.includes(m)
        ? prev.length > 1 ? prev.filter(x => x !== m) : prev  // keep at least one
        : [...prev, m],
    )
  }

  function generate() {
    if (budgetUSD <= 0 || selectedMarkets.length === 0) return
    const result = buildPortfolio({ riskScore, budgetUSD, markets: selectedMarkets, seed })
    setPortfolio(result)
    setBuilt(false)
    setBuildError(null)
  }

  function regenerate() {
    setSeed(s => s + 1)
    if (budgetUSD <= 0) return
    const result = buildPortfolio({ riskScore, budgetUSD, markets: selectedMarkets, seed: seed + 1 })
    setPortfolio(result)
    setBuilt(false)
    setBuildError(null)
  }

  async function acceptPortfolio() {
    if (!portfolio) return
    setBuilding(true)
    setBuildError(null)

    const tickers = portfolio.map(p => p.stock.ticker)
    let quotes: Record<string, { c: number; dp: number }> = {}
    try {
      quotes = await fetchBulkQuotes(tickers)
    } catch {
      // will fall back to approxPrice
    }

    const errors: string[] = []
    for (const pos of portfolio) {
      const q = quotes[pos.stock.ticker]
      const livePriceNative = q?.c && q.c > 0 ? q.c : pos.stock.approxPrice
      // Convert to USD for cost basis consistency
      const costBasisUSD = livePriceNative * FX[pos.stock.currency]
      const shares = costBasisUSD > 0 ? pos.allocationUSD / costBasisUSD : 0
      if (shares < 0.0001) {
        errors.push(`${pos.stock.ticker}: could not calculate shares`)
        continue
      }
      const { error } = await addHolding(pos.stock.ticker, parseFloat(shares.toFixed(4)), parseFloat(costBasisUSD.toFixed(4)))
      if (error) errors.push(`${pos.stock.ticker}: ${error}`)
    }

    setBuilding(false)
    if (errors.length > 0) {
      setBuildError(`Some holdings failed to add: ${errors.join(', ')}`)
    } else {
      setBuilt(true)
    }
  }

  const hasNonUSDMarket = portfolio?.some(p => p.stock.currency !== 'USD')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[10px] bg-[rgba(139,92,246,0.15)] flex items-center justify-center flex-shrink-0">
          <Wand2 className="w-4 h-4 text-[#8b5cf6]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[#f1f5f9]">Portfolio Builder</h2>
          <p className="text-xs text-[#64748b]">
            {dna
              ? `Crafting positions for your investor profile · Risk score ${riskScore}/100`
              : 'Complete your Investor DNA for a personalized build — using moderate profile for now'}
          </p>
        </div>
      </div>

      {/* Step 1: Market Selection */}
      <Card>
        <p className="text-sm font-semibold text-[#f1f5f9] mb-1">Which markets do you want to invest in?</p>
        <p className="text-xs text-[#64748b] mb-4">Select one or more. At least one market is required.</p>
        <div className="flex flex-wrap gap-3">
          {MARKETS.map(m => {
            const active = selectedMarkets.includes(m.key)
            return (
              <button
                key={m.key}
                onClick={() => toggleMarket(m.key)}
                className={cn(
                  'flex flex-col items-start px-4 py-3 rounded-[12px] border transition-all duration-200 cursor-pointer text-left min-w-[140px]',
                  active
                    ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.1)]'
                    : 'border-[#1e1e3a] bg-[#0f0f1a] hover:border-[#334155]',
                )}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  {active && <CheckCircle className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                  <span className={cn('text-sm font-semibold', active ? 'text-[#c4b5fd]' : 'text-[#94a3b8]')}>
                    {m.label}
                  </span>
                </div>
                <span className="text-[11px] text-[#475569]">{m.desc}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Step 2: Budget */}
      <Card>
        <p className="text-sm font-semibold text-[#f1f5f9] mb-1">What is your investment budget?</p>
        <p className="text-xs text-[#64748b] mb-4">We'll size each position proportionally to your budget and risk profile.</p>
        <div className="flex gap-3 items-end flex-wrap">
          <div className="flex-1 min-w-[180px]">
            <Input
              label="Budget amount"
              placeholder="10000"
              type="number"
              value={budgetRaw}
              onChange={e => setBudgetRaw(e.target.value)}
            />
          </div>
          <div className="flex gap-1 pb-0.5">
            {CURRENCIES.map(c => (
              <button
                key={c.key}
                onClick={() => setBudgetCurrency(c.key)}
                className={cn(
                  'px-3 py-2 rounded-[8px] text-sm font-medium transition-colors cursor-pointer',
                  budgetCurrency === c.key
                    ? 'bg-[#8b5cf6] text-white'
                    : 'bg-[#0f0f1a] text-[#64748b] border border-[#1e1e3a] hover:border-[#334155]',
                )}
              >
                {c.key}
              </button>
            ))}
          </div>
          <Button
            onClick={generate}
            disabled={budgetUSD <= 0 || selectedMarkets.length === 0}
            className="bg-[#8b5cf6] hover:bg-[#7c3aed] border-[#8b5cf6]"
          >
            <Wand2 className="w-3.5 h-3.5" />
            Generate Portfolio
          </Button>
        </div>
        {budgetUSD > 0 && budgetCurrency !== 'USD' && (
          <p className="text-xs text-[#475569] mt-2">≈ ${fmtBig(budgetUSD)} USD</p>
        )}
      </Card>

      {/* Results */}
      <AnimatePresence>
        {portfolio && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-4"
          >
            {/* Results header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="text-base font-bold text-[#f1f5f9]">
                  Your suggested portfolio
                </p>
                <p className="text-xs text-[#64748b]">
                  {portfolio.length} positions across {[...new Set(portfolio.map(p => p.stock.market))].join(', ')} ·{' '}
                  {Math.round(portfolio.filter(p => p.stock.riskTier <= 2).reduce((s, p) => s + p.allocationPct, 0))}% core ·{' '}
                  {Math.round(portfolio.filter(p => p.stock.riskTier >= 3).reduce((s, p) => s + p.allocationPct, 0))}% growth
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={regenerate} disabled={building}>
                <RefreshCw className="w-3.5 h-3.5" />
                Remake
              </Button>
            </div>

            {/* Currency note for JP/SG */}
            {hasNonUSDMarket && (
              <div className="flex items-start gap-2 rounded-[10px] p-3 border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-[#94a3b8]">
                  Japanese stocks are priced in JPY and Singaporean stocks in SGD. All allocation amounts and cost basis are converted to USD equivalents using approximate exchange rates.
                </p>
              </div>
            )}

            {/* Position cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {portfolio.map((pos, i) => (
                <motion.div
                  key={pos.stock.ticker}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-[14px] p-4 border border-[#1e1e3a] bg-[#0f0f1a]"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-[8px] bg-[rgba(139,92,246,0.1)] flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-[#8b5cf6]">{pos.stock.ticker.charAt(0)}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-bold text-[#f1f5f9]">{pos.stock.ticker}</span>
                          <span
                            className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                            style={{
                              background: `${RISK_TIER_COLOR[pos.stock.riskTier]}18`,
                              color: RISK_TIER_COLOR[pos.stock.riskTier],
                            }}
                          >
                            {RISK_TIER_LABEL[pos.stock.riskTier]}
                          </span>
                          <span className="text-[10px] text-[#475569] font-medium">{pos.stock.market} · {MARKET_CURRENCY_NOTE[pos.stock.market]}</span>
                        </div>
                        <p className="text-xs text-[#64748b] truncate">{pos.stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-[#f1f5f9]">{pos.allocationPct.toFixed(1)}%</p>
                      <p className="text-xs text-[#475569]">~${fmtBig(pos.allocationUSD)}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748b] leading-relaxed">{pos.stock.narrative}</p>
                  <div className="mt-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 h-1 rounded-full bg-[#1e1e3a]">
                      <div
                        className="h-1 rounded-full transition-all"
                        style={{
                          width: `${pos.allocationPct}%`,
                          background: RISK_TIER_COLOR[pos.stock.riskTier],
                        }}
                      />
                    </div>
                    <span className="text-[10px] text-[#475569] flex-shrink-0">
                      ~{pos.approxShares < 1 ? pos.approxShares.toFixed(3) : pos.approxShares.toFixed(1)} shares est.
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Accept / error */}
            {buildError && (
              <div className="p-3 rounded-[10px] border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.06)]">
                <p className="text-sm text-[#ef4444]">{buildError}</p>
              </div>
            )}

            {built ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 rounded-[14px] border border-[rgba(16,185,129,0.25)] bg-[rgba(16,185,129,0.06)]"
              >
                <CheckCircle className="w-5 h-5 text-[#10b981] flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#10b981]">Portfolio built successfully!</p>
                  <p className="text-xs text-[#64748b]">{portfolio.length} positions added to your holdings</p>
                </div>
                <Button size="sm" variant="secondary" onClick={onDone}>
                  View Holdings <ChevronRight className="w-3 h-3" />
                </Button>
              </motion.div>
            ) : (
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={acceptPortfolio}
                  disabled={building}
                  className="bg-[#8b5cf6] hover:bg-[#7c3aed] border-[#8b5cf6]"
                >
                  {building ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Fetching live prices…
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" />
                      Build This Portfolio
                    </>
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={regenerate} disabled={building}>
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try different picks
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
