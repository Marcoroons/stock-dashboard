import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Briefcase, ArrowUpRight, ArrowDownRight, Eye, Plus, Dna,
  BarChart3, Shield, ChevronRight, X, TrendingUp, BookOpen,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AreaChart, Area, ResponsiveContainer, Tooltip, CartesianGrid, XAxis, YAxis } from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { Card, MetricCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScoreRing } from '@/components/ui/Progress'
import { MOCK_PERFORMANCE_SERIES, MOCK_NEWS } from '@/data/mock'
import { fmtBig, fmt, toDnaInput } from '@/lib/utils'
import { computeDnaProfile, getRiskLabel, getRiskColor } from '@/lib/dna-engine'
import { ALL_ARCHETYPES } from '@/lib/archetypes'
import { fetchBulkQuotes, type FinnhubQuote } from '@/lib/market-data'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useWatchlist } from '@/hooks/useWatchlist'
import { cn } from '@/lib/utils'

function DnaCard() {
  const { dna } = useAuth()

  const profile = useMemo(() => {
    if (!dna) return null
    return computeDnaProfile(toDnaInput(dna))
  }, [dna])

  if (!dna || !profile) return null

  const primaryArch = ALL_ARCHETYPES[profile.primaryInvestmentArchetype]
  const behaviorArch = ALL_ARCHETYPES[profile.primaryBehavioralArchetype]
  const riskColor = getRiskColor(profile.riskLevel)

  return (
    <Card className="border-sky-200 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-900/10">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Dna className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
              Investor DNA
            </span>
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/40 flex items-center justify-center text-xl">
              {primaryArch.icon}
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: primaryArch.color }}>
                {primaryArch.label}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">{primaryArch.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm">{behaviorArch.icon}</span>
            <span className="text-sm text-stone-600 dark:text-stone-300">{behaviorArch.label}</span>
            <span className="text-stone-300 dark:text-stone-600">·</span>
            <span className="text-sm font-semibold" style={{ color: riskColor }}>
              {getRiskLabel(profile.riskLevel)}
            </span>
          </div>
        </div>
        <ScoreRing score={profile.riskScore} size={72} color={riskColor} label="Risk" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5 flex-wrap">
          {profile.personalityTags.slice(0, 3).map(t => (
            <span
              key={t}
              className="text-xs px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700"
            >
              {t}
            </span>
          ))}
        </div>
        <Link
          to="/dna"
          className="flex items-center gap-1 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors whitespace-nowrap"
        >
          Full profile <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  )
}

function PortfolioChart() {
  const data = MOCK_PERFORMANCE_SERIES.slice(-60)

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number }[] }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="glass-card px-3 py-2 text-sm font-semibold text-stone-900 dark:text-stone-100 shadow-md">
        ${fmtBig(payload[0].value)}
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0284C7" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#0284C7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--color-border-default)" strokeDasharray="4 4" />
        <XAxis dataKey="date" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke="#0284C7" strokeWidth={2} fill="url(#pvGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DashboardPage() {
  const { profile, dna } = useAuth()
  const navigate = useNavigate()
  const { holdings: dbHoldings, loading: holdingsLoading } = usePortfolio()
  const {
    items: watchlistItems, loading: watchlistLoading,
    addItem: addWatchlistItem, removeItem: removeWatchlistItem,
  } = useWatchlist()

  const [liveQuotes, setLiveQuotes] = useState<Record<string, FinnhubQuote>>({})
  const [showWatchlistAdd, setShowWatchlistAdd] = useState(false)
  const [watchlistInput, setWatchlistInput] = useState('')
  const [watchlistAddError, setWatchlistAddError] = useState<string | null>(null)
  const watchlistInputRef = useRef<HTMLInputElement>(null)

  const allTickers = useMemo(() => {
    const h = dbHoldings.map(h => h.ticker)
    const w = watchlistItems.map(i => i.ticker)
    return [...new Set([...h, ...w])]
  }, [dbHoldings, watchlistItems])

  useEffect(() => {
    if (allTickers.length === 0) return
    fetchBulkQuotes(allTickers)
      .then(quotes => setLiveQuotes(quotes))
      .catch(() => {})
  }, [allTickers.join(',')])

  useEffect(() => {
    if (showWatchlistAdd) watchlistInputRef.current?.focus()
  }, [showWatchlistAdd])

  const portfolioMetrics = useMemo(() => {
    if (dbHoldings.length === 0) return null
    const rows = dbHoldings.map(h => {
      const q = liveQuotes[h.ticker]
      const price = (q?.c && q.c > 0) ? q.c : h.cost_basis
      return { ...h, currentPrice: price }
    })
    const totalValue = rows.reduce((s, h) => s + h.currentPrice * h.shares, 0)
    const totalCost  = rows.reduce((s, h) => s + h.cost_basis * h.shares, 0)
    const lifetimeReturn = totalCost > 0 ? (totalValue - totalCost) / totalCost : 0
    return { totalValue, totalCost, lifetimeReturn, rows }
  }, [dbHoldings, liveQuotes])

  const holdingsDisplay = useMemo(() => {
    if (!portfolioMetrics) return []
    const { rows, totalValue } = portfolioMetrics
    return rows.slice(0, 5).map(h => {
      const q = liveQuotes[h.ticker]
      return {
        ...h,
        change: q?.dp ?? 0,
        weight: totalValue > 0 ? (h.currentPrice * h.shares) / totalValue : 0,
      }
    })
  }, [portfolioMetrics, liveQuotes])

  async function handleAddWatchlistItem() {
    const ticker = watchlistInput.trim().toUpperCase()
    if (!ticker) return
    setWatchlistAddError(null)
    const { error } = await addWatchlistItem(ticker)
    if (error) {
      setWatchlistAddError(error)
    } else {
      setWatchlistInput('')
      setShowWatchlistAdd(false)
    }
  }

  const firstName = profile?.full_name?.split(' ')[0] ?? 'Investor'

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">

      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-stone-900 dark:text-stone-50 leading-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-base text-stone-500 dark:text-stone-400 mt-1">
            {dna
              ? 'Your personalized investment dashboard'
              : 'Complete your Investor DNA to personalise this view'}
          </p>
        </div>
        <Button variant="secondary" size="md" onClick={() => navigate('/portfolio')}>
          <Plus className="w-4 h-4" />
          Add holding
        </Button>
      </motion.div>

      {/* ── DNA Banner ───────────────────────────────────────────────────────── */}
      {dna ? (
        <DnaCard />
      ) : (
        <Card className="border-dashed border-2 border-stone-300 dark:border-stone-700 bg-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center flex-shrink-0">
              <Dna className="w-6 h-6 text-stone-400 dark:text-stone-500" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-stone-900 dark:text-stone-100">
                Set up your Investor DNA
              </p>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">
                Get personalised stock picks, risk analysis, and portfolio advice.
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => navigate('/dna')}>
              Get started
            </Button>
          </div>
        </Card>
      )}

      {/* ── Portfolio Overview ───────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Card padding="lg">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-2">
                Total Portfolio Value
              </p>
              {holdingsLoading ? (
                <div className="h-12 w-48 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse mt-1" />
              ) : portfolioMetrics ? (
                <>
                  <p className="text-4xl font-bold text-stone-900 dark:text-stone-50 leading-none">
                    ${fmtBig(portfolioMetrics.totalValue)}
                  </p>
                  <p className={cn(
                    'text-base mt-2 font-medium flex items-center gap-1',
                    portfolioMetrics.lifetimeReturn >= 0
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400',
                  )}>
                    {portfolioMetrics.lifetimeReturn >= 0
                      ? <ArrowUpRight className="w-4 h-4" />
                      : <ArrowDownRight className="w-4 h-4" />
                    }
                    {Math.abs(portfolioMetrics.lifetimeReturn * 100).toFixed(2)}%
                    {' '}(
                      {portfolioMetrics.lifetimeReturn >= 0 ? '+' : '-'}
                      ${fmtBig(Math.abs(portfolioMetrics.totalValue - portfolioMetrics.totalCost))}
                    ) all-time
                  </p>
                </>
              ) : (
                <>
                  <p className="text-4xl font-bold text-stone-900 dark:text-stone-50 leading-none">$0.00</p>
                  <p className="text-sm mt-2 text-stone-400 dark:text-stone-500">
                    Add holdings to track your portfolio value
                  </p>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">
                {dbHoldings.length} position{dbHoldings.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </div>
          <PortfolioChart />
        </Card>
      </motion.div>

      {/* ── Quick Metrics ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard
          label="Invested"
          value={portfolioMetrics ? `$${fmtBig(portfolioMetrics.totalCost)}` : '$0'}
        />
        <MetricCard
          label="Gain / Loss"
          value={portfolioMetrics
            ? `${portfolioMetrics.lifetimeReturn >= 0 ? '+' : ''}${(portfolioMetrics.lifetimeReturn * 100).toFixed(2)}%`
            : '—'}
          delta={portfolioMetrics
            ? `${portfolioMetrics.lifetimeReturn >= 0 ? '+' : ''}$${fmtBig(Math.abs(portfolioMetrics.totalValue - portfolioMetrics.totalCost))}`
            : undefined}
        />
        <MetricCard
          label="Positions"
          value={`${dbHoldings.length}`}
          subvalue={dbHoldings.length > 0 ? 'across your portfolio' : 'No positions yet'}
          className="hidden md:block"
        />
      </div>

      {/* ── Holdings + Watchlist ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Holdings */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Holdings</h3>
            </div>
            <Link to="/portfolio">
              <Button variant="ghost" size="sm">
                View all <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          {holdingsLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
              ))}
            </div>
          ) : holdingsDisplay.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
                <Briefcase className="w-6 h-6 text-stone-400 dark:text-stone-500" />
              </div>
              <p className="text-base font-medium text-stone-700 dark:text-stone-300">No holdings yet</p>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">Add stocks to start tracking your portfolio</p>
              <Button variant="primary" size="md" className="mt-4" onClick={() => navigate('/portfolio')}>
                Add your first holding
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {holdingsDisplay.map(h => (
                <div
                  key={h.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-sky-600 dark:text-sky-400">
                      {h.ticker.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{h.ticker}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{h.name ?? h.ticker}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      ${fmt(h.currentPrice)}
                    </p>
                    <p className={cn(
                      'text-xs font-medium flex items-center gap-0.5 justify-end',
                      h.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                    )}>
                      {h.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(h.change).toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 w-20 hidden sm:block">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      ${fmtBig(h.currentPrice * h.shares)}
                    </p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      {(h.weight * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Watchlist */}
        <Card padding="md">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-sky-600 dark:text-sky-400" />
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Watchlist</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowWatchlistAdd(s => !s)
                setWatchlistAddError(null)
                setWatchlistInput('')
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          </div>

          {showWatchlistAdd && (
            <div className="mb-4 flex gap-2">
              <input
                ref={watchlistInputRef}
                type="text"
                placeholder="Ticker (e.g. TSLA)"
                value={watchlistInput}
                onChange={e => setWatchlistInput(e.target.value.toUpperCase())}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAddWatchlistItem()
                  if (e.key === 'Escape') setShowWatchlistAdd(false)
                }}
                className={cn(
                  'flex-1 px-3 py-2 rounded-xl text-sm border transition-all duration-200',
                  'bg-white border-stone-200 text-stone-900 placeholder-stone-400',
                  'focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
                  'dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 dark:placeholder-stone-500',
                )}
              />
              <Button size="sm" onClick={handleAddWatchlistItem}>Add</Button>
              <button
                onClick={() => setShowWatchlistAdd(false)}
                className="p-2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {watchlistAddError && (
            <p className="text-sm text-red-600 dark:text-red-400 mb-3">{watchlistAddError}</p>
          )}

          {watchlistLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-stone-100 dark:bg-stone-800 animate-pulse" />
              ))}
            </div>
          ) : watchlistItems.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-12 h-12 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-stone-400 dark:text-stone-500" />
              </div>
              <p className="text-base font-medium text-stone-700 dark:text-stone-300">Watchlist is empty</p>
              <p className="text-sm text-stone-400 dark:text-stone-500 mt-1">
                Add tickers to monitor their prices
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {watchlistItems.map(item => {
                const q = liveQuotes[item.ticker]
                const price = q?.c ?? null
                const change = q?.dp ?? null
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{item.ticker}</p>
                      {item.name && (
                        <p className="text-xs text-stone-400 dark:text-stone-500 truncate">{item.name}</p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {price != null ? (
                        <>
                          <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                            ${fmt(price)}
                          </p>
                          {change != null && (
                            <p className={cn(
                              'text-xs font-medium flex items-center gap-0.5 justify-end',
                              change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                            )}>
                              {change >= 0
                                ? <ArrowUpRight className="w-3 h-3" />
                                : <ArrowDownRight className="w-3 h-3" />
                              }
                              {Math.abs(change).toFixed(2)}%
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-stone-400 dark:text-stone-500">Loading…</p>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeWatchlistItem(item.id) }}
                      aria-label={`Remove ${item.ticker} from watchlist`}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-300 hover:text-red-500 dark:text-stone-600 dark:hover:text-red-400 transition-all cursor-pointer rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── Portfolio Health + News ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Health scores */}
        <Card padding="md">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">Portfolio Health</h3>
          </div>
          <div className="flex justify-around gap-4">
            <ScoreRing score={profile?.investor_score ?? 76} size={80} label="Overall" />
            <ScoreRing score={profile?.portfolio_health_score ?? 81} size={80} label="Health" />
            <ScoreRing score={profile?.risk_management_score ?? 68} size={80} label="Risk" />
          </div>
          <p className="text-xs text-center text-stone-400 dark:text-stone-500 mt-4">
            Based on your current portfolio composition
          </p>
        </Card>

        {/* News */}
        <div className="lg:col-span-2">
          <Card padding="md">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100">News Intelligence</h3>
              </div>
              <Badge variant="warning">Plus</Badge>
            </div>
            <div className="space-y-3">
              {MOCK_NEWS.map(item => {
                const isPositive = item.sentiment === 'bullish'
                const isNegative = item.sentiment === 'bearish'
                return (
                  <div
                    key={item.id}
                    className={cn(
                      'rounded-xl p-4 border',
                      isPositive && 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800',
                      isNegative && 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800',
                      !isPositive && !isNegative && 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-snug flex-1">
                        {item.headline}
                      </p>
                      <Badge
                        variant={isPositive ? 'success' : isNegative ? 'error' : 'warning'}
                        size="sm"
                      >
                        {item.sentiment}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-stone-400 dark:text-stone-500">
                      <span>{item.source}</span>
                      <span>·</span>
                      <span>{item.timestamp}</span>
                      <Badge variant="ghost" className="text-xs">{item.ticker}</Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Quick Links ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Build Portfolio', desc: 'AI-powered picks', icon: TrendingUp, to: '/portfolio', color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-50 dark:bg-sky-900/20' },
          { label: 'Analyze Stock', desc: 'Deep fundamentals', icon: BarChart3, to: '/analyze', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Life Goals', desc: 'Plan your future', icon: Shield, to: '/goals', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20' },
          { label: 'Academy', desc: 'Learn investing', icon: BookOpen, to: '/academy', color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="glass-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
          >
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', link.bg)}>
              <link.icon className={cn('w-5 h-5', link.color)} />
            </div>
            <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">{link.label}</p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mt-0.5">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
