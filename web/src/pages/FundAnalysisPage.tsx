import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, DollarSign, Shield, Globe, ChartBar as BarChart2, CircleCheck as CheckCircle, Circle as XCircle, ChevronRight, Info, Layers, CircleCheck, TriangleAlert } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { Card, Badge } from '@/components/ui'
import { ProgressBar, ScoreRing } from '@/components/ui/Progress'
import {
  analyzeFund, FUND_TICKERS, FUND_DB,
  type FundAnalysis, type FundVerdict, type RiskRating,
} from '@/lib/fund-engine'
import { fmtBig, fmtPct, fmt, cn } from '@/lib/utils'

// ─── Constants ────────────────────────────────────────────────────────────────

const FADE_UP = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.055 } }),
}

const RATING_COLORS: Record<string, string> = {
  excellent: '#10b981',
  good: '#3b82f6',
  fair: '#f59e0b',
  poor: '#ef4444',
}

const RISK_LABELS: Record<RiskRating, { label: string; color: string }> = {
  conservative: { label: 'Conservative', color: '#10b981' },
  moderate_conservative: { label: 'Mod. Conservative', color: '#06b6d4' },
  moderate: { label: 'Moderate', color: '#3b82f6' },
  moderate_aggressive: { label: 'Mod. Aggressive', color: '#f59e0b' },
  aggressive: { label: 'Aggressive', color: '#ef4444' },
}

const FUND_TYPE_LABELS: Record<string, string> = {
  etf: 'ETF',
  mutual_fund: 'Mutual Fund',
  index_fund: 'Index Fund',
}

const CHART_TOOLTIP = {
  contentStyle: { background: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#f1f5f9' },
  itemStyle: { color: '#94a3b8' },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function VerdictCard({ verdict, label, icon }: { verdict: FundVerdict; label: string; icon: React.ReactNode }) {
  const color = RATING_COLORS[verdict.rating]
  return (
    <Card className="h-full">
      <div className="flex items-start justify-between mb-2 gap-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
            style={{ background: `${color}18`, color }}
          >
            {icon}
          </div>
          <span className="text-sm font-semibold text-[#f1f5f9]">{label}</span>
        </div>
        <span
          className="text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 capitalize"
          style={{ background: `${color}18`, color }}
        >
          {verdict.rating}
        </span>
      </div>
      <ProgressBar value={verdict.score} color={color} height={4} animated />
      <p className="text-xs font-medium text-[#f1f5f9] mt-2.5 mb-1">{verdict.headline}</p>
      <p className="text-xs text-[#64748b] leading-relaxed">{verdict.detail}</p>
    </Card>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div
      className="flex items-center justify-center rounded-full font-black flex-shrink-0 text-2xl"
      style={{ width: 72, height: 72, background: `${color}18`, border: `2px solid ${color}40`, color }}
    >
      {score}
    </div>
  )
}

function FundCard({ ticker, onClick, active }: { ticker: string; onClick: () => void; active: boolean }) {
  const fund = FUND_DB[ticker]
  const analysis = useMemo(() => analyzeFund(ticker), [ticker])
  if (!fund || !analysis) return null
  const risk = RISK_LABELS[analysis.riskRating]
  const retColor = fund.return1y >= 0 ? '#10b981' : '#ef4444'

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-3 rounded-[10px] border transition-all duration-150',
        active
          ? 'border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.08)]'
          : 'border-[#1e1e3a] bg-[#0f0f1a] hover:border-[#2d2d4a] hover:bg-[#12121e]',
      )}
    >
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#f1f5f9]">{ticker}</span>
          <span
            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}
          >
            {FUND_TYPE_LABELS[fund.type]}
          </span>
        </div>
        <span className="text-sm font-bold" style={{ color: retColor }}>
          {fund.return1y >= 0 ? '+' : ''}{(fund.return1y * 100).toFixed(1)}%
        </span>
      </div>
      <p className="text-[11px] text-[#64748b] truncate mb-2">{fund.name}</p>
      <div className="flex items-center justify-between">
        <span className="text-[10px]" style={{ color: risk.color }}>{risk.label}</span>
        <span className="text-[10px] text-[#64748b]">{(fund.expenseRatio * 100).toFixed(3)}% fee</span>
      </div>
    </button>
  )
}

function HoldingsTable({ holdings }: { holdings: ReturnType<typeof analyzeFund>['fund']['topHoldings'] }) {
  return (
    <div className="space-y-1.5">
      {holdings.map((h, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="text-[11px] text-[#64748b] w-4 flex-shrink-0 text-right">{i + 1}</span>
          <span className="text-xs font-mono font-bold text-[#60a5fa] w-14 flex-shrink-0">{h.ticker}</span>
          <span className="text-xs text-[#94a3b8] flex-1 truncate">{h.name}</span>
          <ProgressBar value={h.weight * 100} height={4} color="#3b82f6" animated />
          <span className="text-xs text-[#f1f5f9] w-10 text-right flex-shrink-0">
            {(h.weight * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function FundAnalysisPage() {
  const [selected, setSelected] = useState<string>('VTI')
  const [searchQuery, setSearchQuery] = useState('')

  const analysis = useMemo(() => analyzeFund(selected), [selected])

  const filteredTickers = useMemo(() => {
    if (!searchQuery.trim()) return FUND_TICKERS
    const q = searchQuery.toUpperCase()
    return FUND_TICKERS.filter(t =>
      t.includes(q) || FUND_DB[t]?.name.toUpperCase().includes(q) || FUND_DB[t]?.category.toUpperCase().includes(q)
    )
  }, [searchQuery])

  if (!analysis) return null
  const { fund } = analysis
  const risk = RISK_LABELS[analysis.riskRating]

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">

      {/* ── Sidebar: Fund list ── */}
      <div
        className="w-[240px] flex-shrink-0 flex flex-col border-r border-[#1e1e3a] overflow-hidden"
        style={{ background: '#09090f' }}
      >
        {/* Header */}
        <div className="p-3 border-b border-[#1e1e3a]">
          <h2 className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-2">Funds</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-[#0f0f1a] border border-[#1e1e3a] rounded-[8px] pl-8 pr-3 py-1.5 text-xs text-[#f1f5f9] placeholder-[#475569] outline-none focus:border-[rgba(59,130,246,0.4)]"
            />
          </div>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredTickers.map(ticker => (
            <FundCard
              key={ticker}
              ticker={ticker}
              onClick={() => setSelected(ticker)}
              active={selected === ticker}
            />
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selected}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="p-4 md:p-6 space-y-5"
          >

            {/* ── Fund hero ── */}
            <div
              className="relative overflow-hidden rounded-[16px] border border-[#1e1e3a] p-5 md:p-6"
              style={{ background: 'linear-gradient(135deg, #09090f 0%, #0f0f1a 100%)' }}
            >
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 80% 20%, #3b82f660 0%, transparent 60%)' }}
              />
              <div className="relative flex flex-wrap items-start gap-5">
                {/* Identity */}
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-2xl font-black text-[#f1f5f9]">{fund.ticker}</span>
                    <Badge variant="info" size="sm">{FUND_TYPE_LABELS[fund.type]}</Badge>
                    <Badge variant="ghost" size="sm">{fund.category}</Badge>
                    {fund.style && (
                      <span
                        className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full capitalize"
                        style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                      >
                        {fund.style}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#94a3b8] mb-1">{fund.name}</p>
                  <p className="text-[11px] text-[#64748b]">{fund.provider} · Inception {fund.inceptionYear} · {fund.holdingCount.toLocaleString()} holdings</p>
                </div>

                {/* Score */}
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <ScoreRing score={analysis.overallScore} size={72} strokeWidth={6} label="Score" />
                  </div>
                  <div className="space-y-1">
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wider">Risk Level</p>
                      <p className="text-sm font-semibold" style={{ color: risk.color }}>{risk.label}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wider">AUM</p>
                      <p className="text-sm font-semibold text-[#f1f5f9]">${fmtBig(fund.aum * 1e9)}</p>
                    </div>
                  </div>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 w-full">
                  {[
                    { label: 'Price', value: `$${fmt(fund.price)}` },
                    { label: 'Expense Ratio', value: `${(fund.expenseRatio * 100).toFixed(3)}%`, highlight: fund.expenseRatio < 0.002 },
                    { label: '1Y Return', value: `${fund.return1y >= 0 ? '+' : ''}${(fund.return1y * 100).toFixed(1)}%`, color: fund.return1y >= 0 ? '#10b981' : '#ef4444' },
                    { label: '5Y Return', value: `${fund.return5y >= 0 ? '+' : ''}${(fund.return5y * 100).toFixed(1)}%`, color: fund.return5y >= 0 ? '#10b981' : '#ef4444' },
                    { label: 'Dividend', value: `${(fund.dividendYield * 100).toFixed(2)}%` },
                  ].map(m => (
                    <div key={m.label} className="p-2.5 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-0.5">{m.label}</p>
                      <p
                        className="text-sm font-bold"
                        style={{ color: m.color ?? (m.highlight ? '#10b981' : '#f1f5f9') }}
                      >
                        {m.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <p className="w-full text-xs text-[#64748b] leading-relaxed">{fund.description}</p>
              </div>
            </div>

            {/* ── Four verdicts ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
              <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
                <VerdictCard verdict={analysis.verdicts.fee} label="Fees" icon={<DollarSign className="w-4 h-4" />} />
              </motion.div>
              <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
                <VerdictCard verdict={analysis.verdicts.diversification} label="Diversification" icon={<Layers className="w-4 h-4" />} />
              </motion.div>
              <motion.div custom={2} initial="hidden" animate="visible" variants={FADE_UP}>
                <VerdictCard verdict={analysis.verdicts.performance} label="Performance" icon={<TrendingUp className="w-4 h-4" />} />
              </motion.div>
              <motion.div custom={3} initial="hidden" animate="visible" variants={FADE_UP}>
                <VerdictCard verdict={analysis.verdicts.risk} label="Risk Profile" icon={<Shield className="w-4 h-4" />} />
              </motion.div>
            </div>

            {/* ── Returns + Radar ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Returns chart */}
              <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Historical Returns</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={[
                        { period: 'YTD', value: fund.ytd * 100 },
                        { period: '1Y', value: fund.return1y * 100 },
                        { period: '3Y', value: fund.return3y * 100 },
                        { period: '5Y', value: fund.return5y * 100 },
                        { period: '10Y', value: fund.return10y * 100 },
                      ]}
                      margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                      <XAxis dataKey="period" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                      <Tooltip {...CHART_TOOLTIP} formatter={(v: number) => [`${v.toFixed(2)}%`, 'Return']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {[fund.ytd, fund.return1y, fund.return3y, fund.return5y, fund.return10y].map((v, i) => (
                          <Cell key={i} fill={v >= 0 ? '#10b981' : '#ef4444'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Radar */}
              <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Quality Radar</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <RadarChart data={analysis.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                      <PolarGrid stroke="#1e1e3a" />
                      <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                      <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.18} strokeWidth={2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>

            {/* ── Holdings + Sector ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top holdings */}
              <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">
                    Top Holdings
                    <span className="text-[#64748b] text-xs font-normal ml-2">({fund.holdingCount.toLocaleString()} total)</span>
                  </h3>
                  <HoldingsTable holdings={fund.topHoldings} />
                </Card>
              </motion.div>

              {/* Sector exposure */}
              <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Sector Exposure</h3>
                  <ResponsiveContainer width="100%" height={160}>
                    <BarChart
                      data={fund.sectorExposure.slice(0, 8)}
                      layout="vertical"
                      margin={{ left: 8, right: 40, top: 0, bottom: 0 }}
                    >
                      <XAxis type="number" hide domain={[0, 1]} />
                      <YAxis type="category" dataKey="sector" tick={{ fill: '#64748b', fontSize: 10 }} width={120} />
                      <Tooltip {...CHART_TOOLTIP} formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Weight']} />
                      <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                        {fund.sectorExposure.slice(0, 8).map((s, i) => (
                          <Cell key={i} fill={s.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>

            {/* ── Geography + Fee Impact ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Geographic */}
              <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card>
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#3b82f6]" />
                    Geographic Exposure
                  </h3>
                  <div className="space-y-3">
                    {fund.geoExposure.map(g => (
                      <div key={g.region}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-[#94a3b8] flex items-center gap-1.5">
                            <span>{g.flag}</span>
                            {g.region}
                          </span>
                          <span className="text-[#f1f5f9] font-medium">{(g.weight * 100).toFixed(1)}%</span>
                        </div>
                        <ProgressBar value={g.weight * 100} color={g.color} height={5} animated />
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>

              {/* Fee impact */}
              <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card>
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-1 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#3b82f6]" />
                    Fee Impact on $10,000
                  </h3>
                  <p className="text-[11px] text-[#64748b] mb-4">Assumes 9% gross annual return</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={analysis.feeImpact} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3a" />
                      <XAxis dataKey="years" tick={{ fill: '#64748b', fontSize: 11 }} unit="y" />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        {...CHART_TOOLTIP}
                        formatter={(v: number, name: string) => [
                          `$${v.toLocaleString()}`,
                          name === 'grossBalance' ? 'Without fees' : 'Net of fees',
                        ]}
                      />
                      <Line type="monotone" dataKey="grossBalance" stroke="#64748b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="grossBalance" />
                      <Line type="monotone" dataKey="netBalance" stroke="#3b82f6" strokeWidth={2} dot={false} name="netBalance" />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {analysis.feeImpact.filter(r => [5, 10, 30].includes(r.years)).map(r => (
                      <div key={r.years} className="p-2 rounded-[8px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <p className="text-[10px] text-[#64748b] mb-0.5">{r.years}Y fee drag</p>
                        <p className="text-xs font-bold text-[#ef4444]">-${r.feeDrag.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* ── Risk metrics row ── */}
            <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
              <Card>
                <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Risk Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: 'Beta', value: fund.beta.toFixed(2), sub: 'vs S&P 500', color: fund.beta > 1.3 ? '#ef4444' : fund.beta < 0.7 ? '#10b981' : '#f1f5f9' },
                    { label: 'Sharpe Ratio', value: fund.sharpe.toFixed(2), sub: 'risk-adjusted return', color: fund.sharpe > 0.7 ? '#10b981' : fund.sharpe < 0.3 ? '#ef4444' : '#f59e0b' },
                    { label: 'Std Dev', value: `${(fund.stdDev * 100).toFixed(1)}%`, sub: 'annualized volatility', color: '#f1f5f9' },
                    { label: 'Max Drawdown', value: `${(fund.maxDrawdown * 100).toFixed(1)}%`, sub: 'historical worst', color: '#ef4444' },
                    ...(fund.trackingError != null ? [{ label: 'Tracking Error', value: `${(fund.trackingError * 100).toFixed(2)}%`, sub: 'vs benchmark', color: '#f1f5f9' }] : []),
                    { label: 'Dividend Yield', value: `${(fund.dividendYield * 100).toFixed(2)}%`, sub: 'trailing 12mo', color: fund.dividendYield > 0.025 ? '#10b981' : '#f1f5f9' },
                  ].map(m => (
                    <div key={m.label} className="p-3 rounded-[10px]" style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-0.5">{m.label}</p>
                      <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                      <p className="text-[10px] text-[#475569] mt-0.5">{m.sub}</p>
                    </div>
                  ))}
                </div>
                {fund.benchmarkIndex && (
                  <p className="text-xs text-[#64748b] mt-3">
                    Benchmark: <span className="text-[#94a3b8]">{fund.benchmarkIndex}</span>
                  </p>
                )}
              </Card>
            </motion.div>

            {/* ── Who should / shouldn't own it ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#10b981] flex items-center gap-2 mb-3">
                    <CircleCheck className="w-4 h-4" />
                    Best suited for
                  </h3>
                  <ul className="space-y-2">
                    {analysis.suitableFor.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <ChevronRight className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
              <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#ef4444] flex items-center gap-2 mb-3">
                    <XCircle className="w-4 h-4" />
                    Not suited for
                  </h3>
                  <ul className="space-y-2">
                    {analysis.notSuitableFor.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <ChevronRight className="w-3.5 h-3.5 text-[#ef4444] flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            </div>

            {/* ── Strengths + Weaknesses + Alternatives ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">Strengths</h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#94a3b8]">
                        <CircleCheck className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0 mt-0.5" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
              <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">Weaknesses</h3>
                  <ul className="space-y-2">
                    {analysis.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[#94a3b8]">
                        <TriangleAlert className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                        {w}
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
              <motion.div custom={2} initial="hidden" animate="visible" variants={FADE_UP}>
                <Card className="h-full">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">Consider Also</h3>
                  <ul className="space-y-3">
                    {analysis.alternatives.map((alt, i) => (
                      <li key={i}>
                        <button
                          onClick={() => setSelected(alt.ticker)}
                          className="w-full text-left group"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-mono font-bold text-[#60a5fa] group-hover:text-[#93c5fd]">
                              {alt.ticker}
                            </span>
                            <ChevronRight className="w-3 h-3 text-[#64748b] group-hover:text-[#94a3b8]" />
                          </div>
                          <p className="text-[11px] text-[#64748b]">{alt.reason}</p>
                        </button>
                      </li>
                    ))}
                    {analysis.alternatives.length === 0 && (
                      <li className="text-xs text-[#64748b]">No direct alternatives identified.</li>
                    )}
                  </ul>
                </Card>
              </motion.div>
            </div>

          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
