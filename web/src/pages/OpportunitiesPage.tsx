import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Sparkles, ChartPie as PieChart, Compass, ChevronDown, ChevronUp, Info, Shuffle, ChevronRight, ChartBar as BarChart3, Shield, Zap, Target, Star, Check, Building2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Card, Button, Badge } from '@/components/ui'
import { cn, toDnaInput } from '@/lib/utils'
import type { DnaInput } from '@/lib/dna-engine'
import type { DnaAssessment } from '@/types/database'
import {
  scoreInvestments, buildPortfolio, getThemeInvestments, discover,
  THEMES, ETF_SLOTS, TEMPLATE_META,
  type ScoredInvestment, type PortfolioBlueprint, type DiscoverTemplate, type RiskLevel,
} from '@/lib/discovery-engine'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const RISK_COLORS: Record<string, string> = {
  low: '#10b981', medium: '#f59e0b', high: '#ef4444', very_high: '#dc2626',
}
const RISK_LABELS: Record<string, string> = {
  low: 'Low', medium: 'Medium', high: 'High', very_high: 'Very High',
}
const ROLE_COLORS: Record<string, string> = {
  core: '#3b82f6', growth: '#10b981', income: '#f59e0b', diversifier: '#06b6d4',
  defensive: '#64748b', satellite: '#8b5cf6', speculative: '#ef4444',
}

function CompatibilityBar({ score, className }: { score: number; className?: string }) {
  const color = score >= 75 ? '#10b981' : score >= 55 ? '#f59e0b' : '#ef4444'
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 rounded-full bg-[#1e1e3a] overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="h-full rounded-full" style={{ background: color }}
        />
      </div>
      <span className="text-xs font-semibold w-8 text-right" style={{ color }}>{score}%</span>
    </div>
  )
}

function ScorePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] text-[#64748b] uppercase tracking-wide">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
    </div>
  )
}

// ─── Investment Card ──────────────────────────────────────────────────────────

function InvestmentCard({ inv, rank }: { inv: ScoredInvestment; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const compatColor = inv.dnaCompatibility >= 75 ? '#10b981' : inv.dnaCompatibility >= 55 ? '#f59e0b' : '#ef4444'

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.04 }}>
      <Card hover className="overflow-hidden">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#0f0f1a] border border-[#1e1e3a] flex items-center justify-center">
            <span className="text-xs font-bold text-[#64748b]">#{rank + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#f1f5f9]">{inv.ticker}</span>
                  <span className="inline-flex items-center font-medium rounded-full px-2 py-0.5 text-[10px] bg-transparent" style={{ color: ROLE_COLORS[inv.suggestedRole] }}>
                    {inv.roleLabel}
                  </span>
                  {inv.type === 'etf' && <Badge variant="info" size="sm" className="text-[10px]">ETF</Badge>}
                </div>
                <p className="text-xs text-[#94a3b8] mt-0.5 truncate">{inv.name}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="w-11 h-11 rounded-full border-2 flex items-center justify-center text-sm font-bold" style={{ borderColor: compatColor, color: compatColor }}>
                  {inv.compositeScore}
                </div>
                <span className="text-[9px] text-[#64748b]">score</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-[#64748b] uppercase tracking-wide">DNA Match</span>
                <span className="text-[10px]" style={{ color: compatColor }}>
                  {inv.dnaCompatibility >= 75 ? 'Strong Fit' : inv.dnaCompatibility >= 55 ? 'Good Fit' : 'Partial Fit'}
                </span>
              </div>
              <CompatibilityBar score={inv.dnaCompatibility} />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-[#1e1e3a] grid grid-cols-6 gap-1">
          <ScorePill label="Quality" value={inv.quality} color="#3b82f6" />
          <ScorePill label="Growth" value={inv.growth} color="#10b981" />
          <ScorePill label="Value" value={inv.valuation} color="#06b6d4" />
          <ScorePill label="Momentum" value={inv.momentum} color="#f59e0b" />
          <ScorePill label="Safety" value={inv.safety} color="#64748b" />
          <ScorePill label="Sentiment" value={inv.sentiment} color="#8b5cf6" />
        </div>

        <div className="mt-3 p-2.5 rounded-[8px] bg-[rgba(59,130,246,0.06)] border border-[rgba(59,130,246,0.12)]">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#3b82f6] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#94a3b8] leading-relaxed">{inv.whyItFitsYou}</p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between mt-2.5 pt-2 border-t border-[#1e1e3a] text-xs text-[#64748b] hover:text-[#94a3b8] transition-colors cursor-pointer"
        >
          <span>{expanded ? 'Less detail' : 'Full analysis'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2.5 rounded-[8px] bg-[#0f0f1a]">
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wide mb-1">Suggested Allocation</p>
                    <p className="text-lg font-bold text-[#f1f5f9]">{inv.suggestedAllocation}</p>
                    <p className="text-[10px] text-[#64748b] mt-0.5">{inv.allocationRationale}</p>
                  </div>
                  <div className="p-2.5 rounded-[8px] bg-[#0f0f1a]">
                    <p className="text-[10px] text-[#64748b] uppercase tracking-wide mb-1">Portfolio Role</p>
                    <p className="text-sm font-semibold capitalize" style={{ color: ROLE_COLORS[inv.suggestedRole] }}>{inv.suggestedRole}</p>
                    <p className="text-[10px] text-[#64748b] mt-0.5">{inv.timeHorizon === 'all' ? 'Any horizon' : `${inv.timeHorizon}-term`} · {inv.sector}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-[#64748b] uppercase tracking-wide mb-1.5">Key Risks</p>
                  <div className="space-y-1">
                    {inv.keyRisks.map((risk, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-[#94a3b8]">
                        <span className="text-[#ef4444] mt-0.5 flex-shrink-0">•</span>{risk}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#64748b] leading-relaxed">{inv.description}</p>
                <div className="flex items-center gap-3 text-[10px] text-[#64748b] flex-wrap">
                  <span>Beta: <strong className="text-[#94a3b8]">{inv.beta.toFixed(2)}</strong></span>
                  <span>Dividend: <strong className="text-[#94a3b8]">{(inv.dividendYield * 100).toFixed(1)}%</strong></span>
                  <span>Risk: <strong style={{ color: RISK_COLORS[inv.riskLevel] }}>{RISK_LABELS[inv.riskLevel]}</strong></span>
                  <span>Confidence: <strong className="text-[#3b82f6]">{inv.confidenceScore}%</strong></span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

// ─── For You Tab ─────────────────────────────────────────────────────────────

type FilterType = 'all' | 'stock' | 'etf'
type SortType = 'composite' | 'dna' | 'quality' | 'growth'

function ForYouTab({ dna }: { dna: DnaInput }) {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('composite')
  const [showCount, setShowCount] = useState(10)
  const all = useMemo(() => scoreInvestments(dna), [dna])
  const displayed = useMemo(() => {
    let items = filter === 'all' ? all : all.filter(i => i.type === filter)
    if (sort === 'dna') items = [...items].sort((a, b) => b.dnaCompatibility - a.dnaCompatibility)
    else if (sort === 'quality') items = [...items].sort((a, b) => b.quality - a.quality)
    else if (sort === 'growth') items = [...items].sort((a, b) => b.growth - a.growth)
    return items
  }, [all, filter, sort])

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <p className="text-[#94a3b8] text-sm">{all.length} investments ranked by DNA profile. Composite = 55% DNA fit + 45% fundamentals.</p>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'stock', 'etf'] as FilterType[]).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn('px-3 py-1.5 rounded-[8px] text-xs font-medium transition-colors capitalize cursor-pointer',
                filter === f ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.3)]' : 'bg-[#0f0f1a] text-[#64748b] border border-[#1e1e3a] hover:text-[#94a3b8]'
              )}>{f === 'all' ? 'All' : f.toUpperCase()}</button>
          ))}
          <select value={sort} onChange={e => setSort(e.target.value as SortType)}
            className="px-3 py-1.5 rounded-[8px] text-xs bg-[#0f0f1a] text-[#64748b] border border-[#1e1e3a] cursor-pointer outline-none">
            <option value="composite">Sort: Composite</option>
            <option value="dna">Sort: DNA Match</option>
            <option value="quality">Sort: Quality</option>
            <option value="growth">Sort: Growth</option>
          </select>
        </div>
      </div>
      <div className="flex items-center gap-4 text-[10px] text-[#64748b]">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#10b981]" />Strong Fit (75+)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#f59e0b]" />Good Fit (55–74)</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#ef4444]" />Partial Fit (&lt;55)</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {displayed.slice(0, showCount).map((inv, i) => <InvestmentCard key={inv.ticker} inv={inv} rank={i} />)}
      </div>
      {showCount < displayed.length && (
        <div className="flex justify-center">
          <Button variant="secondary" size="sm" onClick={() => setShowCount(s => s + 10)}>Load {Math.min(10, displayed.length - showCount)} more</Button>
        </div>
      )}
    </div>
  )
}

// ─── Portfolio Builder Tab ────────────────────────────────────────────────────

type BuilderLevel = 'starter' | 'growth' | 'advanced'
const LEVEL_META: Record<BuilderLevel, { label: string; description: string; icon: React.ComponentType<any>; color: string }> = {
  starter: { label: 'Foundation', description: 'ETFs only. Simple, low-cost, and beginner-friendly.', icon: Shield, color: '#10b981' },
  growth: { label: 'Growth', description: 'Core ETFs + thematic satellites matching your interests.', icon: TrendingUp, color: '#3b82f6' },
  advanced: { label: 'Advanced', description: 'ETFs + individual stocks for concentrated conviction.', icon: Zap, color: '#f59e0b' },
}

function AllocationDonut({ positions }: { positions: Array<{ allocation: number; color: string }> }) {
  const size = 120, r = 45, cx = 60, cy = 60
  const circumference = 2 * Math.PI * r
  let offset = 0
  const slices = positions.map(p => {
    const dash = p.allocation * circumference
    const s = { ...p, dash, gap: circumference - dash, offset }
    offset += dash
    return s
  })
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {slices.map((s, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="14"
            strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset} />
        ))}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[10px] text-[#64748b]">positions</p>
          <p className="text-lg font-bold text-[#f1f5f9]">{positions.length}</p>
        </div>
      </div>
    </div>
  )
}

function EtfSlotCard({ slot, selectedTicker, onSelect }: { slot: typeof ETF_SLOTS[0]; selectedTicker: string; onSelect: (t: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-[#1e1e3a] rounded-[12px] overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between p-3 bg-[#0f0f1a] hover:bg-[#111120] transition-colors cursor-pointer">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[#64748b]" />
          <div className="text-left">
            <p className="text-sm font-medium text-[#f1f5f9]">{slot.label}</p>
            <p className="text-xs text-[#64748b]">{slot.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-[#3b82f6]">{selectedTicker}</span>
          {open ? <ChevronUp className="w-4 h-4 text-[#64748b]" /> : <ChevronDown className="w-4 h-4 text-[#64748b]" />}
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-3 space-y-2">
              {slot.options.map(opt => (
                <button key={opt.ticker} onClick={() => onSelect(opt.ticker)}
                  className={cn('w-full text-left p-2.5 rounded-[8px] border transition-all cursor-pointer',
                    selectedTicker === opt.ticker ? 'border-[rgba(59,130,246,0.4)] bg-[rgba(59,130,246,0.06)]' : 'border-[#1e1e3a] bg-[#0a0a14] hover:border-[#2e2e4a]'
                  )}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-[#f1f5f9]">{opt.ticker}</span>
                        <span className="text-xs text-[#64748b]">{opt.provider}</span>
                        {opt.recommended && <span className="text-[9px] bg-[rgba(16,185,129,0.15)] text-[#10b981] px-1.5 py-0.5 rounded-full font-semibold">Recommended</span>}
                      </div>
                      <p className="text-xs text-[#94a3b8] mt-0.5 leading-relaxed">{opt.pros}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-sm font-bold text-[#f1f5f9]">{(opt.expenseRatio * 100).toFixed(2)}%</p>
                      <p className="text-[10px] text-[#64748b]">fee/yr</p>
                    </div>
                  </div>
                  {selectedTicker === opt.ticker && <div className="flex items-center gap-1 mt-1.5 text-[#3b82f6] text-[10px]"><Check className="w-3 h-3" /> Selected</div>}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PortfolioBuilderTab({ dna }: { dna: DnaInput }) {
  const [level, setLevel] = useState<BuilderLevel>('starter')
  const [selectedTickers, setSelectedTickers] = useState<Record<string, string>>(() =>
    Object.fromEntries(ETF_SLOTS.map(s => [s.id, s.recommended]))
  )
  const blueprint = useMemo(() => buildPortfolio(dna, level), [dna, level])
  const allPositions = [...blueprint.core, ...blueprint.satellite]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        {(Object.entries(LEVEL_META) as [BuilderLevel, typeof LEVEL_META['starter']][]).map(([l, meta]) => {
          const Icon = meta.icon
          return (
            <button key={l} onClick={() => setLevel(l)}
              className={cn('p-3 rounded-[12px] border text-left transition-all cursor-pointer', level === l ? '' : 'border-[#1e1e3a] bg-[#0a0a14] hover:border-[#2e2e4a]')}
              style={level === l ? { borderColor: meta.color, background: `${meta.color}10` } : {}}>
              <Icon className="w-5 h-5 mb-2" style={{ color: meta.color }} />
              <p className="text-sm font-semibold text-[#f1f5f9]">{meta.label}</p>
              <p className="text-[10px] text-[#64748b] mt-0.5 leading-relaxed">{meta.description}</p>
            </button>
          )
        })}
      </div>

      <div className="flex gap-4 flex-wrap md:flex-nowrap">
        <AllocationDonut positions={allPositions} />
        <div className="flex-1 min-w-0 space-y-2">
          <h3 className="font-semibold text-[#f1f5f9]">{blueprint.title}</h3>
          <p className="text-sm text-[#94a3b8]">{blueprint.description}</p>
          <div className="flex gap-4 flex-wrap">
            <div><p className="text-[10px] text-[#64748b] uppercase tracking-wide">Risk</p><p className="text-sm font-medium text-[#f1f5f9]">{blueprint.riskLabel}</p></div>
            <div><p className="text-[10px] text-[#64748b] uppercase tracking-wide">Expected Return</p><p className="text-sm font-medium text-[#10b981]">{blueprint.expectedReturnLabel}</p></div>
          </div>
          <p className="text-xs text-[#64748b] leading-relaxed">{blueprint.explanation}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-[#3b82f6]" /> Core Holdings</h4>
        <div className="space-y-2">
          {blueprint.core.map(pos => (
            <div key={pos.ticker} className="flex items-start gap-3 p-3 rounded-[10px] bg-[#0f0f1a] border border-[#1e1e3a]">
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: pos.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2"><span className="font-bold text-[#f1f5f9] text-sm">{pos.ticker}</span><span className="text-xs text-[#64748b]">{pos.name}</span></div>
                  <span className="text-sm font-bold text-[#f1f5f9] flex-shrink-0">{Math.round(pos.allocation * 100)}%</span>
                </div>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">{pos.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {blueprint.satellite.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-[#8b5cf6]" /> Satellite Positions</h4>
          <div className="space-y-2">
            {blueprint.satellite.map(pos => (
              <div key={pos.ticker} className="flex items-start gap-3 p-3 rounded-[10px] bg-[#0f0f1a] border border-[#1e1e3a]">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: pos.color }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><span className="font-bold text-[#f1f5f9] text-sm">{pos.ticker}</span><span className="text-xs text-[#64748b]">{pos.name}</span></div>
                    <span className="text-sm font-bold text-[#f1f5f9] flex-shrink-0">{Math.round(pos.allocation * 100)}%</span>
                  </div>
                  <p className="text-xs text-[#64748b] mt-1">{pos.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold text-[#f1f5f9] mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#f59e0b]" /> ETF Provider Comparison</h4>
        <div className="space-y-2">
          {blueprint.etfSlots.map(slot => (
            <EtfSlotCard key={slot.id} slot={slot} selectedTicker={selectedTickers[slot.id] ?? slot.recommended} onSelect={t => setSelectedTickers(s => ({ ...s, [slot.id]: t }))} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Explore Themes Tab ───────────────────────────────────────────────────────

function ExploreThemesTab({ dna }: { dna: DnaInput }) {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const themeInvestments = useMemo(() => selectedTheme ? getThemeInvestments(selectedTheme, dna) : [], [selectedTheme, dna])
  const activeTheme = THEMES.find(t => t.id === selectedTheme)

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#94a3b8]">Select a theme to discover investments in that space, ranked by your DNA compatibility.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {THEMES.map(theme => (
          <button key={theme.id} onClick={() => setSelectedTheme(t => t === theme.id ? null : theme.id)}
            className={cn('p-3 rounded-[12px] border text-left transition-all cursor-pointer', selectedTheme === theme.id ? '' : 'border-[#1e1e3a] bg-[#0a0a14] hover:border-[#2e2e4a]')}
            style={selectedTheme === theme.id ? { borderColor: theme.color, background: `${theme.color}12` } : {}}>
            <div className="text-xl mb-2">{theme.icon}</div>
            <p className="text-xs font-semibold text-[#f1f5f9] leading-snug">{theme.label}</p>
            <p className="text-[9px] text-[#64748b] mt-1">{theme.investments.length} investments</p>
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {activeTheme && (
          <motion.div key={activeTheme.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }} className="space-y-3">
            <div className="p-4 rounded-[12px] border" style={{ borderColor: `${activeTheme.color}30`, background: `${activeTheme.color}08` }}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{activeTheme.icon}</span>
                <div>
                  <h3 className="font-semibold" style={{ color: activeTheme.color }}>{activeTheme.label}</h3>
                  <p className="text-xs text-[#94a3b8] mt-0.5">{activeTheme.description}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              {themeInvestments.map((inv, i) => {
                const compatColor = inv.dnaCompatibility >= 75 ? '#10b981' : inv.dnaCompatibility >= 55 ? '#f59e0b' : '#ef4444'
                return (
                  <motion.div key={inv.ticker} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-[10px] bg-[#0f0f1a] border border-[#1e1e3a] hover:border-[#2e2e4a] transition-colors">
                    <span className="text-xs text-[#64748b] w-6">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#f1f5f9] text-sm">{inv.ticker}</span>
                        {inv.type === 'etf' && <Badge variant="info" size="sm" className="text-[10px]">ETF</Badge>}
                        <span className="text-xs text-[#64748b] truncate">{inv.name}</span>
                      </div>
                      <CompatibilityBar score={inv.dnaCompatibility} className="mt-1.5 max-w-[200px]" />
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-[#64748b]">
                      <span>Q:<strong className="text-[#94a3b8] ml-0.5">{inv.quality}</strong></span>
                      <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center text-xs font-bold" style={{ borderColor: compatColor, color: compatColor }}>{inv.compositeScore}</div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Discover Tab ─────────────────────────────────────────────────────────────

const RISK_FILTER_OPTIONS: Array<{ value: RiskLevel | 'any'; label: string }> = [
  { value: 'any', label: 'Any Risk' }, { value: 'low', label: 'Low Risk' },
  { value: 'medium', label: 'Medium Risk' }, { value: 'high', label: 'High Risk' }, { value: 'very_high', label: 'Very High Risk' },
]

function DiscoverTab({ dna }: { dna: DnaInput }) {
  const [template, setTemplate] = useState<DiscoverTemplate>('quality_compounder')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'any'>('any')
  const [results, setResults] = useState<ScoredInvestment[] | null>(null)
  const [loading, setLoading] = useState(false)
  const meta = TEMPLATE_META[template]

  function handleDiscover() {
    setLoading(true); setResults(null)
    setTimeout(() => {
      setResults(discover(template, dna, riskFilter === 'any' ? undefined : riskFilter))
      setLoading(false)
    }, 600)
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-[#94a3b8]">Pick a discovery template and let the engine surface the best-matching investments for your profile.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {(Object.entries(TEMPLATE_META) as [DiscoverTemplate, typeof TEMPLATE_META['hidden_gem']][]).map(([t, m]) => (
          <button key={t} onClick={() => { setTemplate(t); setResults(null) }}
            className={cn('p-3 rounded-[12px] border text-left transition-all cursor-pointer', template === t ? '' : 'border-[#1e1e3a] bg-[#0a0a14] hover:border-[#2e2e4a]')}
            style={template === t ? { borderColor: m.color, background: `${m.color}12` } : {}}>
            <div className="text-xl mb-1.5">{m.icon}</div>
            <p className="text-xs font-semibold text-[#f1f5f9]">{m.label}</p>
            <p className="text-[9px] text-[#64748b] mt-0.5 leading-relaxed">{m.description}</p>
          </button>
        ))}
      </div>
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 p-3 rounded-[10px] border flex items-center gap-3" style={{ borderColor: `${meta.color}30`, background: `${meta.color}08` }}>
          <span className="text-lg">{meta.icon}</span>
          <div><p className="text-sm font-semibold text-[#f1f5f9]">{meta.label}</p><p className="text-xs text-[#64748b]">{meta.description}</p></div>
        </div>
        <select value={riskFilter} onChange={e => setRiskFilter(e.target.value as RiskLevel | 'any')}
          className="px-3 py-2 rounded-[8px] text-sm bg-[#0f0f1a] text-[#94a3b8] border border-[#1e1e3a] outline-none cursor-pointer">
          {RISK_FILTER_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button onClick={handleDiscover} disabled={loading} className="flex items-center gap-2 flex-shrink-0">
          <Shuffle className="w-4 h-4" />{loading ? 'Discovering...' : 'Discover'}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 py-12 text-[#64748b]">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><Sparkles className="w-8 h-8 text-[#3b82f6]" /></motion.div>
            <p className="text-sm">Scanning the universe for your DNA profile...</p>
          </motion.div>
        )}
        {results !== null && !loading && (
          <motion.div key="results" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {results.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Info className="w-8 h-8 text-[#64748b]" />
                <p className="text-[#94a3b8] font-medium">No matches found</p>
                <p className="text-xs text-[#64748b]">Try removing the risk filter or selecting a different template.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#f59e0b]" />
                  <p className="text-sm text-[#94a3b8]">{results.length} investment{results.length !== 1 ? 's' : ''} matching <span className="text-[#f1f5f9] font-medium">{meta.label}</span></p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {results.map((inv, i) => {
                    const compatColor = inv.dnaCompatibility >= 75 ? '#10b981' : inv.dnaCompatibility >= 55 ? '#f59e0b' : '#ef4444'
                    return (
                      <motion.div key={inv.ticker} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
                        <Card hover glow className="h-full">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2"><span className="font-bold text-[#f1f5f9]">{inv.ticker}</span>{inv.type === 'etf' && <Badge variant="info" size="sm" className="text-[10px]">ETF</Badge>}</div>
                              <p className="text-xs text-[#64748b] mt-0.5">{inv.name}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-sm font-bold flex-shrink-0" style={{ borderColor: compatColor, color: compatColor }}>{inv.compositeScore}</div>
                          </div>
                          <div className="p-2.5 rounded-[8px] bg-[rgba(59,130,246,0.06)] border border-[rgba(59,130,246,0.12)] mb-3">
                            <p className="text-xs text-[#94a3b8] leading-relaxed">{inv.whyItFitsYou}</p>
                          </div>
                          <CompatibilityBar score={inv.dnaCompatibility} className="mb-3" />
                          <div className="grid grid-cols-3 gap-2 mb-3 text-center text-[10px]">
                            <div className="p-1.5 rounded-[6px] bg-[#0f0f1a]"><p className="text-[#64748b]">Allocation</p><p className="font-bold text-[#f1f5f9]">{inv.suggestedAllocation}</p></div>
                            <div className="p-1.5 rounded-[6px] bg-[#0f0f1a]"><p className="text-[#64748b]">Role</p><p className="font-bold capitalize" style={{ color: ROLE_COLORS[inv.suggestedRole] }}>{inv.suggestedRole}</p></div>
                            <div className="p-1.5 rounded-[6px] bg-[#0f0f1a]"><p className="text-[#64748b]">Risk</p><p className="font-bold" style={{ color: RISK_COLORS[inv.riskLevel] }}>{RISK_LABELS[inv.riskLevel]}</p></div>
                          </div>
                          {inv.keyRisks.slice(0, 2).map((risk, ri) => (
                            <p key={ri} className="text-[10px] text-[#64748b] flex items-start gap-1"><span className="text-[#ef4444] flex-shrink-0">•</span>{risk}</p>
                          ))}
                          <div className="mt-3 pt-2.5 border-t border-[#1e1e3a] flex items-center justify-between text-[10px] text-[#64748b]">
                            <span>Confidence: <strong className="text-[#3b82f6]">{inv.confidenceScore}%</strong></span>
                            <span>Beta: <strong className="text-[#94a3b8]">{inv.beta.toFixed(2)}</strong></span>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })}
                </div>
              </>
            )}
          </motion.div>
        )}
        {results === null && !loading && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 py-12 text-center text-[#64748b]">
            <Compass className="w-10 h-10" />
            <p className="text-sm font-medium">Choose a template and click Discover</p>
            <p className="text-xs">The engine will surface the top DNA-matched investments for your chosen strategy.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type TabId = 'for_you' | 'build' | 'themes' | 'discover'
const TABS: Array<{ id: TabId; label: string; icon: React.ComponentType<any> }> = [
  { id: 'for_you', label: 'For You', icon: Sparkles },
  { id: 'build', label: 'Build Portfolio', icon: PieChart },
  { id: 'themes', label: 'Explore Themes', icon: Compass },
  { id: 'discover', label: 'Discover', icon: Shuffle },
]

export function OpportunitiesPage() {
  const { dna: rawDna } = useAuth()
  const [activeTab, setActiveTab] = useState<TabId>('for_you')
  const dna = useMemo(() => rawDna ? toDnaInput(rawDna) : null, [rawDna])
  if (!dna) return null

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#3b82f6]" /> Investment Discovery
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">DNA-powered recommendations — every suggestion scored for compatibility with your investor profile</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-[#64748b] bg-[#0f0f1a] border border-[#1e1e3a] px-3 py-2 rounded-[10px]">
          <Info className="w-3.5 h-3.5" /><span>Composite = 55% DNA + 45% fundamentals</span>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-[#0a0a14] rounded-[14px] border border-[#1e1e3a] overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn('flex items-center gap-2 px-4 py-2.5 rounded-[10px] transition-all whitespace-nowrap flex-1 justify-center cursor-pointer',
                active ? 'bg-[rgba(59,130,246,0.15)] text-[#60a5fa] border border-[rgba(59,130,246,0.25)]' : 'text-[#64748b] hover:text-[#94a3b8] hover:bg-[#0f0f1a]'
              )}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
          {activeTab === 'for_you' && <ForYouTab dna={dna} />}
          {activeTab === 'build' && <PortfolioBuilderTab dna={dna} />}
          {activeTab === 'themes' && <ExploreThemesTab dna={dna} />}
          {activeTab === 'discover' && <DiscoverTab dna={dna} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
