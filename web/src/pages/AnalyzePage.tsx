import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, Star, ChevronDown, ChevronUp, Info } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar, ScoreRing } from '@/components/ui/Progress'
import { STOCK_MOCK } from '@/data/mock'
import { fmt, fmtPct, cn } from '@/lib/utils'

const CATEGORY_SCORES = {
  Quality: 82,
  Valuation: 61,
  Growth: 78,
  Health: 74,
  Cashflow: 85,
  Momentum: 71,
}

function ScoreBar({ label, score, expandable }: { label: string; score: number; expandable?: boolean }) {
  const [open, setOpen] = useState(false)
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const definitions: Record<string, string> = {
    Quality: 'Measures ROE, margins, and operational efficiency. Higher means the business generates strong returns on its resources.',
    Valuation: 'How expensive the stock is vs its earnings, book value, and cash flow. Lower P/E, PEG, and EV/EBITDA mean better value.',
    Growth: 'Revenue and earnings growth trajectory. Consistent double-digit growth commands a premium.',
    Health: 'Balance sheet strength — debt levels, liquidity, and ability to survive a downturn.',
    Cashflow: 'Free cash flow generation and quality of earnings. Cash is harder to fake than reported profit.',
    Momentum: 'Price and earnings momentum over recent periods. Trend-following component.',
  }
  return (
    <div>
      <div
        className="flex items-center gap-3 cursor-pointer group py-2"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-sm text-[#94a3b8] w-24 flex-shrink-0">{label}</span>
        <div className="flex-1">
          <ProgressBar value={score} color={color} />
        </div>
        <span className="text-sm font-semibold w-10 text-right" style={{ color }}>{score}</span>
        {expandable && (
          open ? <ChevronUp className="w-3.5 h-3.5 text-[#64748b]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />
        )}
      </div>
      {expandable && open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="ml-28 mb-2 text-xs text-[#64748b] leading-relaxed"
        >
          {definitions[label]}
        </motion.div>
      )}
    </div>
  )
}

function MetricRow({ label, value, benchmark, goodRange, info }: {
  label: string; value: string; benchmark?: string; goodRange?: string; info?: string
}) {
  const [showInfo, setShowInfo] = useState(false)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1e1e3a] last:border-0 group">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#94a3b8]">{label}</span>
        {info && (
          <button
            onClick={() => setShowInfo(s => !s)}
            className="text-[#334155] hover:text-[#64748b] transition-colors cursor-pointer"
          >
            <Info className="w-3 h-3" />
          </button>
        )}
      </div>
      <div className="text-right">
        <span className="text-sm font-medium text-[#f1f5f9]">{value}</span>
        {goodRange && <p className="text-[10px] text-[#64748b]">Good: {goodRange}</p>}
      </div>
    </div>
  )
}

export function AnalyzePage() {
  const [ticker, setTicker] = useState('')
  const [activeTicker, setActiveTicker] = useState<string | null>('AAPL')
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'valuation' | 'technicals'>('overview')

  function handleSearch() {
    const t = ticker.trim().toUpperCase()
    if (t) setActiveTicker(t)
  }

  const stock = activeTicker ? STOCK_MOCK[activeTicker] : null

  const TABS = ['overview', 'quality', 'valuation', 'technicals'] as const

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] mb-1 flex items-center gap-2">
          <Search className="w-5 h-5 text-[#3b82f6]" />
          Stock Intelligence
        </h1>
        <p className="text-[#64748b] text-sm">Deep-dive analysis personalized to your investor DNA</p>
      </div>

      {/* Search */}
      <div className="flex gap-3 max-w-lg">
        <Input
          placeholder="Enter ticker (AAPL, MSFT, NVDA...)"
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          icon={<Search className="w-4 h-4" />}
        />
        <Button onClick={handleSearch} className="flex-shrink-0">Analyze</Button>
      </div>

      {/* Quick picks */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-[#64748b] self-center">Quick pick:</span>
        {Object.keys(STOCK_MOCK).map(t => (
          <button
            key={t}
            onClick={() => setActiveTicker(t)}
            className={cn(
              'text-xs px-3 py-1.5 rounded-[6px] border transition-all cursor-pointer',
              activeTicker === t
                ? 'bg-[rgba(59,130,246,0.15)] border-[#3b82f6] text-[#60a5fa]'
                : 'bg-[#0f0f1a] border-[#1e1e3a] text-[#64748b] hover:border-[#252545]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {!stock && (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-[#1e1e3a] mx-auto mb-4" />
          <p className="text-[#64748b]">Enter a ticker symbol to analyze a stock</p>
          <p className="text-xs text-[#334155] mt-1">Try AAPL or MSFT to see a demo</p>
        </div>
      )}

      {stock && (
        <motion.div
          key={activeTicker}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Header card */}
          <div className="glass-card p-5">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h2 className="text-xl font-bold text-[#f1f5f9]">{stock.name}</h2>
                  <Badge variant="ghost">{activeTicker}</Badge>
                  <Badge variant="info">{stock.sector}</Badge>
                </div>
                <p className="text-sm text-[#64748b] leading-relaxed max-w-2xl">{stock.summary}</p>
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#f1f5f9]">${fmt(stock.price)}</p>
                  <p className="text-sm text-[#10b981]">+1.24% today</p>
                  <p className="text-xs text-[#64748b] mt-0.5">Target: ${stock.analyst_target}</p>
                </div>
                <ScoreRing score={stock.score} size={80} label="Score" />
              </div>
            </div>
          </div>

          {/* Suitability banner */}
          <div className="rounded-[12px] p-4 border"
            style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-sm text-[#94a3b8]">
              <span className="font-semibold text-[#60a5fa]">Your DNA match:</span>{' '}
              {stock.score >= 70
                ? `Suitable for your ${stock.sector.toLowerCase()} interest and growth-oriented profile. High beta (${stock.beta}) aligns with your growth risk tolerance.`
                : `Partial fit. Strong quality metrics but high valuation may not suit a conservative profile.`
              }
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-[12px] bg-[#0f0f1a] border border-[#1e1e3a] w-fit">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 rounded-[8px] text-sm font-medium transition-all cursor-pointer capitalize',
                  activeTab === tab ? 'bg-[#3b82f6] text-white' : 'text-[#64748b] hover:text-[#94a3b8]',
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Score breakdown */}
              <div className="glass-card p-5 lg:col-span-2">
                <h3 className="font-semibold text-[#f1f5f9] mb-4">Score Breakdown</h3>
                <div className="space-y-1">
                  {Object.entries(CATEGORY_SCORES).map(([cat, score]) => (
                    <ScoreBar key={cat} label={cat} score={score} expandable />
                  ))}
                </div>
              </div>

              {/* Radar */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-4">Profile Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={Object.entries(CATEGORY_SCORES).map(([k, v]) => ({ metric: k, value: v }))}>
                    <PolarGrid stroke="#1e1e3a" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} dot />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bull/Bear */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10b981]" />
                  Bull Case
                </h3>
                <ul className="space-y-2">
                  {stock.bull.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                      <span className="text-[#10b981] mt-0.5 flex-shrink-0">+</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#ef4444]" />
                  Bear Case
                </h3>
                <ul className="space-y-2">
                  {stock.bear.map((b, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                      <span className="text-[#ef4444] mt-0.5 flex-shrink-0">-</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Key metrics */}
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-3">Key Metrics</h3>
                <MetricRow label="Revenue Growth" value={fmtPct(stock.revenue_growth)} goodRange=">10%" info="YoY revenue growth rate" />
                <MetricRow label="P/E Ratio" value={fmt(stock.pe)} goodRange="10-25" info="Price to earnings" />
                <MetricRow label="PEG Ratio" value={fmt(stock.peg)} goodRange="<2" info="P/E adjusted for growth" />
                <MetricRow label="ROE" value={fmtPct(stock.roe)} goodRange=">15%" />
                <MetricRow label="Operating Margin" value={fmtPct(stock.operating_margin)} goodRange=">15%" />
                <MetricRow label="Beta" value={fmt(stock.beta)} goodRange="0.8-1.2" />
              </div>
            </div>
          )}

          {/* Quality tab */}
          {activeTab === 'quality' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'ROE', value: fmtPct(stock.roe), good: '>15%', desc: 'Return on shareholder equity. High is better, but check if driven by debt.' },
                { label: 'Operating Margin', value: fmtPct(stock.operating_margin), good: '>15%', desc: 'Revenue that becomes operating profit after running costs.' },
                { label: 'Revenue Growth', value: fmtPct(stock.revenue_growth), good: '>10% YoY', desc: 'Year-over-year top line growth. Consistency matters more than one-off spikes.' },
                { label: 'Earnings Growth', value: fmtPct(stock.earnings_growth), good: '>10% YoY', desc: 'How fast net profit is growing. Watch for cost-cutting vs genuine expansion.' },
                { label: 'Debt / Equity', value: fmt(stock.debt_to_equity), good: '<1.0', desc: 'Leverage ratio. Higher means more fragile in a downturn or rising rate cycle.' },
              ].map(m => (
                <Card key={m.label}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">{m.label}</p>
                      <p className="text-2xl font-bold text-[#f1f5f9]">{m.value}</p>
                    </div>
                    <Badge variant="success" size="sm">Good: {m.good}</Badge>
                  </div>
                  <p className="text-xs text-[#64748b] leading-relaxed">{m.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Valuation tab */}
          {activeTab === 'valuation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'P/E Ratio', value: fmt(stock.pe), good: '10-25', desc: 'Price per $1 of annual earnings. Negative = no profit. Compare to sector peers.' },
                { label: 'PEG Ratio', value: fmt(stock.peg), good: '<2.0', desc: 'P/E normalized for growth. Under 1 is often "cheap for how fast it is growing".' },
                { label: 'Analyst Target', value: `$${stock.analyst_target}`, good: `vs $${fmt(stock.price)}`, desc: `Average analyst price target implies ${fmtPct((stock.analyst_target - stock.price) / stock.price)} upside from current price.` },
                { label: 'Dividend Yield', value: fmtPct(stock.dividend_yield), good: 'Context-dependent', desc: 'Annual dividend as a % of price. Zero is not bad — many great growth firms reinvest.' },
              ].map(m => (
                <Card key={m.label}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">{m.label}</p>
                      <p className="text-2xl font-bold text-[#f1f5f9]">{m.value}</p>
                    </div>
                    <Badge variant="info" size="sm">{m.good}</Badge>
                  </div>
                  <p className="text-xs text-[#64748b] leading-relaxed">{m.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Technicals tab */}
          {activeTab === 'technicals' && (
            <div className="glass-card p-6">
              <div className="text-center py-10">
                <Star className="w-10 h-10 text-[#f59e0b] mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Technical Analysis</h3>
                <p className="text-sm text-[#64748b] max-w-md mx-auto">
                  RSI, MACD, Bollinger Bands, Stochastic, and Momentum indicators. Powered by live price data in the full version.
                </p>
                <Badge variant="warning" className="mt-3">Live data integration in progress</Badge>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
