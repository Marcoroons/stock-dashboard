import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2, TrendingUp, TriangleAlert, CircleCheck as CheckCircle, Info, Briefcase, RefreshCw } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import { Card, MetricCard, Button, Input, Badge, ProgressBar, DataTable, PremiumLock } from '@/components/ui'
import { MOCK_HOLDINGS, MOCK_PORTFOLIO, MOCK_STRESS_TESTS } from '@/data/mock'
import { fmtBig, fmtPct, fmt, cn } from '@/lib/utils'
import { fetchBulkQuotes, type FinnhubQuote } from '@/lib/market-data'

const RADAR_DATA = [
  { metric: 'Growth', value: 78 },
  { metric: 'Quality', value: 82 },
  { metric: 'Value', value: 61 },
  { metric: 'Income', value: 34 },
  { metric: 'Safety', value: 71 },
  { metric: 'Momentum', value: 85 },
]

const CONCENTRATION_ISSUES = [
  { type: 'warning', message: 'Technology sector is 65% of your portfolio — high concentration risk' },
  { type: 'info', message: 'Consider adding international exposure (currently 0%)' },
  { type: 'success', message: 'You have 7 holdings — reasonable diversification across positions' },
  { type: 'warning', message: 'Top 3 holdings are 65% of total value — consider rebalancing' },
]

export function PortfolioPage() {
  const [showAddHolding, setShowAddHolding] = useState(false)
  const [newTicker, setNewTicker] = useState('')
  const [newShares, setNewShares] = useState('')
  const [newCost, setNewCost] = useState('')
  const [activeTab, setActiveTab] = useState<'holdings' | 'doctor' | 'stress'>('holdings')

  // Live quotes state
  const [liveQuotes, setLiveQuotes] = useState<Record<string, FinnhubQuote> | null>(null)
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [quotesUpdatedAt, setQuotesUpdatedAt] = useState<Date | null>(null)

  const tickers = MOCK_HOLDINGS.map(h => h.ticker)

  const refreshQuotes = useCallback(async () => {
    setQuotesLoading(true)
    try {
      const quotes = await fetchBulkQuotes(tickers)
      setLiveQuotes(quotes)
      setQuotesUpdatedAt(new Date())
    } catch {
      // silently fall back to mock prices
    } finally {
      setQuotesLoading(false)
    }
  }, [tickers.join(',')])

  useEffect(() => { refreshQuotes() }, [refreshQuotes])

  // Merge live prices into holdings
  const holdings = MOCK_HOLDINGS.map(h => {
    const q = liveQuotes?.[h.ticker]
    const currentPrice = (q?.c && q.c > 0) ? q.c : h.currentPrice
    const dayChange = q?.dp ?? null
    return { ...h, currentPrice, dayChange }
  })

  // Recalculate totals from live prices when available
  const totalValue = liveQuotes
    ? holdings.reduce((sum, h) => sum + h.currentPrice * h.shares, 0)
    : MOCK_PORTFOLIO.totalValue
  const totalCost = MOCK_PORTFOLIO.totalCost
  const totalGain = totalValue - totalCost
  const gainPct = totalGain / totalCost

  const TABS = [
    { key: 'holdings', label: 'Holdings' },
    { key: 'doctor', label: 'Portfolio Doctor' },
    { key: 'stress', label: 'Stress Test', tier: 'pro' },
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
          {liveQuotes && (
            <div className="flex items-center gap-1.5 text-xs text-[#475569]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#10b981] font-medium">Live</span>
              {quotesUpdatedAt && (
                <span className="hidden md:inline">· {quotesUpdatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              )}
            </div>
          )}
          <button
            onClick={refreshQuotes}
            disabled={quotesLoading}
            className="p-1.5 rounded-[7px] text-[#475569] hover:text-[#94a3b8] hover:bg-[#0f0f1a] transition-colors disabled:opacity-40 cursor-pointer"
            title="Refresh live prices"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', quotesLoading && 'animate-spin')} />
          </button>
          <Button onClick={() => setShowAddHolding(s => !s)} size="sm">
            <Plus className="w-3.5 h-3.5" />
            Add Holding
          </Button>
        </div>
      </div>

      {/* Summary metrics */}
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
        <MetricCard label="Holdings" value={holdings.length.toString()} subvalue="7 positions" />
      </div>

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
              <div className="flex items-end">
                <Button fullWidth onClick={() => setShowAddHolding(false)}>
                  Save Holding
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-[12px] bg-[#0f0f1a] border border-[#1e1e3a] w-fit">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'px-4 py-2 rounded-[8px] text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5',
              activeTab === tab.key
                ? 'bg-[#3b82f6] text-white'
                : 'text-[#64748b] hover:text-[#94a3b8]',
            )}
          >
            {tab.label}
            {'tier' in tab && <Badge variant="warning" size="sm">{tab.tier}</Badge>}
          </button>
        ))}
      </div>

      {/* Holdings tab */}
      {activeTab === 'holdings' && (
        <div className="space-y-4">
          {/* Holdings table */}
          <DataTable
            data={holdings}
            columns={[
              {
                key: 'ticker',
                label: 'Ticker',
                width: '80px',
                render: (v: string) => <span className="font-semibold text-[#3b82f6]">{v}</span>,
              },
              { key: 'name', label: 'Name', width: '200px', render: (v: string) => <span className="text-[#94a3b8]">{v}</span> },
              { key: 'shares', label: 'Shares', width: '80px', render: (v: number) => v.toFixed(0) },
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
                render: (_v: any, row: any) => {
                  const value = row.currentPrice * row.shares
                  const cost = row.costBasis * row.shares
                  const gain = (value - cost) / cost
                  return <span className={gain >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>{(gain * 100).toFixed(1)}%</span>
                },
              },
            ]}
            keyField="id"
            hoverable
          />

          {/* Portfolio Radar */}
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
                <BarChart data={MOCK_HOLDINGS} layout="vertical" margin={{ left: 50 }}>
                  <CartesianGrid stroke="#1e1e3a" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="ticker" tick={{ fill: '#94a3b8', fontSize: 11 }} />
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
              {CONCENTRATION_ISSUES.map((issue, i) => (
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
            {[
              { label: 'Concentration Risk', score: 62, desc: 'High tech concentration', color: '#f59e0b' },
              { label: 'Diversification', score: 74, desc: '7 holdings, 4 sectors', color: '#3b82f6' },
              { label: 'Geographic Exposure', score: 45, desc: 'US-only portfolio', color: '#ef4444' },
            ].map(item => (
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
    </div>
  )
}
