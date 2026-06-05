import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, ChevronDown, ChevronUp, Clock, TrendingDown, CircleAlert as AlertCircle, TriangleAlert as AlertTriangle, ChevronRight, ChartBar as BarChart2, Layers, History, Globe } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell, ReferenceLine,
} from 'recharts'
import { Card, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { MOCK_HOLDINGS, MOCK_PORTFOLIO } from '@/data/mock'
import {
  runStressTest, getSeverityLevel, SEVERITY_META, CATEGORY_META,
  type ScenarioResult, type ScenarioCategory, type HoldingImpact,
} from '@/lib/stress-engine'

// ─── Derived data ─────────────────────────────────────────────────────────────

const STRESS_HOLDINGS = MOCK_HOLDINGS.map(h => ({
  ticker: h.ticker,
  name: h.name,
  sector: h.sector,
  weight: h.weight,
}))

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPct(n: number, abs = false): string {
  const v = abs ? Math.abs(n) : n
  return `${n >= 0 && !abs ? '+' : n < 0 && !abs ? '' : ''}${(v * 100).toFixed(1)}%`
}

function fmtMoney(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e6) return `${sign}$${(abs / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `${sign}$${(abs / 1e3).toFixed(1)}k`
  return `${sign}$${abs.toFixed(0)}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryTabs({ active, onChange, counts }: {
  active: 'all' | ScenarioCategory
  onChange: (v: 'all' | ScenarioCategory) => void
  counts: Record<string, number>
}) {
  const tabs: Array<{ key: 'all' | ScenarioCategory; label: string; Icon: React.ComponentType<any> }> = [
    { key: 'all', label: 'All Scenarios', Icon: Layers },
    { key: 'historical', label: 'Historical', Icon: History },
    { key: 'macro', label: 'Macro', Icon: Globe },
    { key: 'sector', label: 'Sector', Icon: BarChart2 },
  ]
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-medium transition-all border cursor-pointer',
            active === t.key
              ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border-[rgba(59,130,246,0.3)]'
              : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a] border-transparent',
          )}
        >
          <t.Icon className="w-3.5 h-3.5" />
          {t.label}
          <span className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
            active === t.key ? 'bg-[#3b82f6] text-white' : 'bg-[#1e1e3a] text-[#64748b]',
          )}>
            {counts[t.key] ?? 0}
          </span>
        </button>
      ))}
    </div>
  )
}

function DrawdownBar({ pct }: { pct: number }) {
  const abs = Math.abs(pct)
  const sev = getSeverityLevel(pct)
  const meta = SEVERITY_META[sev]
  return (
    <div className="w-full">
      <div className="flex justify-between text-xs mb-1">
        <span style={{ color: meta.color }} className="font-bold">{fmtPct(pct)}</span>
        <span className="text-[#475569] text-[10px]">{meta.label} Risk</span>
      </div>
      <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(abs * 200, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: meta.color }}
        />
      </div>
    </div>
  )
}

function ScenarioCard({ result, selected, onClick }: {
  result: ScenarioResult
  selected: boolean
  onClick: () => void
}) {
  const sev = getSeverityLevel(result.portfolioDrawdown)
  const sevMeta = SEVERITY_META[sev]
  const catMeta = CATEGORY_META[result.scenario.category]

  return (
    <motion.button
      layout
      onClick={onClick}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'w-full text-left rounded-[14px] border p-4 transition-all cursor-pointer',
        selected
          ? 'border-[rgba(59,130,246,0.4)] ring-1 ring-[rgba(59,130,246,0.2)]'
          : 'border-[#1e1e3a] hover:border-[#2a2a4a]',
      )}
      style={{ background: selected ? 'rgba(59,130,246,0.05)' : '#0a0a14' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${catMeta.color}18`, color: catMeta.color }}
          >
            {catMeta.label}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: sevMeta.bg, color: sevMeta.color }}
          >
            {sevMeta.label}
          </span>
        </div>
        <ChevronRight className={cn('w-4 h-4 flex-shrink-0 transition-transform text-[#475569]', selected && 'rotate-90')} />
      </div>

      <h3 className="text-sm font-semibold text-[#f1f5f9] mb-1 leading-tight">{result.scenario.name}</h3>
      <p className="text-[10px] text-[#475569] mb-3 line-clamp-1">{result.scenario.period}</p>

      <DrawdownBar pct={result.portfolioDrawdown} />

      <div className="flex gap-3 mt-3 pt-3 border-t border-[#1e1e3a]">
        <div>
          <p className="text-[10px] text-[#475569] uppercase tracking-wide">Dollar Loss</p>
          <p className="text-xs font-semibold text-[#ef4444]">{fmtMoney(result.dollarImpact)}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#475569] uppercase tracking-wide">Recovery</p>
          <p className="text-xs font-semibold text-[#94a3b8]">{result.recoveryMonths}mo</p>
        </div>
        <div>
          <p className="text-[10px] text-[#475569] uppercase tracking-wide">Risk Score</p>
          <p className="text-xs font-semibold" style={{ color: sevMeta.color }}>{result.riskScore}/100</p>
        </div>
      </div>
    </motion.button>
  )
}

function HoldingImpactRow({ impact, rank, total }: { impact: HoldingImpact; rank: number; total: number }) {
  const pct = impact.shockFactor
  const color = pct <= -0.35 ? '#ef4444' : pct <= -0.20 ? '#f97316' : pct <= -0.10 ? '#f59e0b' : pct <= 0 ? '#94a3b8' : '#10b981'
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[#0f0f1a] last:border-0">
      <div
        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
        style={{ background: `${color}20`, color }}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#f1f5f9]">{impact.ticker}</span>
          <span className="text-[10px] text-[#475569]">{impact.sector}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div
              className="h-full rounded-full"
              style={{ width: `${impact.contribution * 100}%`, background: color }}
            />
          </div>
          <span className="text-[10px] text-[#64748b]">{Math.round(impact.contribution * 100)}% of loss</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs font-bold" style={{ color }}>{fmtPct(pct)}</p>
        <p className="text-[10px] text-[#64748b]">{fmtMoney(impact.dollarImpact)}</p>
      </div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-[8px] px-3 py-2 text-xs">
      <p className="text-[#94a3b8] mb-1">{label < 0 ? 'Pre-shock' : label === 0 ? 'Shock event' : `Month +${label}`}</p>
      <p className="font-semibold" style={{ color: payload[0].value >= 100 ? '#10b981' : '#ef4444' }}>
        Portfolio: {payload[0].value.toFixed(1)}
      </p>
    </div>
  )
}

function RecoveryChart({ result }: { result: ScenarioResult }) {
  const sev = getSeverityLevel(result.portfolioDrawdown)
  const color = SEVERITY_META[sev].color
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-semibold text-[#f1f5f9]">Recovery Timeline</h4>
        <div className="flex gap-4 text-[10px] text-[#64748b]">
          <span>Bear: {result.scenario.recoveryMonths.bear}mo</span>
          <span className="text-[#94a3b8] font-medium">Base: {result.scenario.recoveryMonths.base}mo</span>
          <span>Bull: {result.scenario.recoveryMonths.bull}mo</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={result.recoveryPath} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="recGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: '#475569' }}
            tickFormatter={v => v === 0 ? 'Shock' : `+${v}mo`}
          />
          <YAxis
            domain={['auto', 105]}
            tick={{ fontSize: 10, fill: '#475569' }}
            tickFormatter={v => `${v}`}
          />
          <ReferenceLine y={100} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill="url(#recGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function ComparisonChart({ results }: { results: ScenarioResult[] }) {
  const data = results.map(r => ({
    name: r.scenario.name.replace(' Crash', '').replace('2008 Financial ', '').replace(' Shock', ' Shk').replace(' Burst', ' Bst'),
    drawdown: Math.round(Math.abs(r.portfolioDrawdown) * 1000) / 10,
    category: r.scenario.category,
  })).sort((a, b) => b.drawdown - a.drawdown)

  const catColors: Record<string, string> = {
    historical: '#3b82f6',
    macro: '#8b5cf6',
    sector: '#f59e0b',
  }

  return (
    <div>
      <h4 className="text-sm font-semibold text-[#f1f5f9] mb-3">All Scenarios — Drawdown Comparison</h4>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, left: 110, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => `${v}%`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} width={105} />
          <Tooltip
            formatter={(v: number) => [`${v}% loss`, 'Drawdown']}
            contentStyle={{ background: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 8, fontSize: 12 }}
          />
          <Bar dataKey="drawdown" radius={[0, 4, 4, 0]}>
            {data.map((d, i) => (
              <Cell key={i} fill={catColors[d.category]} opacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 justify-center">
        {Object.entries(catColors).map(([cat, color]) => (
          <div key={cat} className="flex items-center gap-1.5 text-[10px] text-[#64748b]">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {CATEGORY_META[cat as ScenarioCategory].label}
          </div>
        ))}
      </div>
    </div>
  )
}

function DetailPanel({ result }: { result: ScenarioResult }) {
  const [tab, setTab] = useState<'holdings' | 'adjustments' | 'recovery'>('holdings')
  const sev = getSeverityLevel(result.portfolioDrawdown)
  const sevMeta = SEVERITY_META[sev]
  const catMeta = CATEGORY_META[result.scenario.category]

  const sortedImpacts = [...result.holdingImpacts].sort((a, b) => a.shockFactor - b.shockFactor)

  return (
    <motion.div
      key={result.scenario.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25 }}
      className="space-y-4"
    >
      {/* Scenario header */}
      <div
        className="rounded-[14px] border p-5"
        style={{ background: sevMeta.bg, borderColor: sevMeta.border }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${sevMeta.color}20` }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: sevMeta.color }} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded-full" style={{ background: `${catMeta.color}20`, color: catMeta.color }}>
                {catMeta.label}
              </span>
              <span className="text-xs text-[#64748b]">{result.scenario.period}</span>
            </div>
            <h3 className="text-base font-bold text-[#f1f5f9]">{result.scenario.name}</h3>
            <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">{result.scenario.trigger}</p>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Expected Loss', value: fmtPct(result.baseCase), color: sevMeta.color },
            { label: 'Dollar Impact', value: fmtMoney(result.dollarImpact), color: '#ef4444' },
            { label: 'Portfolio After', value: fmtMoney(result.portfolioAfter), color: '#f1f5f9' },
            { label: 'Recovery', value: `${result.recoveryMonths}mo`, color: '#94a3b8' },
          ].map(m => (
            <div key={m.label} className="rounded-[10px] bg-[rgba(0,0,0,0.3)] p-3 text-center">
              <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
              <p className="text-[10px] text-[#475569] uppercase tracking-wide mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Bear/Base/Bull range */}
        <div className="mt-4 pt-3 border-t" style={{ borderColor: sevMeta.border }}>
          <p className="text-[10px] text-[#64748b] uppercase tracking-wide mb-2">Scenario range</p>
          <div className="flex gap-4 text-sm">
            <div><span className="text-[#ef4444] font-bold">{fmtPct(result.bearCase)}</span><span className="text-[#475569] text-xs ml-1">bear</span></div>
            <div><span className="font-bold" style={{ color: sevMeta.color }}>{fmtPct(result.baseCase)}</span><span className="text-[#64748b] text-xs ml-1">base</span></div>
            <div><span className="text-[#f59e0b] font-bold">{fmtPct(result.bullCase)}</span><span className="text-[#475569] text-xs ml-1">bull</span></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['holdings', 'recovery', 'adjustments'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-3 py-1.5 rounded-[7px] text-xs font-medium transition-all cursor-pointer capitalize border',
              tab === t
                ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border-[rgba(59,130,246,0.3)]'
                : 'text-[#64748b] border-transparent hover:text-[#94a3b8] hover:bg-[#0f0f1a]',
            )}
          >
            {t === 'holdings' ? 'Holdings Impact' : t === 'recovery' ? 'Recovery Path' : 'Adjustments'}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {tab === 'holdings' && (
          <motion.div key="holdings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <h4 className="text-sm font-semibold text-[#f1f5f9] mb-1">Holdings Impact Analysis</h4>
              <p className="text-xs text-[#64748b] mb-4">Ranked by estimated drawdown severity</p>
              <div>
                {sortedImpacts.map((imp, i) => (
                  <HoldingImpactRow key={imp.ticker} impact={imp} rank={i + 1} total={sortedImpacts.length} />
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {tab === 'recovery' && (
          <motion.div key="recovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <RecoveryChart result={result} />
              <div className="mt-4 pt-4 border-t border-[#1e1e3a] grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="text-[#ef4444] font-bold">{result.scenario.recoveryMonths.bear} months</p>
                  <p className="text-[#475569]">Bear recovery</p>
                </div>
                <div>
                  <p className="font-bold" style={{ color: sevMeta.color }}>{result.scenario.recoveryMonths.base} months</p>
                  <p className="text-[#64748b]">Base recovery</p>
                </div>
                <div>
                  <p className="text-[#10b981] font-bold">{result.scenario.recoveryMonths.bull} months</p>
                  <p className="text-[#475569]">Bull recovery</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {tab === 'adjustments' && (
          <motion.div key="adjustments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card>
              <h4 className="text-sm font-semibold text-[#f1f5f9] mb-1">Suggested Adjustments</h4>
              <p className="text-xs text-[#64748b] mb-4">Portfolio changes to reduce exposure to this scenario</p>
              <div className="space-y-3">
                {result.adjustments.map((adj, i) => {
                  const priColor = adj.priority === 'high' ? '#ef4444' : adj.priority === 'medium' ? '#f59e0b' : '#64748b'
                  return (
                    <div
                      key={i}
                      className="rounded-[10px] border p-3.5"
                      style={{ background: `${priColor}06`, borderColor: `${priColor}25` }}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className="mt-0.5 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: `${priColor}20`, color: priColor }}
                        >
                          {adj.priority}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-[#f1f5f9] leading-snug">{adj.action}</p>
                          <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{adj.rationale}</p>
                          <p className="text-xs mt-1.5 font-medium" style={{ color: priColor }}>{adj.impact}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Summary Banner ───────────────────────────────────────────────────────────

function SummaryBanner({ results }: { results: ScenarioResult[] }) {
  const worst = results.reduce((w, r) => r.portfolioDrawdown < w.portfolioDrawdown ? r : w)
  const best = results.reduce((b, r) => r.portfolioDrawdown > b.portfolioDrawdown ? r : b)
  const avgDrawdown = results.reduce((s, r) => s + r.portfolioDrawdown, 0) / results.length
  const severeCount = results.filter(r => getSeverityLevel(r.portfolioDrawdown) === 'severe').length

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {[
        {
          label: 'Worst Scenario',
          value: fmtPct(worst.portfolioDrawdown),
          sub: worst.scenario.name,
          color: '#ef4444',
        },
        {
          label: 'Avg Drawdown',
          value: fmtPct(avgDrawdown),
          sub: 'across 9 scenarios',
          color: '#f97316',
        },
        {
          label: 'Severe Scenarios',
          value: `${severeCount}/9`,
          sub: 'exceed 40% loss',
          color: '#f59e0b',
        },
        {
          label: 'Most Resilient',
          value: fmtPct(best.portfolioDrawdown),
          sub: best.scenario.name,
          color: '#10b981',
        },
      ].map(m => (
        <div key={m.label} className="rounded-[12px] border border-[#1e1e3a] p-4 bg-[#0a0a14]">
          <p className="text-[10px] text-[#475569] uppercase tracking-wide mb-1">{m.label}</p>
          <p className="text-xl font-bold" style={{ color: m.color }}>{m.value}</p>
          <p className="text-[10px] text-[#64748b] mt-0.5 truncate">{m.sub}</p>
        </div>
      ))}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function StressTestPage() {
  const [categoryFilter, setCategoryFilter] = useState<'all' | ScenarioCategory>('all')
  const [selectedId, setSelectedId] = useState<string>('crisis-2008')
  const [showComparison, setShowComparison] = useState(false)

  const results = useMemo(() =>
    runStressTest(STRESS_HOLDINGS, MOCK_PORTFOLIO),
    []
  )

  const filtered = categoryFilter === 'all'
    ? results
    : results.filter(r => r.scenario.category === categoryFilter)

  const selectedResult = results.find(r => r.scenario.id === selectedId) ?? results[0]

  const counts = {
    all: results.length,
    historical: results.filter(r => r.scenario.category === 'historical').length,
    macro: results.filter(r => r.scenario.category === 'macro').length,
    sector: results.filter(r => r.scenario.category === 'sector').length,
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-[#3b82f6]" />
            <h1 className="text-2xl font-bold text-[#f1f5f9]">Stress Testing</h1>
          </div>
          <p className="text-[#64748b] text-sm">
            9 institutional-grade scenarios modeled against your {MOCK_HOLDINGS.length}-holding portfolio
          </p>
        </div>
        <Button
          variant={showComparison ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setShowComparison(v => !v)}
        >
          <BarChart2 className="w-3.5 h-3.5 mr-1.5" />
          {showComparison ? 'Hide Comparison' : 'Compare All'}
        </Button>
      </div>

      {/* Summary */}
      <SummaryBanner results={results} />

      {/* Comparison chart */}
      <AnimatePresence>
        {showComparison && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <Card>
              <ComparisonChart results={results} />
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category filter */}
      <CategoryTabs active={categoryFilter} onChange={setCategoryFilter} counts={counts} />

      {/* Main grid: scenario list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4 items-start">
        {/* Scenario list */}
        <div className="space-y-2">
          {filtered.map(result => (
            <ScenarioCard
              key={result.scenario.id}
              result={result}
              selected={selectedId === result.scenario.id}
              onClick={() => setSelectedId(result.scenario.id)}
            />
          ))}
        </div>

        {/* Detail panel */}
        <div className="lg:sticky lg:top-20">
          {selectedResult && <DetailPanel result={selectedResult} />}
        </div>
      </div>
    </div>
  )
}
