import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, TrendingUp, TriangleAlert, CircleCheck as CheckCircle, Info, Briefcase, RefreshCw, Wand2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { Card, MetricCard, Button, Input, Badge, ProgressBar, DataTable, PremiumLock } from '@/components/ui'
import { MOCK_STRESS_TESTS } from '@/data/mock'
import { fmtBig, fmtPct, fmt, cn, toDnaInput } from '@/lib/utils'
import { fetchBulkQuotes, type FinnhubQuote } from '@/lib/market-data'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useAuth } from '@/context/AuthContext'
import { PortfolioBuilder } from '@/components/PortfolioBuilder'
import { computeDnaProfile } from '@/lib/dna-engine'

const RADAR_DATA = [
  { metric: 'Growth', value: 78 },
  { metric: 'Quality', value: 82 },
  { metric: 'Value', value: 61 },
  { metric: 'Income', value: 34 },
  { metric: 'Safety', value: 71 },
  { metric: 'Momentum', value: 85 },
]

export function PortfolioPage() {
  const { dna } = useAuth()
  const { holdings: dbHoldings, loading: holdingsLoading, addHolding, deleteHolding } = usePortfolio()

  const dnaInput = useMemo(() => dna ? toDnaInput(dna) : null, [dna])
  const riskScore = useMemo(() => {
    if (!dnaInput) return 50
    const profile = computeDnaProfile(dnaInput)
    return profile.riskScore
  }, [dnaInput])

  const [showAddHolding, setShowAddHolding] = useState(false)
  const [newTicker, setNewTicker] = useState('')
  const [newShares, setNewShares] = useState('')
  const [newCost, setNewCost] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'holdings' | 'doctor' | 'stress' | 'build'>('holdings')

  const [liveQuotes, setLiveQuotes] = useState<Record<string, FinnhubQuote> | null>(null)
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [quotesUpdatedAt, setQuotesUpdatedAt] = useState<Date | null>(null)

  const tickers = useMemo(() => dbHoldings.map(h => h.ticker), [dbHoldings])

  const refreshQuotes = useCallback(async () => {
    if (tickers.length === 0) return
    setQuotesLoading(true)
    try {
      const quotes = await fetchBulkQuotes(tickers)
      setLiveQuotes(quotes)
      setQuotesUpdatedAt(new Date())
    } catch {
      // fall back to cost basis as price
    } finally {
      setQuotesLoading(false)
    }
  }, [tickers.join(',')])

  useEffect(() => { refreshQuotes() }, [refreshQuotes])

  // Merge live prices into display holdings
  const holdings = useMemo(() => {
    const withPrices = dbHoldings.map(h => {
      const q = liveQuotes?.[h.ticker]
      const currentPrice = (q?.c && q.c > 0) ? q.c : h.cost_basis
      return { ...h, currentPrice, dayChange: q?.dp ?? null }
    })
    const totalValue = withPrices.reduce((sum, h) => sum + h.currentPrice * h.shares, 0)
    return withPrices.map(h => ({
      ...h,
      costBasis: h.cost_basis,
      weight: totalValue > 0 ? ((h.currentPrice * h.shares) / totalValue) * 100 : 0,
    }))
  }, [dbHoldings, liveQuotes])

  const totalValue = holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0)
  const totalCost = holdings.reduce((sum, h) => sum + h.cost_basis * h.shares, 0)
  const totalGain = totalValue - totalCost
  const gainPct = totalCost > 0 ? totalGain / totalCost : 0

  const concentrationIssues = useMemo(() => {
    if (holdings.length === 0) return []
    const sorted = [...holdings].sort((a, b) => b.weight - a.weight)
    const top3Weight = sorted.slice(0, 3).reduce((sum, h) => sum + h.weight, 0)
    const issues: { type: 'warning' | 'info' | 'success'; message: string }[] = []

    if (top3Weight > 60) {
      issues.push({ type: 'warning', message: `Top 3 holdings are ${top3Weight.toFixed(0)}% of total value — consider rebalancing` })
    }
    if (holdings.length >= 5) {
      issues.push({ type: 'success', message: `You have ${holdings.length} holdings — reasonable diversification across positions` })
    } else {
      issues.push({ type: 'info', message: `You have ${holdings.length} holding${holdings.length === 1 ? '' : 's'} — consider adding more positions to diversify` })
    }
    if (sorted[0]?.weight > 40) {
      issues.push({ type: 'warning', message: `${sorted[0].ticker} is ${sorted[0].weight.toFixed(0)}% of your portfolio — significant concentration risk` })
    }
    issues.push({ type: 'info', message: 'Consider adding international exposure for geographic diversification' })
    return issues
  }, [holdings])

  async function handleSaveHolding() {
    const s = parseFloat(newShares)
    const c = parseFloat(newCost)
    if (!newTicker.trim() || isNaN(s) || isNaN(c) || s <= 0 || c <= 0) {
      setSaveError('Please fill in all fields with valid values')
      return
    }
    setSaving(true)
    setSaveError(null)
    const { error } = await addHolding(newTicker.trim(), s, c)
    setSaving(false)
    if (error) {
      setSaveError(error)
    } else {
      setShowAddHolding(false)
      setNewTicker('')
      setNewShares('')
      setNewCost('')
      refreshQuotes()
    }
  }

  const TABS = [
    { key: 'holdings', label: 'Holdings' },
    { key: 'doctor', label: 'Portfolio Doctor' },
    { key: 'stress', label: 'Stress Test', tier: 'pro' },
    { key: 'build', label: 'Build My Portfolio', icon: Wand2 },
  ] as const

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#3b82f6]" />
            Portfolio
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">Manage and analyze your holdings</p>
        </div>
        <div className="flex items-center gap-2">
          {liveQuotes && holdings.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-[#475569]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#10b981] font-medium">Live</span>
              {quotesUpdatedAt && (
                <span className="hidden md:inline">· {quotesUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          )}
          {holdings.length > 0 && (
            <button
              onClick={refreshQuotes}
              disabled={quotesLoading}
              className="p-1.5 rounded-[7px] text-[#475569] hover:text-[#94a3b8] hover:bg-[#0f0f1a] transition-colors disabled:opacity-40 cursor-pointer"
              title="Refresh live prices"
            >
              <RefreshCw className={cn('w-3.5 h-3.5', quotesLoading && 'animate-spin')} />
            </button>
          )}
          <Button onClick={() => { setShowAddHolding(s => !s); setSaveError(null) }} size="sm">
            <Plus className="w-3.5 h-3.5" />
            Add Holding
          </Button>
        </div>
      </div>

      {/* Summary metrics */}
      {holdingsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-[14px] bg-[#0f0f1a] animate-pulse" />
          ))}
        </div>
      ) : holdings.length === 0 && !showAddHolding && activeTab !== 'build' ? (
        <div className="glass-card p-8 text-center">
          <Briefcase className="w-10 h-10 text-[#334155] mx-auto mb-3" />
          <p className="text-[#94a3b8] font-medium mb-1">No holdings yet</p>
          <p className="text-sm text-[#475569] mb-5">Add positions manually, or let us build a portfolio for you.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => setShowAddHolding(true)} size="sm" variant="secondary">
              <Plus className="w-3.5 h-3.5" />
              Add manually
            </Button>
            <Button
              onClick={() => setActiveTab('build')}
              size="sm"
              className="bg-[#8b5cf6] hover:bg-[#7c3aed] border-[#8b5cf6]"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Build my portfolio
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            label="Total Value"
            value={`$${fmtBig(totalValue)}`}
            delta={`${gainPct >= 0 ? '+' : ''}${fmtPct(gainPct)} all-time`}
          />
          <MetricCard label="Total Cost" value={`$${fmtBig(totalCost)}`} />
          <MetricCard
            label="Total Gain"
            value={`${totalGain >= 0 ? '+' : ''}$${fmtBig(Math.abs(totalGain))}`}
            delta={fmtPct(gainPct)}
          />
          <MetricCard label="Holdings" value={holdings.length.toString()} subvalue={`${holdings.length} position${holdings.length === 1 ? '' : 's'}`} />
        </div>
      )}

      {/* Add Holding form */}
      {showAddHolding && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="font-semibold text-[#f1f5f9] mb-4">Add or Update Holding</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Ticker"
                placeholder="AAPL"
                value={newTicker}
                onChange={e => setNewTicker(e.target.value.toUpperCase())}
              />
              <Input
                label="Shares"
                placeholder="10"
                type="number"
                value={newShares}
                onChange={e => setNewShares(e.target.value)}
              />
              <Input
                label="Cost Basis / Share"
                placeholder="150.00"
                type="number"
                value={newCost}
                onChange={e => setNewCost(e.target.value)}
              />
              <div className="flex items-end gap-2">
                <Button fullWidth onClick={handleSaveHolding} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Holding'}
                </Button>
                <Button variant="ghost" onClick={() => { setShowAddHolding(false); setSaveError(null) }}>
                  Cancel
                </Button>
              </div>
            </div>
            {saveError && (
              <p className="mt-3 text-sm text-[#ef4444]">{saveError}</p>
            )}
          </Card>
        </motion.div>
      )}

      {/* Tabs — always visible once data loaded (Build tab works even with no holdings) */}
      {!holdingsLoading && (holdings.length > 0 || activeTab === 'build') && (
        <>
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-[12px] bg-[#0f0f1a] border border-[#1e1e3a] w-fit">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5',
                  activeTab === tab.key
                    ? tab.key === 'build' ? 'bg-[#8b5cf6] text-white' : 'bg-[#3b82f6] text-white'
                    : 'text-[#64748b] hover:text-[#94a3b8]',
                )}
              >
                {'icon' in tab && tab.icon && <tab.icon className="w-3.5 h-3.5" />}
                {tab.label}
                {'tier' in tab && <Badge variant="warning" size="sm">{tab.tier}</Badge>}
              </button>
            ))}
          </div>

          {/* Holdings tab */}
          {activeTab === 'holdings' && (
            <div className="space-y-4">
              <DataTable
                data={holdings}
                columns={[
                  {
                    key: 'ticker',
                    label: 'Ticker',
                    width: '80px',
                    render: (v: string) => <span className="font-semibold text-[#3b82f6]">{v}</span>,
                  },
                  {
                    key: 'name',
                    label: 'Name',
                    width: '180px',
                    render: (v: string | null, row: any) => (
                      <span className="text-[#94a3b8]">{v ?? row.ticker}</span>
                    ),
                  },
                  { key: 'shares', label: 'Shares', width: '80px', render: (v: number) => v.toFixed(v % 1 === 0 ? 0 : 4) },
                  {
                    key: 'currentPrice',
                    label: 'Price',
                    width: '120px',
                    render: (v: number, row: any) => (
                      <div>
                        <span className="text-[#f1f5f9]">${fmt(v)}</span>
                        {row.dayChange != null && (
                          <span className={cn('ml-1.5 text-[10px] font-medium', row.dayChange >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]')}>
                            {row.dayChange >= 0 ? '+' : ''}{row.dayChange.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    ),
                  },
                  { key: 'costBasis', label: 'Avg Cost', width: '100px', render: (v: number) => `$${fmt(v)}` },
                  {
                    key: 'weight',
                    label: 'Value',
                    width: '120px',
                    render: (_v: any, row: any) => `$${fmtBig(row.currentPrice * row.shares)}`,
                  },
                  {
                    key: 'change',
                    label: 'Gain/Loss',
                    width: '90px',
                    render: (_v: any, row: any) => {
                      const value = row.currentPrice * row.shares
                      const cost = row.cost_basis * row.shares
                      const gain = cost > 0 ? (value - cost) / cost : 0
                      return <span className={gain >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>{(gain * 100).toFixed(1)}%</span>
                    },
                  },
                  {
                    key: 'id',
                    label: '',
                    width: '40px',
                    render: (_v: string, row: any) => (
                      <button
                        onClick={e => { e.stopPropagation(); deleteHolding(row.id) }}
                        className="p-1 text-[#334155] hover:text-[#ef4444] transition-colors cursor-pointer"
                        title="Remove holding"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ),
                  },
                ]}
                keyField="id"
                hoverable
              />

              {/* Portfolio Radar + Weight Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <h3 className="font-semibold text-[#f1f5f9] mb-4">Portfolio Profile</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={RADAR_DATA}>
                      <PolarGrid stroke="#1e1e3a" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 12 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} dot />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>

                <Card>
                  <h3 className="font-semibold text-[#f1f5f9] mb-4">Weight Distribution</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={holdings} layout="vertical" margin={{ left: 50 }}>
                      <CartesianGrid stroke="#1e1e3a" horizontal={false} />
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number) => [`${v.toFixed(1)}%`, 'Weight']}
                        contentStyle={{ background: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 8, fontSize: 12 }}
                      />
                      <Bar dataKey="weight" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </div>
            </div>
          )}

          {/* Portfolio Doctor tab */}
          {activeTab === 'doctor' && (
            <div className="space-y-4">
              <Card>
                <h3 className="font-semibold text-[#f1f5f9] mb-1 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
                  Portfolio Diagnosis
                </h3>
                <p className="text-sm text-[#64748b] mb-5">Based on your current holdings and investor DNA profile.</p>
                <div className="space-y-3">
                  {concentrationIssues.map((issue, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-[10px] p-3 border"
                      style={{
                        background: issue.type === 'warning' ? 'rgba(245,158,11,0.08)' : issue.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(59,130,246,0.08)',
                        borderColor: issue.type === 'warning' ? 'rgba(245,158,11,0.2)' : issue.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(59,130,246,0.2)',
                      }}
                    >
                      {issue.type === 'warning' && <TriangleAlert className="w-4 h-4 text-[#f59e0b] mt-0.5 flex-shrink-0" />}
                      {issue.type === 'success' && <CheckCircle className="w-4 h-4 text-[#10b981] mt-0.5 flex-shrink-0" />}
                      {issue.type === 'info' && <Info className="w-4 h-4 text-[#3b82f6] mt-0.5 flex-shrink-0" />}
                      <p className="text-sm text-[#f1f5f9]">{issue.message}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(() => {
                  const top1Weight = holdings.length > 0 ? Math.max(...holdings.map(h => h.weight)) : 0
                  const concScore = Math.max(0, 100 - top1Weight)
                  const divScore = Math.min(100, holdings.length * 14)
                  return [
                    { label: 'Concentration Risk', score: Math.round(concScore), desc: top1Weight > 40 ? `Largest position: ${top1Weight.toFixed(0)}%` : 'Well distributed', color: concScore < 60 ? '#ef4444' : concScore < 75 ? '#f59e0b' : '#10b981' },
                    { label: 'Diversification', score: Math.round(divScore), desc: `${holdings.length} holding${holdings.length === 1 ? '' : 's'}`, color: divScore < 50 ? '#ef4444' : divScore < 70 ? '#f59e0b' : '#3b82f6' },
                    { label: 'Geographic Exposure', score: 45, desc: 'Analysis requires sector data', color: '#64748b' },
                  ]
                })().map(item => (
                  <Card key={item.label}>
                    <p className="text-xs text-[#64748b] uppercase tracking-wider mb-2">{item.label}</p>
                    <p className="text-2xl font-bold mb-1" style={{ color: item.color }}>
                      {item.score}/100
                    </p>
                    <p className="text-sm text-[#94a3b8]">{item.desc}</p>
                    <div className="mt-3">
                      <ProgressBar value={item.score} color={item.color} />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Stress Test tab */}
          {activeTab === 'stress' && (
            <PremiumLock
              tier="pro"
              title="Stress Testing"
              description="See how your portfolio would have performed in historic market crashes"
              features={['2008 Financial Crisis', 'Dot-Com Crash', 'COVID Crash', 'Custom Scenarios']}
            >
              <div className="space-y-3">
                {MOCK_STRESS_TESTS.map(test => (
                  <div key={test.scenario} className="flex items-center justify-between p-3 rounded-[10px] bg-[#0f0f1a]">
                    <div>
                      <p className="text-sm font-medium text-[#f1f5f9]">{test.scenario}</p>
                      <p className="text-xs text-[#64748b]">{test.description}</p>
                    </div>
                    <p className="text-sm font-bold text-[#ef4444]">{fmtPct(test.projectedDrawdown)}</p>
                  </div>
                ))}
              </div>
            </PremiumLock>
          )}

          {/* Build Portfolio tab */}
          {activeTab === 'build' && (
            <PortfolioBuilder
              dna={dnaInput}
              riskScore={riskScore}
              addHolding={addHolding}
              onDone={() => setActiveTab('holdings')}
            />
          )}
        </>
      )}

    </div>
  )
}
