import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, TrendingUp, TrendingDown, Minus, Clock, Zap, ChevronDown, ChevronUp, ListFilter as Filter, TriangleAlert as AlertTriangle, ChartBar as BarChart2, Globe, RefreshCw } from 'lucide-react'
import { Card, Badge } from '@/components/ui'
import { ProgressBar } from '@/components/ui/Progress'
import { MOCK_NEWS, MOCK_HOLDINGS } from '@/data/mock'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Sentiment = 'bullish' | 'neutral' | 'bearish'
type Horizon = 'short' | 'medium' | 'long'
type Category = 'earnings' | 'macro' | 'product' | 'regulation' | 'legal' | 'strategy' | 'industry'

const SENTIMENT_CONFIG: Record<Sentiment, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  bullish: { label: 'Bullish', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <TrendingUp className="w-3.5 h-3.5" /> },
  neutral: { label: 'Neutral', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: <Minus className="w-3.5 h-3.5" /> },
  bearish: { label: 'Bearish', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', icon: <TrendingDown className="w-3.5 h-3.5" /> },
}

const HORIZON_CONFIG: Record<Horizon, { label: string; color: string }> = {
  short: { label: 'Near-term', color: '#f59e0b' },
  medium: { label: 'Medium-term', color: '#06b6d4' },
  long: { label: 'Long-term', color: '#8b5cf6' },
}

const CATEGORY_CONFIG: Record<Category, { label: string; color: string }> = {
  earnings: { label: 'Earnings', color: '#10b981' },
  macro: { label: 'Macro', color: '#3b82f6' },
  product: { label: 'Product', color: '#06b6d4' },
  regulation: { label: 'Regulation', color: '#ef4444' },
  legal: { label: 'Legal', color: '#f59e0b' },
  strategy: { label: 'Strategy', color: '#8b5cf6' },
  industry: { label: 'Industry', color: '#64748b' },
}

const PORTFOLIO_TICKERS = new Set(MOCK_HOLDINGS.map(h => h.ticker))

// ─── Compute aggregate sentiment ──────────────────────────────────────────────

function computeSentimentSummary(news: typeof MOCK_NEWS) {
  const bullCount = news.filter(n => n.sentiment === 'bullish').length
  const bearCount = news.filter(n => n.sentiment === 'bearish').length
  const neutCount = news.filter(n => n.sentiment === 'neutral').length
  const total = news.length || 1
  const weightedScore = news.reduce((s, n) => s + n.sentimentScore, 0) / total
  const avgImportance = news.reduce((s, n) => s + n.importanceScore, 0) / total

  const portfolioNews = news.filter(n => n.affectsPortfolio)
  const portfolioScore = portfolioNews.length
    ? portfolioNews.reduce((s, n) => s + n.sentimentScore, 0) / portfolioNews.length
    : weightedScore

  return { bullCount, bearCount, neutCount, total, weightedScore, avgImportance, portfolioScore }
}

// ─── Importance meter ─────────────────────────────────────────────────────────

function ImportanceMeter({ score }: { score: number }) {
  const color = score >= 8 ? '#ef4444' : score >= 6 ? '#f59e0b' : '#3b82f6'
  const label = score >= 9 ? 'Critical' : score >= 8 ? 'High' : score >= 6 ? 'Notable' : 'Low'
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className="w-1.5 h-3 rounded-sm transition-all"
            style={{
              background: i < score ? color : 'rgba(255,255,255,0.08)',
            }}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

// ─── Confidence pill ──────────────────────────────────────────────────────────

function ConfidencePill({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100)
  const color = pct >= 85 ? '#10b981' : pct >= 70 ? '#3b82f6' : '#f59e0b'
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px]" style={{ color }}>{pct}% conf.</span>
    </div>
  )
}

// ─── News card ────────────────────────────────────────────────────────────────

function NewsCard({ article, index }: { article: typeof MOCK_NEWS[0]; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const sent = SENTIMENT_CONFIG[article.sentiment]
  const horizon = HORIZON_CONFIG[article.timeHorizonImpact]
  const cat = CATEGORY_CONFIG[article.category as Category] ?? { label: article.category, color: '#64748b' }
  const isPortfolioHolding = PORTFOLIO_TICKERS.has(article.ticker)
  const isMarketWide = article.ticker === 'MARKET'

  return (
    <motion.div
      custom={index}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div
        className={cn(
          'rounded-[14px] border transition-all duration-200',
          article.importanceScore >= 9
            ? 'border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.03)]'
            : 'border-[#1e1e3a] bg-[#09090f]',
          'hover:border-[#2d2d4a]',
        )}
      >
        <div className="p-4">
          {/* Row 1: ticker + badges + importance */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Ticker */}
              <span
                className={cn(
                  'text-xs font-mono font-black px-2 py-0.5 rounded-[6px]',
                  isMarketWide ? 'text-[#94a3b8] bg-[rgba(148,163,184,0.12)]' : 'text-[#60a5fa] bg-[rgba(59,130,246,0.12)]',
                )}
              >
                {isMarketWide ? '🌐 MARKET' : article.ticker}
              </span>
              {/* Sentiment */}
              <span
                className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: sent.bg, color: sent.color }}
              >
                {sent.icon}
                {sent.label}
              </span>
              {/* Category */}
              <span
                className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full"
                style={{ background: `${cat.color}14`, color: cat.color }}
              >
                {cat.label}
              </span>
              {/* Portfolio tag */}
              {isPortfolioHolding && !isMarketWide && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(59,130,246,0.1)] text-[#60a5fa] border border-[rgba(59,130,246,0.2)]">
                  In Portfolio
                </span>
              )}
              {article.importanceScore >= 9 && (
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.12)] text-[#ef4444]">
                  <Zap className="w-2.5 h-2.5" />
                  Breaking
                </span>
              )}
            </div>
            {/* Timestamp */}
            <span className="text-[11px] text-[#475569] flex items-center gap-1 flex-shrink-0">
              <Clock className="w-3 h-3" />
              {article.timestamp}
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-sm font-semibold text-[#e2e8f0] leading-snug mb-3">{article.headline}</h3>

          {/* Metrics row */}
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div>
              <p className="text-[9px] text-[#475569] uppercase tracking-wider mb-1">Importance</p>
              <ImportanceMeter score={article.importanceScore} />
            </div>
            <div>
              <p className="text-[9px] text-[#475569] uppercase tracking-wider mb-1">Confidence</p>
              <ConfidencePill confidence={article.confidence} />
            </div>
            <div>
              <p className="text-[9px] text-[#475569] uppercase tracking-wider mb-1">Time Horizon</p>
              <span className="text-[11px] font-semibold" style={{ color: horizon.color }}>{horizon.label}</span>
            </div>
            <div>
              <p className="text-[9px] text-[#475569] uppercase tracking-wider mb-1">Source</p>
              <span className="text-[11px] text-[#64748b]">{article.source}</span>
            </div>
          </div>

          {/* Summary */}
          <p className="text-xs text-[#64748b] leading-relaxed mb-3">{article.summary}</p>

          {/* Expand toggle */}
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {expanded ? 'Hide analysis' : 'Why it matters'}
          </button>
        </div>

        {/* Expanded: why it matters + actionable insight */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: 'hidden' }}
            >
              <div className="px-4 pb-4 space-y-3">
                <div className="h-px bg-[#1e1e3a]" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div
                    className="p-3 rounded-[10px]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1e1e3a' }}
                  >
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" />
                      Why It Matters
                    </p>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{article.whyItMatters}</p>
                  </div>
                  <div
                    className="p-3 rounded-[10px]"
                    style={{
                      background: article.sentiment === 'bullish' ? 'rgba(16,185,129,0.06)' : article.sentiment === 'bearish' ? 'rgba(239,68,68,0.06)' : 'rgba(245,158,11,0.06)',
                      border: `1px solid ${article.sentiment === 'bullish' ? 'rgba(16,185,129,0.2)' : article.sentiment === 'bearish' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                    }}
                  >
                    <p
                      className="text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1 font-semibold"
                      style={{ color: sent.color }}
                    >
                      <Zap className="w-3 h-3" />
                      Actionable Insight
                    </p>
                    <p className="text-xs text-[#94a3b8] leading-relaxed">{article.actionableInsight}</p>
                  </div>
                </div>
                {isPortfolioHolding && !isMarketWide && (
                  <div className="flex items-center gap-2 text-xs text-[#64748b]">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ background: sent.color }}
                    />
                    Portfolio exposure: <span className="text-[#f1f5f9] font-medium">{(article.portfolioExposure * 100).toFixed(1)}% of total value</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// ─── Sentiment gauge ──────────────────────────────────────────────────────────

function SentimentGauge({ score }: { score: number }) {
  const pct = score * 100
  const color = pct >= 65 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444'
  const label = pct >= 65 ? 'Risk-On' : pct >= 45 ? 'Mixed' : 'Risk-Off'
  const r = 40, sw = 8
  const circ = Math.PI * r  // half-circle
  const dash = (pct / 100) * circ

  return (
    <div className="flex flex-col items-center">
      <svg width={120} height={70} viewBox="0 0 120 70">
        {/* Track */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw} strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
        {/* Needle */}
        <text x="60" y="52" textAnchor="middle" fill={color} fontSize="18" fontWeight="900">
          {Math.round(pct)}
        </text>
        <text x="60" y="65" textAnchor="middle" fill="#64748b" fontSize="9">
          {label}
        </text>
      </svg>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

type SentimentFilter = 'all' | Sentiment
type SortMode = 'importance' | 'recency' | 'confidence'

export function NewsPage() {
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all')
  const [tickerFilter, setTickerFilter] = useState<string>('all')
  const [sortMode, setSortMode] = useState<SortMode>('importance')
  const [portfolioOnly, setPortfolioOnly] = useState(false)

  const allTickers = useMemo(() => {
    const tickers = ['all', ...new Set(MOCK_NEWS.map(n => n.ticker))]
    return tickers
  }, [])

  const filtered = useMemo(() => {
    let items = [...MOCK_NEWS]
    if (sentimentFilter !== 'all') items = items.filter(n => n.sentiment === sentimentFilter)
    if (tickerFilter !== 'all') items = items.filter(n => n.ticker === tickerFilter)
    if (portfolioOnly) items = items.filter(n => n.affectsPortfolio)
    if (sortMode === 'importance') items.sort((a, b) => b.importanceScore - a.importanceScore)
    else if (sortMode === 'confidence') items.sort((a, b) => b.confidence - a.confidence)
    // 'recency' = natural order (already in time order)
    return items
  }, [sentimentFilter, tickerFilter, sortMode, portfolioOnly])

  const summary = useMemo(() => computeSentimentSummary(MOCK_NEWS), [])
  const portfolioSummary = useMemo(() =>
    computeSentimentSummary(MOCK_NEWS.filter(n => n.affectsPortfolio)), [])

  // Per-holding latest sentiment
  const holdingSentiment = useMemo(() => {
    const map: Record<string, { sentiment: Sentiment; importance: number; headline: string }> = {}
    for (const h of MOCK_HOLDINGS) {
      const articles = MOCK_NEWS.filter(n => n.ticker === h.ticker).sort((a, b) => b.importanceScore - a.importanceScore)
      if (articles.length > 0) {
        map[h.ticker] = { sentiment: articles[0].sentiment, importance: articles[0].importanceScore, headline: articles[0].headline }
      }
    }
    return map
  }, [])

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-[#3b82f6]" />
            News Intelligence
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">Every article analyzed — sentiment, importance, confidence, and what it means for your portfolio</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#475569] flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            Updated just now
          </span>
          <Badge variant="info" size="sm">{MOCK_NEWS.length} articles</Badge>
        </div>
      </div>

      {/* ── Sentiment overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Market sentiment gauge */}
        <Card>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            Market Sentiment
          </p>
          <div className="flex items-center gap-4">
            <SentimentGauge score={summary.weightedScore} />
            <div className="space-y-2">
              {[
                { label: 'Bullish', count: summary.bullCount, color: '#10b981' },
                { label: 'Neutral', count: summary.neutCount, color: '#f59e0b' },
                { label: 'Bearish', count: summary.bearCount, color: '#ef4444' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                  <span className="text-xs text-[#64748b] w-14">{s.label}</span>
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', width: 60 }}>
                    <div className="h-full rounded-full" style={{ width: `${(s.count / summary.total) * 100}%`, background: s.color }} />
                  </div>
                  <span className="text-xs font-bold text-[#f1f5f9] w-4 text-right">{s.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Portfolio sentiment gauge */}
        <Card>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <BarChart2 className="w-3.5 h-3.5" />
            Portfolio Sentiment
          </p>
          <div className="flex items-center gap-4">
            <SentimentGauge score={portfolioSummary.weightedScore} />
            <div className="text-sm space-y-1">
              <p className="text-[#f1f5f9] font-semibold">
                {portfolioSummary.weightedScore >= 0.65 ? 'Broadly positive' : portfolioSummary.weightedScore >= 0.45 ? 'Mixed signals' : 'Caution signs'}
              </p>
              <p className="text-xs text-[#64748b]">{portfolioSummary.total} articles affecting your holdings</p>
              <p className="text-xs text-[#64748b]">Avg importance: {portfolioSummary.avgImportance.toFixed(1)}/10</p>
            </div>
          </div>
        </Card>

        {/* Holding-level sentiment */}
        <Card>
          <p className="text-xs font-semibold text-[#64748b] uppercase tracking-wider mb-3">Holding Signals</p>
          <div className="space-y-2">
            {MOCK_HOLDINGS.map(h => {
              const sig = holdingSentiment[h.ticker]
              if (!sig) return (
                <div key={h.ticker} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#64748b] w-12">{h.ticker}</span>
                  <span className="text-[11px] text-[#475569]">No recent news</span>
                </div>
              )
              const s = SENTIMENT_CONFIG[sig.sentiment]
              return (
                <div key={h.ticker} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#94a3b8] w-12">{h.ticker}</span>
                  <span
                    className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: s.bg, color: s.color }}
                  >
                    {s.icon}
                    {s.label}
                  </span>
                  <span className="text-[10px] text-[#475569] truncate flex-1">{sig.headline.slice(0, 40)}…</span>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Sentiment filter */}
        <div className="flex items-center gap-1 p-1 rounded-[10px]" style={{ background: '#0f0f1a', border: '1px solid #1e1e3a' }}>
          {(['all', 'bullish', 'neutral', 'bearish'] as const).map(s => {
            const cfg = s === 'all' ? null : SENTIMENT_CONFIG[s]
            return (
              <button
                key={s}
                onClick={() => setSentimentFilter(s)}
                className={cn(
                  'px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all capitalize',
                  sentimentFilter === s
                    ? s === 'all'
                      ? 'bg-[#1e1e3a] text-[#f1f5f9]'
                      : ''
                    : 'text-[#64748b] hover:text-[#94a3b8]',
                )}
                style={sentimentFilter === s && cfg ? { background: cfg.bg, color: cfg.color } : {}}
              >
                {s === 'all' ? 'All' : cfg?.label}
              </button>
            )
          })}
        </div>

        {/* Ticker filter */}
        <select
          value={tickerFilter}
          onChange={e => setTickerFilter(e.target.value)}
          className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-[8px] px-3 py-1.5 text-xs text-[#94a3b8] outline-none focus:border-[rgba(59,130,246,0.4)] cursor-pointer"
        >
          {allTickers.map(t => (
            <option key={t} value={t}>{t === 'all' ? 'All Tickers' : t}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortMode}
          onChange={e => setSortMode(e.target.value as SortMode)}
          className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-[8px] px-3 py-1.5 text-xs text-[#94a3b8] outline-none focus:border-[rgba(59,130,246,0.4)] cursor-pointer"
        >
          <option value="importance">Sort: Importance</option>
          <option value="recency">Sort: Recent First</option>
          <option value="confidence">Sort: Confidence</option>
        </select>

        {/* Portfolio only toggle */}
        <button
          onClick={() => setPortfolioOnly(p => !p)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold border transition-all',
            portfolioOnly
              ? 'bg-[rgba(59,130,246,0.12)] border-[rgba(59,130,246,0.3)] text-[#60a5fa]'
              : 'bg-[#0f0f1a] border-[#1e1e3a] text-[#64748b] hover:text-[#94a3b8]',
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          Portfolio Only
        </button>

        <span className="text-xs text-[#475569] ml-auto">
          {filtered.length} article{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Breaking news banner ── */}
      {(() => {
        const breaking = MOCK_NEWS.filter(n => n.importanceScore >= 9)
        if (!breaking.length) return null
        return (
          <div
            className="flex items-start gap-3 p-3 rounded-[12px]"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertTriangle className="w-4 h-4 text-[#ef4444] flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#ef4444] mb-1">Breaking / High-Impact</p>
              <div className="space-y-1">
                {breaking.map(b => (
                  <p key={b.id} className="text-xs text-[#94a3b8] flex items-center gap-2">
                    <span className="font-mono font-bold text-[#60a5fa]">{b.ticker === 'MARKET' ? '🌐' : b.ticker}</span>
                    {b.headline}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── News feed ── */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            filtered.map((article, i) => (
              <NewsCard key={article.id} article={article} index={i} />
            ))
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Card>
                <p className="text-sm text-[#64748b] text-center py-6">No articles match the selected filters.</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
