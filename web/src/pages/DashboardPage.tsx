import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Activity, Briefcase, ArrowUpRight, ArrowDownRight, Eye, Plus, Dna, ChartBar as BarChart3, Shield, ChevronRight } from 'lucide-react'
import {
  AreaChart, Area, ResponsiveContainer, Tooltip,
  PieChart, Pie, Cell, CartesianGrid, XAxis, YAxis,
} from 'recharts'
import { useAuth } from '@/context/AuthContext'
import { Card, MetricCard } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ScoreRing } from '@/components/ui/Progress'
import {
  MOCK_PORTFOLIO, MOCK_HOLDINGS, MOCK_PERFORMANCE_SERIES,
  MOCK_SECTOR_ALLOCATION, MOCK_WATCHLIST, MOCK_NEWS,
} from '@/data/mock'
import { fmtBig, fmtPct, fmt, colorClass } from '@/lib/utils'

const PROFILE_LABELS: Record<string, string> = {
  panic_seller: 'Panic Seller',
  cautious: 'Cautious Investor',
  rational: 'Rational Investor',
  conviction: 'Conviction Investor',
}

const STYLE_LABELS: Record<string, string> = {
  preservation: 'Wealth Preservation',
  income: 'Income-Focused',
  balanced: 'Balanced Growth',
  growth: 'Growth-Focused',
}

const HORIZON_LABELS: Record<string, string> = {
  short: 'Short-term',
  medium: 'Medium-term',
  long: 'Long-term',
  very_long: 'Very Long-term',
}

const SENTIMENT_STYLES = {
  bullish: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', color: '#10b981', label: 'Bullish' },
  neutral: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b', label: 'Neutral' },
  bearish: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.25)', color: '#ef4444', label: 'Bearish' },
}

function DnaCard() {
  const { dna } = useAuth()
  if (!dna) return null
  return (
    <Card className="border-[rgba(59,130,246,0.3)] bg-[rgba(59,130,246,0.05)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Dna className="w-4 h-4 text-[#3b82f6]" />
            <span className="text-xs font-medium text-[#3b82f6] uppercase tracking-wider">Your Investor DNA</span>
          </div>
          <h3 className="text-lg font-semibold text-[#f1f5f9] mb-1">
            {PROFILE_LABELS[dna.emotional_profile ?? ''] ?? 'Custom Profile'}
          </h3>
          <p className="text-sm text-[#94a3b8]">
            {STYLE_LABELS[dna.wealth_style ?? ''] ?? dna.wealth_style} · {HORIZON_LABELS[dna.time_horizon ?? ''] ?? dna.time_horizon} horizon
          </p>
        </div>
        <div className="flex gap-3">
          <ScoreRing score={dna.risk_score} size={64} label="Risk" />
        </div>
      </div>
      <div className="flex gap-2 mt-4 flex-wrap">
        {dna.sector_interests?.slice(0, 4).map(s => (
          <Badge key={s} variant="info">{s}</Badge>
        ))}
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

function SectorChart() {
  return (
    <div className="flex items-center gap-6">
      <PieChart width={120} height={120}>
        <Pie
          data={MOCK_SECTOR_ALLOCATION}
          dataKey="weight"
          nameKey="sector"
          cx="50%" cy="50%"
          innerRadius={32} outerRadius={52}
          strokeWidth={0}
        >
          {MOCK_SECTOR_ALLOCATION.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
      </PieChart>
      <div className="space-y-2 flex-1">
        {MOCK_SECTOR_ALLOCATION.map(s => (
          <div key={s.sector} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
            <span className="text-xs text-[#94a3b8] flex-1">{s.sector}</span>
            <span className="text-xs font-medium text-[#f1f5f9]">{(s.weight * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { profile, dna } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'ytd' | 'lifetime'>('ytd')

  const PERIODS = [
    { key: 'daily', label: '1D', value: MOCK_PORTFOLIO.dailyReturn },
    { key: 'weekly', label: '1W', value: MOCK_PORTFOLIO.weeklyReturn },
    { key: 'monthly', label: '1M', value: MOCK_PORTFOLIO.monthlyReturn },
    { key: 'ytd', label: 'YTD', value: MOCK_PORTFOLIO.ytdReturn },
    { key: 'lifetime', label: 'All', value: MOCK_PORTFOLIO.lifetimeReturn },
  ] as const

  const currentReturn = PERIODS.find(p => p.key === selectedPeriod)?.value ?? 0

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
            {dna ? `${PROFILE_LABELS[dna.emotional_profile ?? ''] ?? 'Investor'} · ${STYLE_LABELS[dna.wealth_style ?? ''] ?? 'Custom'} style` : 'Complete your Investor DNA to personalize this dashboard'}
          </p>
        </div>
        <Button variant="secondary" size="sm">
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
            <p className="text-4xl font-bold text-[#f1f5f9]">${fmtBig(MOCK_PORTFOLIO.totalValue)}</p>
            <p className={`text-sm mt-1 ${currentReturn >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              {currentReturn >= 0 ? '▲' : '▼'} {Math.abs(currentReturn * 100).toFixed(2)}%
              {' '}({currentReturn >= 0 ? '+' : ''}${fmtBig((MOCK_PORTFOLIO.totalValue - MOCK_PORTFOLIO.totalCost) * Math.abs(currentReturn) / MOCK_PORTFOLIO.lifetimeReturn)})
            </p>
          </div>
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button
                key={p.key}
                onClick={() => setSelectedPeriod(p.key as typeof selectedPeriod)}
                className={`px-2.5 py-1 rounded-[6px] text-xs font-medium transition-colors cursor-pointer ${
                  selectedPeriod === p.key
                    ? 'bg-[#3b82f6] text-white'
                    : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <PortfolioChart />
      </motion.div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[
          { label: 'CAGR', value: fmtPct(MOCK_PORTFOLIO.cagr), delta: undefined },
          { label: 'Sharpe', value: fmt(MOCK_PORTFOLIO.sharpe), delta: 'Good > 1' },
          { label: 'Sortino', value: fmt(MOCK_PORTFOLIO.sortino), delta: 'Good > 1.5' },
          { label: 'Beta', value: fmt(MOCK_PORTFOLIO.beta), delta: 'Moderate risk' },
          { label: 'Volatility', value: fmtPct(MOCK_PORTFOLIO.volatility), delta: undefined },
          { label: 'Max Drawdown', value: fmtPct(MOCK_PORTFOLIO.maxDrawdown), delta: undefined },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 + i * 0.03 }}
          >
            <MetricCard label={m.label} value={m.value} subvalue={m.delta} />
          </motion.div>
        ))}
      </div>

      {/* Middle row: Holdings + Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Holdings */}
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#f1f5f9]">Holdings</h3>
            <Button variant="ghost" size="sm">
              View all <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
          <div className="space-y-2">
            {MOCK_HOLDINGS.slice(0, 5).map(h => (
              <div key={h.id} className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#0f0f1a] transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-[8px] bg-[rgba(59,130,246,0.1)] flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-[#3b82f6]">{h.ticker.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#f1f5f9]">{h.ticker}</span>
                    <Badge variant="ghost">{h.sector}</Badge>
                  </div>
                  <p className="text-xs text-[#64748b] truncate">{h.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-[#f1f5f9]">${fmt(h.currentPrice)}</p>
                  <p className={`text-xs ${h.change >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {h.change >= 0 ? '▲' : '▼'} {Math.abs(h.change * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="text-right flex-shrink-0 w-20">
                  <p className="text-sm font-medium text-[#f1f5f9]">${fmtBig(h.currentPrice * h.shares)}</p>
                  <p className="text-xs text-[#64748b]">{(h.weight * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector allocation + scores */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3b82f6]" />
              Sector Allocation
            </h3>
            <SectorChart />
          </div>
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
            <Button variant="ghost" size="sm">
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
          <div className="space-y-2">
            {MOCK_WATCHLIST.map(item => (
              <div key={item.ticker} className="flex items-center gap-3 p-2.5 rounded-[8px] hover:bg-[#0f0f1a] cursor-pointer transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#f1f5f9]">{item.ticker}</span>
                    <div
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        background: item.score >= 70 ? 'rgba(16,185,129,0.12)' : item.score >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                        color: item.score >= 70 ? '#10b981' : item.score >= 50 ? '#f59e0b' : '#ef4444',
                      }}
                    >
                      {item.score}
                    </div>
                  </div>
                  <p className="text-xs text-[#64748b] truncate">{item.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium text-[#f1f5f9]">${fmt(item.price)}</p>
                  <p className={`text-xs flex items-center gap-0.5 justify-end ${item.change >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {item.change >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {Math.abs(item.change * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
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
