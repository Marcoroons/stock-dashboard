import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, Star, ChevronDown, ChevronUp, Info, ExternalLink } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
} from 'recharts'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { ProgressBar, ScoreRing } from '@/components/ui/Progress'
import { LoadingSpinner } from '@/components/ui/Skeleton'
import { STOCK_MOCK } from '@/data/mock'
import { fmt, cn } from '@/lib/utils'
import {
  fetchStockAnalysis,
  fmtMarketCap, fmtChange,
  type StockAnalysis,
} from '@/lib/market-data'

// ─── Popular tickers ──────────────────────────────────────────────────────────
const POPULAR = ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA', 'JPM', 'BRK.B', 'VTI']

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ label, score, expandable }: { label: string; score: number; expandable?: boolean }) {
  const [open, setOpen] = useState(false)
  const color = score >= 70 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444'
  const definitions: Record<string, string> = {
    Quality:   'Measures ROE, margins, and operational efficiency. Higher means the business generates strong returns on its resources.',
    Valuation: 'How expensive the stock is vs earnings, book value, and cash flow. Lower P/E and PEG mean better value.',
    Growth:    'Revenue and earnings growth trajectory. Consistent double-digit growth commands a premium.',
    Health:    'Balance sheet strength — debt levels, liquidity, and ability to survive a downturn.',
    Cashflow:  'Free cash flow generation and quality of earnings. Cash is harder to fake than reported profit.',
    Momentum:  '52-week price return and near-term price trend. Trend-following component.',
  }
  return (
    <div>
      <div className="flex items-center gap-3 cursor-pointer group py-2" onClick={() => setOpen(o => !o)}>
        <span className="text-sm text-[#94a3b8] w-24 flex-shrink-0">{label}</span>
        <div className="flex-1"><ProgressBar value={score} color={color} /></div>
        <span className="text-sm font-semibold w-10 text-right" style={{ color }}>{score}</span>
        {expandable && (open ? <ChevronUp className="w-3.5 h-3.5 text-[#64748b]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#64748b]" />)}
      </div>
      {expandable && open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="ml-28 mb-2 text-xs text-[#64748b] leading-relaxed"
        >
          {definitions[label]}
        </motion.div>
      )}
    </div>
  )
}

function MetricRow({ label, value, goodRange, info }: { label: string; value: string; goodRange?: string; info?: string }) {
  const [showInfo, setShowInfo] = useState(false)
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[#1e1e3a] last:border-0">
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#94a3b8]">{label}</span>
        {info && (
          <button onClick={() => setShowInfo(s => !s)} className="text-[#334155] hover:text-[#64748b] transition-colors cursor-pointer">
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

function RecommendBar({ recommend }: { recommend: StockAnalysis['recommend'] }) {
  if (!recommend?.length) return null
  const latest = recommend[0]
  const total = (latest.strongBuy + latest.buy + latest.hold + latest.sell + latest.strongSell) || 1
  const bullPct = ((latest.strongBuy + latest.buy) / total) * 100
  const bearPct = ((latest.strongSell + latest.sell) / total) * 100
  return (
    <div>
      <p className="text-[10px] text-[#475569] uppercase tracking-wider mb-2 font-semibold">Analyst Consensus</p>
      <div className="flex rounded-full overflow-hidden h-2 mb-2">
        <div className="bg-[#10b981]" style={{ width: `${(latest.strongBuy / total) * 100}%` }} />
        <div className="bg-[#34d399]" style={{ width: `${(latest.buy / total) * 100}%` }} />
        <div className="bg-[#64748b]" style={{ width: `${(latest.hold / total) * 100}%` }} />
        <div className="bg-[#f87171]" style={{ width: `${(latest.sell / total) * 100}%` }} />
        <div className="bg-[#ef4444]" style={{ width: `${(latest.strongSell / total) * 100}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-[#475569]">
        <span className="text-[#10b981]">{latest.strongBuy + latest.buy} Buy ({bullPct.toFixed(0)}%)</span>
        <span>{latest.hold} Hold</span>
        <span className="text-[#ef4444]">{latest.strongSell + latest.sell} Sell ({bearPct.toFixed(0)}%)</span>
      </div>
    </div>
  )
}

function LiveTag() {
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(16,185,129,0.12)] text-[#10b981] border border-[rgba(16,185,129,0.25)]">
      <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
      Live
    </span>
  )
}

function safeMetric(v: number | undefined, suffix = '', decimals = 1): string {
  if (v == null || isNaN(v)) return 'N/A'
  return `${v.toFixed(decimals)}${suffix}`
}

// ─── Main page ────────────────────────────────────────────────────────────────

export function AnalyzePage() {
  const [ticker, setTicker] = useState('')
  const [activeTicker, setActiveTicker] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'quality' | 'valuation' | 'technicals'>('overview')
  const [liveData, setLiveData] = useState<StockAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLive, setIsLive] = useState(false)

  const loadStock = useCallback(async (sym: string) => {
    const clean = sym.trim().toUpperCase()
    if (!clean) return
    setActiveTicker(clean)
    setActiveTab('overview')
    setLoading(true)
    setError(null)
    setLiveData(null)
    setIsLive(false)
    try {
      const data = await fetchStockAnalysis(clean)
      setLiveData(data)
      setIsLive(true)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load'
      const isKeyMissing = msg.includes('FINNHUB_API_KEY') || msg.includes('not configured')
      setError(isKeyMissing
        ? 'Live data not yet configured — add your Finnhub API key to enable real-time analysis.'
        : `Could not load ${clean}. ${msg.includes('mock') ? '' : 'Showing demo data for known tickers.'}`)
    } finally {
      setLoading(false)
    }
  }, [])

  function handleSearch() {
    const t = ticker.trim().toUpperCase()
    if (t) loadStock(t)
  }

  // Build display data: live if available, mock fallback for known tickers
  const mockStock = activeTicker ? STOCK_MOCK[activeTicker] : null
  const stock: StockAnalysis | null = liveData ?? (mockStock ? {
    symbol: activeTicker!,
    score: mockStock.score,
    categoryScores: { Quality: 82, Growth: 78, Valuation: 61, Health: 74, Cashflow: 85, Momentum: 71 },
    bull: mockStock.bull,
    bear: mockStock.bear,
    summary: mockStock.summary,
    quote: { c: mockStock.price, d: 0, dp: 1.24, h: 0, l: 0, o: 0, pc: 0, t: 0 },
    profile: {
      name: mockStock.name, ticker: activeTicker!, finnhubIndustry: mockStock.sector,
      marketCapitalization: 0, logo: '', country: 'US', currency: 'USD',
      exchange: 'NASDAQ', ipo: '', shareOutstanding: 0, weburl: '',
    },
    metrics: {
      metric: {
        peBasicExclExtraTTM: mockStock.pe, pegFY1: mockStock.peg,
        roeRfy: mockStock.roe * 100, operatingMarginTTM: mockStock.operating_margin * 100,
        revenueGrowthTTMYoy: mockStock.revenue_growth * 100,
        epsGrowthTTMYoy: mockStock.earnings_growth * 100,
        beta: mockStock.beta, 'totalDebt/totalEquityAnnual': mockStock.debt_to_equity,
        dividendYieldIndicatedAnnual: mockStock.dividend_yield * 100,
      },
    },
    recommend: [],
  } : null)

  const m = stock?.metrics?.metric ?? {}
  const TABS = ['overview', 'quality', 'valuation', 'technicals'] as const

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] mb-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-[#3b82f6]" />
            Stock Intelligence
          </h1>
          <p className="text-[#64748b] text-sm">Deep-dive analysis powered by live market data</p>
        </div>
        {isLive && <LiveTag />}
      </div>

      <div className="flex gap-3 max-w-lg">
        <Input
          placeholder="Enter ticker (AAPL, MSFT, NVDA…)"
          value={ticker}
          onChange={e => setTicker(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
          icon={<Search className="w-4 h-4" />}
        />
        <Button onClick={handleSearch} disabled={loading} className="flex-shrink-0">
          {loading ? <LoadingSpinner size="sm" /> : 'Analyze'}
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-[#64748b] self-center">Quick:</span>
        {POPULAR.map(t => (
          <button
            key={t}
            onClick={() => loadStock(t)}
            disabled={loading}
            className={cn(
              'text-xs px-3 py-1.5 rounded-[6px] border transition-all cursor-pointer disabled:opacity-40',
              activeTicker === t
                ? 'bg-[rgba(59,130,246,0.15)] border-[#3b82f6] text-[#60a5fa]'
                : 'bg-[#0f0f1a] border-[#1e1e3a] text-[#64748b] hover:border-[#252545]',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-[10px] bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.25)] px-4 py-3">
          <p className="text-xs text-[#f59e0b]">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-sm text-[#64748b]">Fetching live data for {activeTicker}…</p>
          </div>
        </div>
      )}

      {!loading && !stock && (
        <div className="text-center py-20">
          <Search className="w-12 h-12 text-[#1e1e3a] mx-auto mb-4" />
          <p className="text-[#64748b]">Enter a ticker symbol to analyze a stock</p>
          <p className="text-xs text-[#334155] mt-1">Try AAPL or NVDA for live analysis</p>
        </div>
      )}

      {!loading && stock && (
        <motion.div key={activeTicker} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          {/* Header */}
          <div className="glass-card p-5">
            <div className="flex items-start gap-5 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  {stock.profile.logo && (
                    <img
                      src={stock.profile.logo}
                      alt={stock.profile.name}
                      className="w-8 h-8 rounded-[8px] object-contain bg-white/5"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  )}
                  <h2 className="text-xl font-bold text-[#f1f5f9]">{stock.profile.name}</h2>
                  <Badge variant="ghost">{activeTicker}</Badge>
                  <Badge variant="info">{stock.profile.finnhubIndustry}</Badge>
                  {isLive && <LiveTag />}
                </div>
                <p className="text-sm text-[#64748b] leading-relaxed max-w-2xl">{stock.summary}</p>
                {stock.profile.marketCapitalization > 0 && (
                  <div className="flex gap-4 mt-3 flex-wrap">
                    <span className="text-xs text-[#475569]">Market cap: <span className="text-[#94a3b8] font-medium">{fmtMarketCap(stock.profile.marketCapitalization)}</span></span>
                    {stock.profile.exchange && <span className="text-xs text-[#475569]">Exchange: <span className="text-[#94a3b8] font-medium">{stock.profile.exchange}</span></span>}
                    {stock.profile.weburl && (
                      <a href={stock.profile.weburl} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-[#3b82f6] hover:text-[#60a5fa] flex items-center gap-1 transition-colors"
                      >
                        Website <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-6 flex-shrink-0">
                <div className="text-right">
                  <p className="text-3xl font-bold text-[#f1f5f9]">${fmt(stock.quote.c)}</p>
                  <p className={cn('text-sm font-medium', stock.quote.dp >= 0 ? 'text-[#10b981]' : 'text-[#ef4444]')}>
                    {fmtChange(stock.quote.dp)} today
                  </p>
                  {stock.quote.h > 0 && (
                    <p className="text-xs text-[#64748b] mt-0.5">H ${fmt(stock.quote.h)} · L ${fmt(stock.quote.l)}</p>
                  )}
                </div>
                <ScoreRing score={stock.score} size={80} label="Score" />
              </div>
            </div>
          </div>

          {stock.recommend?.length > 0 && (
            <div className="glass-card p-4"><RecommendBar recommend={stock.recommend} /></div>
          )}

          <div className="rounded-[12px] p-4 border" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <p className="text-sm text-[#94a3b8]">
              <span className="font-semibold text-[#60a5fa]">Your DNA match: </span>
              {stock.score >= 70
                ? `Strong fit for your growth-oriented profile. ${stock.profile.finnhubIndustry} sector aligns with your interests.`
                : stock.score >= 50
                ? `Partial fit. Good fundamentals but valuation or growth warrants careful consideration.`
                : `Moderate fit. Review against your risk tolerance and investment timeline.`}
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

          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="glass-card p-5 lg:col-span-2">
                <h3 className="font-semibold text-[#f1f5f9] mb-4">Score Breakdown</h3>
                <div className="space-y-1">
                  {Object.entries(stock.categoryScores).map(([cat, score]) => (
                    <ScoreBar key={cat} label={cat} score={score} expandable />
                  ))}
                </div>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-4">Profile Radar</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={Object.entries(stock.categoryScores).map(([k, v]) => ({ metric: k, value: v }))}>
                    <PolarGrid stroke="#1e1e3a" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} dot />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#10b981]" /> Bull Case
                </h3>
                {stock.bull.length > 0 ? (
                  <ul className="space-y-2">
                    {stock.bull.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <span className="text-[#10b981] mt-0.5 flex-shrink-0">+</span>{b}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-[#475569]">Insufficient data for bull case generation.</p>}
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[#ef4444]" /> Bear Case
                </h3>
                {stock.bear.length > 0 ? (
                  <ul className="space-y-2">
                    {stock.bear.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                        <span className="text-[#ef4444] mt-0.5 flex-shrink-0">−</span>{b}
                      </li>
                    ))}
                  </ul>
                ) : <p className="text-xs text-[#475569]">No significant risk factors detected.</p>}
              </div>
              <div className="glass-card p-5">
                <h3 className="font-semibold text-[#f1f5f9] mb-3">Key Metrics</h3>
                <MetricRow label="Revenue Growth" value={safeMetric(m.revenueGrowthTTMYoy, '%')} goodRange=">10%" info="YoY" />
                <MetricRow label="P/E Ratio"      value={safeMetric(m.peBasicExclExtraTTM, '', 1)} goodRange="10-25" />
                <MetricRow label="PEG Ratio"      value={safeMetric(m.pegFY1, '', 2)} goodRange="<2" />
                <MetricRow label="ROE"            value={safeMetric(m.roeRfy, '%')} goodRange=">15%" />
                <MetricRow label="Oper. Margin"   value={safeMetric(m.operatingMarginTTM, '%')} goodRange=">15%" />
                <MetricRow label="Beta"           value={safeMetric(m.beta, '', 2)} goodRange="0.8-1.2" />
              </div>
            </div>
          )}

          {/* Quality */}
          {activeTab === 'quality' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'ROE',              value: safeMetric(m.roeRfy, '%'), good: '>15%', desc: 'Return on shareholder equity. High is better, but check if driven by debt.' },
                { label: 'Operating Margin', value: safeMetric(m.operatingMarginTTM, '%'), good: '>15%', desc: 'Revenue that becomes operating profit after running costs.' },
                { label: 'Gross Margin',     value: safeMetric(m.grossMarginTTM, '%'), good: '>40%', desc: 'Revenue minus direct costs. High gross margins signal strong pricing power.' },
                { label: 'Revenue Growth',   value: safeMetric(m.revenueGrowthTTMYoy, '%'), good: '>10% YoY', desc: 'Year-over-year top-line growth. Consistency matters more than one-off spikes.' },
                { label: 'EPS Growth',       value: safeMetric(m.epsGrowthTTMYoy, '%'), good: '>10% YoY', desc: 'Earnings per share growth. Faster than revenue means improving margins.' },
                { label: 'Debt / Equity',    value: safeMetric(m['totalDebt/totalEquityAnnual'], '', 2), good: '<1.0', desc: 'Leverage ratio. Higher means more fragile in a rising rate cycle.' },
              ].map(item => (
                <Card key={item.label}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-2xl font-bold text-[#f1f5f9]">{item.value}</p>
                    </div>
                    <Badge variant="success" size="sm">Good: {item.good}</Badge>
                  </div>
                  <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Valuation */}
          {activeTab === 'valuation' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'P/E Ratio',    value: safeMetric(m.peBasicExclExtraTTM, '', 1), good: '10-25',  desc: 'Price per $1 of annual earnings. Compare to sector peers for context.' },
                { label: 'PEG Ratio',    value: safeMetric(m.pegFY1, '', 2),              good: '<2.0',   desc: 'P/E normalized for growth. Under 1 is often cheap relative to growth.' },
                { label: 'Price / Book', value: safeMetric(m.pbAnnual, 'x', 1),           good: '<3x',    desc: 'Price relative to net asset value. High P/B can indicate intangibles.' },
                { label: 'Price / Sales',value: safeMetric(m.psAnnual, 'x', 1),           good: '<5x',    desc: 'Useful for growth companies with minimal earnings. Compare within sector.' },
                { label: 'Div. Yield',   value: safeMetric(m.dividendYieldIndicatedAnnual, '%'), good: 'Contextual', desc: 'Annual dividend as % of price. Zero is fine — growth firms reinvest.' },
                { label: '52W Return',   value: safeMetric(m['52WeekPriceReturnDaily'], '%'), good: '>0%', desc: '52-week price return. Strong performance attracts momentum buyers.' },
              ].map(item => (
                <Card key={item.label}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-xs text-[#64748b] uppercase tracking-wider mb-0.5">{item.label}</p>
                      <p className="text-2xl font-bold text-[#f1f5f9]">{item.value}</p>
                    </div>
                    <Badge variant="info" size="sm">{item.good}</Badge>
                  </div>
                  <p className="text-xs text-[#64748b] leading-relaxed">{item.desc}</p>
                </Card>
              ))}
            </div>
          )}

          {/* Technicals */}
          {activeTab === 'technicals' && (
            <div className="glass-card p-6">
              {isLive ? (
                <div>
                  <h3 className="font-semibold text-[#f1f5f9] mb-4">Price Range & Market Stats</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: '52W High',    value: m['52WeekHigh'] != null ? `$${fmt(m['52WeekHigh'])}` : 'N/A' },
                      { label: '52W Low',     value: m['52WeekLow'] != null ? `$${fmt(m['52WeekLow'])}` : 'N/A' },
                      { label: 'Beta',        value: safeMetric(m.beta, '', 2) },
                      { label: '10D Avg Vol', value: m['10DayAverageTradingVolume'] != null ? `${(m['10DayAverageTradingVolume'] / 1e6).toFixed(1)}M` : 'N/A' },
                    ].map(stat => (
                      <div key={stat.label} className="rounded-[10px] bg-[#0f0f1a] border border-[#1e1e3a] p-3">
                        <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-1">{stat.label}</p>
                        <p className="text-sm font-bold text-[#f1f5f9]">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-[#475569] mt-4">RSI, MACD, and Bollinger Bands coming soon.</p>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Star className="w-10 h-10 text-[#f59e0b] mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-[#f1f5f9] mb-2">Technical Analysis</h3>
                  <p className="text-sm text-[#64748b] max-w-md mx-auto">
                    RSI, MACD, Bollinger Bands, and momentum indicators — powered by live price data.
                  </p>
                  <Badge variant="warning" className="mt-3">Search a ticker to see live data</Badge>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
