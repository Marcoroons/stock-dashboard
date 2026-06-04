import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Activity, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle, Info, TrendingUp, Globe, Layers, GitMerge, ChartBar as BarChart2, ArrowRight, Zap } from 'lucide-react'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts'
import { Card, MetricCard, Badge } from '@/components/ui'
import { ProgressBar, ScoreRing } from '@/components/ui/Progress'
import { MOCK_HOLDINGS } from '@/data/mock'
import { analyzePortfolio, type Holding, type RiskDimension, type Prescription } from '@/lib/portfolio-doctor'
import { cn } from '@/lib/utils'

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06 } }),
}

// Map mock holdings to Holding type
function mapToHolding(h: typeof MOCK_HOLDINGS[0]): Holding {
  return {
    id: h.id,
    ticker: h.ticker,
    name: h.name,
    sector: h.sector,
    shares: h.shares,
    costBasis: h.costBasis,
    currentPrice: h.currentPrice,
    weight: h.weight,
    change: h.change,
  }
}

const DIMENSION_ICONS: Record<string, React.ReactNode> = {
  concentration: <Layers className="w-4 h-4" />,
  sector: <BarChart2 className="w-4 h-4" />,
  geographic: <Globe className="w-4 h-4" />,
  diversification: <GitMerge className="w-4 h-4" />,
  correlation: <Activity className="w-4 h-4" />,
}

const FINDING_COLORS = {
  strength: '#10b981',
  warning: '#f59e0b',
  critical: '#ef4444',
  info: '#64748b',
}

const FINDING_ICONS = {
  strength: <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />,
  warning: <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />,
  critical: <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />,
  info: <Info className="w-3.5 h-3.5 flex-shrink-0" />,
}

const PRIORITY_VARIANT = {
  high: 'error' as const,
  medium: 'warning' as const,
  low: 'success' as const,
}

const GRADE_COLORS: Record<string, string> = {
  A: '#10b981',
  B: '#3b82f6',
  C: '#f59e0b',
  D: '#f97316',
  F: '#ef4444',
}

function GradeCircle({ grade, size = 64 }: { grade: string; size?: number }) {
  const color = GRADE_COLORS[grade] ?? '#64748b'
  return (
    <div
      className="flex items-center justify-center rounded-full font-black flex-shrink-0"
      style={{
        width: size, height: size,
        background: `${color}18`,
        border: `2px solid ${color}40`,
        color,
        fontSize: size * 0.44,
      }}
    >
      {grade}
    </div>
  )
}

function DimensionCard({ dim, index }: { dim: RiskDimension; index: number }) {
  const statusColor = dim.status === 'healthy' ? '#10b981' : dim.status === 'caution' ? '#f59e0b' : '#ef4444'
  const icon = DIMENSION_ICONS[dim.id]

  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={FADE_UP}>
      <Card className="h-full">
        <div className="flex items-start justify-between mb-3 gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center flex-shrink-0"
              style={{ background: `${statusColor}18`, color: statusColor }}
            >
              {icon}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#f1f5f9]">{dim.label}</p>
              <p className="text-[11px] text-[#64748b]">{dim.headline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-lg font-bold" style={{ color: statusColor }}>{dim.score}</span>
            <GradeCircle grade={dim.grade} size={32} />
          </div>
        </div>

        <ProgressBar
          value={dim.score}
          color={statusColor}
          height={4}
          animated
        />

        <p className="text-xs text-[#64748b] mt-3 mb-3 leading-relaxed">{dim.detail}</p>

        <div className="space-y-1.5">
          {dim.findings.map((f, i) => (
            <div key={i} className="flex items-start gap-2 text-xs" style={{ color: FINDING_COLORS[f.type] }}>
              {FINDING_ICONS[f.type]}
              <span className="leading-relaxed">{f.message}</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  )
}

function PrescriptionItem({ rx, index }: { rx: Prescription; index: number }) {
  return (
    <motion.div custom={index} initial="hidden" animate="visible" variants={FADE_UP}>
      <Card hover>
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{
              background: rx.priority === 'high' ? 'rgba(239,68,68,0.12)' : rx.priority === 'medium' ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.12)',
              color: rx.priority === 'high' ? '#ef4444' : rx.priority === 'medium' ? '#f59e0b' : '#10b981',
            }}
          >
            {rx.priority === 'high' ? <AlertTriangle className="w-4 h-4" /> : rx.priority === 'medium' ? <Zap className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold text-[#f1f5f9]">{rx.action}</p>
              <Badge variant={PRIORITY_VARIANT[rx.priority]} size="sm">{rx.priority}</Badge>
            </div>
            <p className="text-xs text-[#94a3b8] leading-relaxed mb-2">{rx.rationale}</p>
            {rx.tickers && rx.tickers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {rx.tickers.map(t => (
                  <span
                    key={t}
                    className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(59,130,246,0.12)', color: '#60a5fa' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

const CHART_TOOLTIP_STYLE = {
  contentStyle: { background: '#0f0f1a', border: '1px solid #1e1e3a', borderRadius: 8, fontSize: 12 },
  labelStyle: { color: '#f1f5f9' },
  itemStyle: { color: '#94a3b8' },
}

export function PortfolioDoctorPage() {
  const holdings = useMemo(() => MOCK_HOLDINGS.map(mapToHolding), [])
  const report = useMemo(() => analyzePortfolio(holdings), [holdings])

  const gradeColor = GRADE_COLORS[report.grade] ?? '#64748b'
  const dims = Object.values(report.dimensions)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[#3b82f6]" />
            Portfolio Doctor
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">Comprehensive risk analysis and prescriptions for your portfolio</p>
        </div>
        <Badge variant="info" size="sm">Live Analysis</Badge>
      </div>

      {/* ── Hero Health Score ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[16px] border border-[#1e1e3a] p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #09090f 0%, #0f0f1a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 80% 20%, ${gradeColor}60 0%, transparent 60%)` }}
        />

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Score */}
          <div className="flex items-center gap-5">
            <ScoreRing score={report.healthScore} size={100} strokeWidth={7} label="Health" color={gradeColor} />
            <GradeCircle grade={report.grade} size={72} />
          </div>

          {/* Verdict & Metrics */}
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold text-[#f1f5f9] mb-1">{report.verdict}</p>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="text-center">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-0.5">Top 1</p>
                <p className="text-sm font-bold" style={{ color: report.topHeaviness.top1 > 0.35 ? '#ef4444' : '#f1f5f9' }}>
                  {(report.topHeaviness.top1 * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-px bg-[#1e1e3a]" />
              <div className="text-center">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-0.5">Top 3</p>
                <p className="text-sm font-bold" style={{ color: report.topHeaviness.top3 > 0.65 ? '#f59e0b' : '#f1f5f9' }}>
                  {(report.topHeaviness.top3 * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-px bg-[#1e1e3a]" />
              <div className="text-center">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-0.5">Top 5</p>
                <p className="text-sm font-bold text-[#f1f5f9]">
                  {(report.topHeaviness.top5 * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-px bg-[#1e1e3a]" />
              <div className="text-center">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-0.5">Holdings</p>
                <p className="text-sm font-bold text-[#f1f5f9]">{holdings.length}</p>
              </div>
              <div className="w-px bg-[#1e1e3a]" />
              <div className="text-center">
                <p className="text-[10px] text-[#64748b] uppercase tracking-wider mb-0.5">Sectors</p>
                <p className="text-sm font-bold text-[#f1f5f9]">{report.sectorBreakdown.length}</p>
              </div>
            </div>
          </div>

          {/* Dimension overview */}
          <div className="space-y-2 min-w-[180px]">
            {dims.map(dim => (
              <div key={dim.id} className="flex items-center gap-2">
                <span className="text-[11px] text-[#64748b] w-[110px] truncate">{dim.label}</span>
                <ProgressBar
                  value={dim.score}
                  height={4}
                  color={dim.status === 'healthy' ? '#10b981' : dim.status === 'caution' ? '#f59e0b' : '#ef4444'}
                  animated
                />
                <span
                  className="text-[11px] font-bold w-6 text-right"
                  style={{ color: GRADE_COLORS[dim.grade] }}
                >
                  {dim.grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Strengths & Weaknesses ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
          <Card className="h-full">
            <h3 className="text-sm font-semibold text-[#10b981] flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4" />
              Strengths
            </h3>
            <ul className="space-y-2">
              {report.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#10b981] flex-shrink-0 mt-0.5" />
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
        <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
          <Card className="h-full">
            <h3 className="text-sm font-semibold text-[#f59e0b] flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" />
              Areas to Improve
            </h3>
            <ul className="space-y-2">
              {report.weaknesses.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                  <ArrowRight className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                  {w}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      </div>

      {/* ── Five Dimensions ── */}
      <div>
        <h2 className="text-base font-semibold text-[#f1f5f9] mb-3">Risk Dimensions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {dims.map((dim, i) => <DimensionCard key={dim.id} dim={dim} index={i} />)}
        </div>
      </div>

      {/* ── Radar + Sector Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
          <Card className="h-full">
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Risk Radar</h3>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={report.radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                <PolarGrid stroke="#1e1e3a" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>

        {/* Sector Breakdown */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
          <Card className="h-full">
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4">Sector Allocation</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={report.sectorBreakdown} layout="vertical" margin={{ left: 8, right: 32, top: 0, bottom: 0 }}>
                <XAxis type="number" hide domain={[0, 1]} />
                <YAxis type="category" dataKey="sector" tick={{ fill: '#64748b', fontSize: 11 }} width={110} />
                <Tooltip
                  {...CHART_TOOLTIP_STYLE}
                  formatter={(v: number) => [`${(v * 100).toFixed(1)}%`, 'Weight']}
                />
                <Bar dataKey="weight" radius={[0, 4, 4, 0]}>
                  {report.sectorBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-3 space-y-1.5">
              {report.sectorBreakdown.map(s => (
                <div key={s.sector} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                    <span className="text-[#94a3b8]">{s.sector}</span>
                    <span className="text-[#64748b]">({s.tickers.join(', ')})</span>
                  </div>
                  <span className="text-[#f1f5f9] font-medium">{(s.weight * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Geographic + Correlation Matrix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Geographic */}
        <motion.div custom={0} initial="hidden" animate="visible" variants={FADE_UP}>
          <Card>
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#3b82f6]" />
              Geographic Exposure
            </h3>
            <div className="space-y-3">
              {report.geographicBreakdown.map(g => (
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
            {report.geographicBreakdown.length === 1 && (
              <div className="mt-4 p-3 rounded-[10px] border border-[rgba(245,158,11,0.2)] bg-[rgba(245,158,11,0.06)]">
                <p className="text-xs text-[#f59e0b]">
                  Your portfolio has no international exposure. Consider adding VEA, VXUS, or EFA to reduce home-country bias.
                </p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Correlation */}
        <motion.div custom={1} initial="hidden" animate="visible" variants={FADE_UP}>
          <Card>
            <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#3b82f6]" />
              Correlation Heatmap (Top Pairs)
            </h3>
            <div className="space-y-2">
              {report.correlationMatrix.map((pair, i) => {
                const corrColor = pair.correlation >= 0.75 ? '#ef4444' : pair.correlation >= 0.55 ? '#f59e0b' : '#10b981'
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-[120px] flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-[#60a5fa]">{pair.tickerA}</span>
                      <span className="text-[#64748b] text-xs">↔</span>
                      <span className="text-xs font-mono font-bold text-[#60a5fa]">{pair.tickerB}</span>
                    </div>
                    <ProgressBar value={pair.correlation * 100} color={corrColor} height={5} animated />
                    <div className="flex items-center gap-1.5 flex-shrink-0 w-[90px]">
                      <span className="text-xs font-bold" style={{ color: corrColor }}>{pair.correlation.toFixed(2)}</span>
                      <span className="text-[10px] text-[#64748b]">{pair.label}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Prescriptions ── */}
      <div>
        <h2 className="text-base font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#3b82f6]" />
          Prescriptions
        </h2>
        <div className="space-y-3">
          {report.prescriptions.map((rx, i) => (
            <PrescriptionItem key={i} rx={rx} index={i} />
          ))}
        </div>
      </div>

    </div>
  )
}
