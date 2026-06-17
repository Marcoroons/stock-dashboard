import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, ArrowUpRight, ArrowDownRight, Eye, Plus, Dna, ChartBar as BarChart3, Shield, ChevronRight, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis,
} from 'recharts'
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

const SENTIMENT_STYLES = {
  bullish: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10b981', label: 'Bullish' },
  neutral: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b', label: 'Neutral' },
  bearish: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#ef4444', label: 'Bearish' },
}

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
    <Card
      className="border-[rgba(59,130,246,0.25)]"
      style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.06) 0%, rgba(6,182,212,0.03) 100%)' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Dna className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-xs font-medium text-[#3b82f6] uppercase tracking-wider">Investor DNA</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{primaryArch.icon}</span>
            <div>
              <h3 className="text-base font-bold" style={{ color: primaryArch.color }}>{primaryArch.label}</h3>
              <p className="text-xs text-[#64748b]">{primaryArch.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-base">{behaviorArch.icon}</span>
            <span className="text-xs text-[#94a3b8]">{behaviorArch.label}</span>
            <span className="text-[#334155]">·</span>
            <span className="text-xs font-medium" style={{ color: riskColor }}>{getRiskLabel(profile.riskLevel)}</span>
          </div>
        </div>
        <ScoreRing score={profile.riskScore} size={64} color={riskColor} label="Risk" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {profile.personalityTags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#1e1e3a] text-[#64748b]">{t}</span>
          ))}
        </div>
        <Link to="/dna" className="flex items-center gap-1 text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors">
          Full profile <ChevronRight className="w-3 h-3" />
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
      <div className="glass-card px-3 py-2 text-sm">
        <span className="text-[#f1f5f9] font-medium">${fmtBig(payload[0].value)}</span>
      </div>
    )
  }
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="pvGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1e1e3a" strokeDasharray="4 4" />
        <XAxis dataKey="date" hide />
        <YAxis hide domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#pvGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function DashboardPage() {
  const { profile, dna } = useAuth()
  const navigate = useNavigate()
  const { holdings: dbHoldings, loading: holdingsLoading } = usePortfolio()
  const { items: watchlistItems, loading: watchlistLoading, addItem: addWatchlistItem, removeItem: removeWatchlistItem } = useWatchlist()

  const [liveQuotes, setLiveQuotes] = useState<Record<string, FinnhubQuote>>({})
  const [showWatchlistAdd, setShowWatchlistAdd] = useState(false)
  const [watchlistInput, setWatchlistInput] = useState('')
  const [watchlistAddError, setWatchlistAddError] = useState<string | null>(null)
  const watchlistInputRef = useRef<HTMLInputElement>(null)

  // Collect all tickers (holdings + watchlist) for a single bulk quote fetch
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

  // Compute portfolio metrics from real holdings
  const portfolioMetrics = useMemo(() => {
    if (dbHoldings.length === 0) return null
    const rows = dbHoldings.map(h => {
      const q = liveQuotes[h.ticker]
      const price = (q?.c && q.c > 0) ? q.c : h.cost_basis
      return { ...h, currentPrice: price }
    })
    const totalValue = rows.reduce((s, h) => s + h.currentPrice * h.shares, 0)
    const totalCost = rows.reduce((s, h) => s + h.cost_basis * h.shares, 0)
    const lifetimeReturn = totalCost > 0 ? (totalValue - totalCost) / totalCost : 0
    return { totalValue, totalCost, lifetimeReturn, rows }
  }, [dbHoldings, liveQuotes])

  // Holdings display (up to 5, merged with live prices)
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

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">
            Good morning, {profile?.full_name?.split(' ')[0] ?? 'Investor'}
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">
            {dna ? 'Your personalized investment dashboard' : 'Complete your Investor DNA to personalize this dashboard'}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate('/portfolio')}>
          <Plus className="w-3.5 h-3.5" />
          Add holding
        </Button>
      </motion.div>

      {/* DNA Banner */}
      {dna && <DnaCard />}

      {/* Portfolio value */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass-card p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-[#64748b] uppercase tracking-wider mb-1">Total Portfolio Value</p>
            {holdingsLoading ? (
              <div className="h-10 w-40 bg-[#1e1e3a] rounded animate-pulse mt-1" />
            ) : portfolioMetrics ? (
              <>
                <p className="text-4xl font-bold text-[#f1f5f9]">${fmtBig(portfolioMetrics.totalValue)}</p>
                <p className={`text-sm mt-1 ${portfolioMetrics.lifetimeReturn >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                  {portfolioMetrics.lifetimeReturn >= 0 ? '▲' : '▼'} {Math.abs(portfolioMetrics.lifetimeReturn * 100).toFixed(2)}%
                  {' '}({portfolioMetrics.lifetimeReturn >= 0 ? '+' : ''}${fmtBig(Math.abs(portfolioMetrics.totalValue - portfolioMetrics.totalCost))}) all-time
                </p>
              </>
            ) : (
              <>
                <p className="text-4xl font-bold text-[#f1f5f9]">$0.00</p>
                <p className="text-sm mt-1 text-[#475569]">Add holdings to track your portfolio value</p>
              </>
            )}
          </div>
        </div>
        <PortfolioChart />
      </motion.div>

      {/* Middle row: Holdings + Sector + Scores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Holdings */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#f1f5f9]">Holdings</h3>
            <Link to="/portfolio">
              <Button variant="ghost" size="sm">
                View all <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
          {holdingsLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-[8px] bg-[#0f0f1a] animate-pulse" />
              ))}
            </div>
          ) : holdingsDisplay.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-8 h-8 text-[#334155] mx-auto mb-2" />
              <p className="text-sm text-[#64748b]">No holdings yet</p>
              <Button variant="ghost" size="sm" className="mt-2" onClick={() => navigate('/portfolio')}>
                Add your first holding
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {holdingsDisplay.map(h => (
                <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#0f0f1a] transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-[8px] bg-[rgba(59,130,246,0.1)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[#3b82f6]">{h.ticker.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#f1f5f9]">{h.ticker}</span>
                    </div>
                    <p className="text-xs text-[#64748b] truncate">{h.name ?? h.ticker}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-medium text-[#f1f5f9]">${fmt(h.currentPrice)}</p>
                    <p className={`text-xs ${h.change >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      {h.change >= 0 ? '▲' : '▼'} {Math.abs(h.change).toFixed(2)}%
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 w-20">
                    <p className="text-sm font-medium text-[#f1f5f9]">${fmtBig(h.currentPrice * h.shares)}</p>
                    <p className="text-xs text-[#64748b]">{(h.weight * 100).toFixed(1)}%</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scores */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#10b981]" />
              Portfolio Health
            </h3>
            <div className="flex justify-around">
              <ScoreRing score={profile?.investor_score ?? 76} size={72} label="Overall" />
              <ScoreRing score={profile?.portfolio_health_score ?? 81} size={72} label="Health" />
              <ScoreRing score={profile?.risk_management_score ?? 68} size={72} label="Risk" />
            </div>
          </div>
        </div>
      </div>

      {/* Watchlist + News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Watchlist */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#06b6d4]" />
              Watchlist
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setShowWatchlistAdd(s => !s); setWatchlistAddError(null); setWatchlistInput('') }}
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>

          {/* Inline add input */}
          {showWatchlistAdd && (
            <div className="mb-3 flex gap-2">
              <input
                ref={watchlistInputRef}
                type="text"
                placeholder="Ticker (e.g. TSLA)"
                value={watchlistInput}
                onChange={e => setWatchlistInput(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === 'Enter') handleAddWatchlistItem(); if (e.key === 'Escape') setShowWatchlistAdd(false) }}
                className="flex-1 px-3 py-1.5 rounded-[8px] text-sm bg-[#0f0f1a] border border-[#1e1e3a] text-[#f1f5f9] placeholder-[#475569] focus:outline-none focus:border-[#3b82f6]"
              />
              <Button size="sm" onClick={handleAddWatchlistItem}>Add</Button>
              <button onClick={() => setShowWatchlistAdd(false)} className="p-1.5 text-[#475569] hover:text-[#94a3b8] cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          {watchlistAddError && (
            <p className="text-xs text-[#ef4444] mb-2">{watchlistAddError}</p>
          )}

          {watchlistLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-10 rounded-[8px] bg-[#0f0f1a] animate-pulse" />
              ))}
            </div>
          ) : watchlistItems.length === 0 ? (
            <div className="text-center py-6">
              <Eye className="w-7 h-7 text-[#334155] mx-auto mb-2" />
              <p className="text-sm text-[#64748b]">Your watchlist is empty</p>
              <p className="text-xs text-[#475569] mt-0.5">Add tickers to monitor their prices</p>
            </div>
          ) : (
            <div className="space-y-2">
              {watchlistItems.map(item => {
                const q = liveQuotes[item.ticker]
                const price = q?.c ?? null
                const change = q?.dp ?? null
                return (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#0f0f1a] cursor-pointer transition-colors group">
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-[#f1f5f9]">{item.ticker}</span>
                      {item.name && <p className="text-xs text-[#64748b] truncate">{item.name}</p>}
                    </div>
                    <div className="text-right flex-shrink-0">
                      {price != null ? (
                        <>
                          <p className="text-sm font-medium text-[#f1f5f9]">${fmt(price)}</p>
                          {change != null && (
                            <p className={`text-xs flex items-center gap-0.5 justify-end ${change >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                              {change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                              {Math.abs(change).toFixed(2)}%
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-[#475569]">Loading…</p>
                      )}
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); removeWatchlistItem(item.id) }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[#334155] hover:text-[#ef4444] transition-all cursor-pointer"
                      title="Remove from watchlist"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* News */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#f1f5f9] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#f59e0b]" />
              News Intelligence
            </h3>
            <Badge variant="warning">Plus</Badge>
          </div>
          <div className="space-y-3">
            {MOCK_NEWS.map(item => {
              const s = SENTIMENT_STYLES[item.sentiment]
              return (
                <div key={item.id} className="rounded-[10px] p-3" style={{ background: s.bg, border: `1px solid ${s.border}` }}>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-sm text-[#f1f5f9] font-medium leading-snug">{item.headline}</p>
                    <div className="flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: s.border + '40', color: s.color }}>
                        {s.label}
                      </span>
                      <span className="text-[10px] text-[#64748b]">Score: {item.importanceScore}/10</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748b]">{item.summary}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-[#64748b]">
                    <span>{item.source}</span>
                    <span>{item.timestamp}</span>
                    <Badge variant="ghost">{item.ticker}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
