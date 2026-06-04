import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Dna, Brain, ShieldAlert, Zap, Target, TrendingUp, Eye, CircleCheck as CheckCircle, TriangleAlert, Info } from 'lucide-react'
import { Card, MetricCard, Badge } from '@/components/ui'
import { ScoreRing, ProgressBar } from '@/components/ui/Progress'
import { useAuth } from '@/context/AuthContext'
import { computeDnaProfile, mockCompatibilityScores, getRiskLabel, getRiskColor, getScoreColor, type ComputedDnaProfile } from '@/lib/dna-engine'
import { ALL_ARCHETYPES, ARCHETYPE_CATEGORIES } from '@/lib/archetypes'
import { cn } from '@/lib/utils'

const FADE_UP = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }) }

export function DnaProfilePage() {
  const { dna } = useAuth()

  const dnaInput = useMemo(() => {
    if (!dna) return null
    return {
      emotional_profile: (dna as any).emotional_profile ?? 'rational',
      wealth_style: (dna as any).wealth_style ?? 'balanced',
      time_horizon: (dna as any).time_horizon ?? 'long',
      knowledge_level: (dna as any).knowledge_level ?? 'intermediate',
      time_commitment: (dna as any).time_commitment ?? 'monthly',
      volatility_tolerance: (dna as any).volatility_tolerance ?? 'moderate',
      drawdown_tolerance: (dna as any).drawdown_tolerance ?? 20,
      sector_interests: (dna as any).sector_interests ?? [],
      risk_score: (dna as any).risk_score ?? 50,
      answers: (dna as any).answers ?? {},
    }
  }, [dna])

  const profile = useMemo(() => {
    if (!dnaInput) return null
    return computeDnaProfile(dnaInput)
  }, [dnaInput])

  const compatibility = useMemo(() => {
    if (!dnaInput) return []
    return mockCompatibilityScores(dnaInput)
  }, [dnaInput])

  if (!dnaInput || !profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card><p className="text-[#64748b] text-sm">DNA profile not yet computed. Complete your assessment first.</p></Card>
      </div>
    )
  }

  const primaryInv = ALL_ARCHETYPES[profile.primaryInvestmentArchetype]
  const primaryBeh = ALL_ARCHETYPES[profile.primaryBehavioralArchetype]
  const primaryOps = ALL_ARCHETYPES[profile.primaryOperationalArchetype]
  const riskColor = getRiskColor(profile.riskLevel)
  const scoreColor = getScoreColor(profile.riskScore)

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] flex items-center gap-2">
            <Dna className="w-6 h-6 text-[#3b82f6]" />
            Investor DNA Profile
          </h1>
          <p className="text-[#64748b] text-sm mt-0.5">Your personalized behavioral and investment archetype analysis</p>
        </div>
        <Badge variant="info" size="sm">DNA 2.0</Badge>
      </div>

      {/* ── Hero: Primary Archetype Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[16px] border border-[#1e1e3a] p-6 md:p-8"
        style={{ background: 'linear-gradient(135deg, #09090f 0%, #0f0f1a 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 80% 20%, ${primaryInv.color}60 0%, transparent 60%)` }}
        />
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${primaryInv.color}20`, border: `1px solid ${primaryInv.color}40` }}
              >
                {primaryInv.icon}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-[#64748b] mb-1">Primary Investment Archetype</p>
                <h2 className="text-xl font-bold" style={{ color: primaryInv.color }}>{primaryInv.label}</h2>
                <p className="text-sm text-[#94a3b8]">{primaryInv.tagline}</p>
              </div>
            </div>
            <p className="text-sm text-[#94a3b8] leading-relaxed mb-4">{primaryInv.description}</p>
            <div className="flex flex-wrap gap-2">
              {profile.personalityTags.map(tag => (
                <Badge key={tag} variant="ghost" size="sm">{tag}</Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <ScoreRing score={profile.riskScore} size={100} color={riskColor} label="Risk Score" />
            <div className="text-center">
              <p className="text-sm font-semibold" style={{ color: riskColor }}>{getRiskLabel(profile.riskLevel)}</p>
              <p className="text-xs text-[#64748b]">Risk Profile</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Three Archetype Pillars ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Investment Style', archetype: primaryInv, label: 'Investment Archetype', icon: TrendingUp },
          { title: 'Behavioral Pattern', archetype: primaryBeh, label: 'Behavioral Archetype', icon: Brain },
          { title: 'Operational Mode', archetype: primaryOps, label: 'Operational Archetype', icon: Target },
        ].map(({ title, archetype, label, icon: Icon }, i) => (
          <motion.div key={archetype.id} custom={i} variants={FADE_UP} initial="hidden" animate="visible">
            <Card className="h-full" hover>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ background: `${archetype.color}18`, border: `1px solid ${archetype.color}30` }}
                >
                  {archetype.icon}
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#64748b]">{label}</p>
                  <p className="font-semibold text-sm" style={{ color: archetype.color }}>{archetype.label}</p>
                </div>
              </div>
              <p className="text-xs text-[#94a3b8] leading-relaxed mb-3">{archetype.tagline}</p>
              <div className="flex flex-wrap gap-1">
                {archetype.traits.slice(0, 3).map(t => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full text-[#64748b]" style={{ background: '#1e1e3a' }}>{t}</span>
                ))}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Archetype Score Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ArchetypeBreakdown
          title="Investment Archetypes"
          icon={<TrendingUp className="w-4 h-4 text-[#3b82f6]" />}
          scores={profile.investmentScores}
          archetypes={ARCHETYPE_CATEGORIES.investment}
          primary={profile.primaryInvestmentArchetype}
        />
        <ArchetypeBreakdown
          title="Behavioral Archetypes"
          icon={<Brain className="w-4 h-4 text-[#10b981]" />}
          scores={profile.behavioralScores}
          archetypes={ARCHETYPE_CATEGORIES.behavioral}
          primary={profile.primaryBehavioralArchetype}
        />
        <ArchetypeBreakdown
          title="Operational Archetypes"
          icon={<Target className="w-4 h-4 text-[#f59e0b]" />}
          scores={profile.operationalScores}
          archetypes={ARCHETYPE_CATEGORIES.operational}
          primary={profile.primaryOperationalArchetype}
        />
      </div>

      {/* ── Strengths & Blind Spots ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <motion.div custom={4} variants={FADE_UP} initial="hidden" animate="visible">
          <Card>
            <h3 className="font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#10b981]" />
              Your Strengths
            </h3>
            <div className="space-y-3">
              {profile.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-[10px] bg-[rgba(16,185,129,0.06)] border border-[rgba(16,185,129,0.15)]">
                  <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#f1f5f9]">{s}</p>
                </div>
              ))}
              {primaryInv.strengths.slice(2).map((s, i) => (
                <div key={`extra-${i}`} className="flex items-start gap-3 p-3 rounded-[10px] bg-[rgba(16,185,129,0.04)] border border-[rgba(16,185,129,0.1)]">
                  <CheckCircle className="w-4 h-4 text-[#10b981] flex-shrink-0 mt-0.5 opacity-60" />
                  <p className="text-sm text-[#94a3b8]">{s}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Blind Spots */}
        <motion.div custom={5} variants={FADE_UP} initial="hidden" animate="visible">
          <Card>
            <h3 className="font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#f59e0b]" />
              Blind Spots to Watch
            </h3>
            <div className="space-y-3">
              {profile.blindSpots.map((b, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-[10px] bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.15)]">
                  <TriangleAlert className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#f1f5f9]">{b}</p>
                </div>
              ))}
              {primaryInv.blindSpots.slice(2).map((b, i) => (
                <div key={`extra-${i}`} className="flex items-start gap-3 p-3 rounded-[10px] bg-[rgba(245,158,11,0.04)] border border-[rgba(245,158,11,0.1)]">
                  <TriangleAlert className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5 opacity-60" />
                  <p className="text-sm text-[#94a3b8]">{b}</p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Compatibility Engine ── */}
      <CompatibilitySection scores={compatibility} />

      {/* ── All 12 Archetypes Explorer ── */}
      <ArchetypeExplorer profile={profile} />
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ArchetypeBreakdown({
  title,
  icon,
  scores,
  archetypes,
  primary,
}: {
  title: string
  icon: React.ReactNode
  scores: Record<string, number>
  archetypes: readonly any[]
  primary: string
}) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
        {icon}
        {title}
      </h3>
      <div className="space-y-3">
        {archetypes.map(arch => {
          const score = scores[arch.id] ?? 0
          const isPrimary = arch.id === primary
          return (
            <div key={arch.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{arch.icon}</span>
                  <span className={cn('text-xs font-medium', isPrimary ? 'text-[#f1f5f9]' : 'text-[#64748b]')}>{arch.label}</span>
                  {isPrimary && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(59,130,246,0.2)] text-[#60a5fa] font-bold uppercase">Primary</span>}
                </div>
                <span className="text-xs font-semibold" style={{ color: isPrimary ? arch.color : '#64748b' }}>{score}%</span>
              </div>
              <ProgressBar value={score} color={isPrimary ? arch.color : '#1e1e3a'} />
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function CompatibilitySection({ scores }: { scores: ReturnType<typeof mockCompatibilityScores> }) {
  const top5 = scores.slice(0, 5)
  const bottom3 = scores.slice(-3).reverse()

  return (
    <Card>
      <h3 className="font-semibold text-[#f1f5f9] mb-1 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-[#3b82f6]" />
        Compatibility Engine
      </h3>
      <p className="text-xs text-[#64748b] mb-5">How well each asset matches your unique investor DNA profile</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top matches */}
        <div>
          <p className="text-xs font-semibold text-[#10b981] uppercase tracking-wider mb-3">Best Matches</p>
          <div className="space-y-3">
            {top5.map((s, i) => (
              <CompatibilityRow key={s.ticker} score={s} rank={i + 1} />
            ))}
          </div>
        </div>

        {/* Poor matches */}
        <div>
          <p className="text-xs font-semibold text-[#f59e0b] uppercase tracking-wider mb-3">Weak Matches</p>
          <div className="space-y-3">
            {bottom3.map((s, i) => (
              <CompatibilityRow key={s.ticker} score={s} rank={scores.length - i} />
            ))}
          </div>

          <div className="mt-5 p-3 rounded-[10px] border border-[rgba(59,130,246,0.15)] bg-[rgba(59,130,246,0.05)]">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-[#3b82f6] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-[#94a3b8]">
                Compatibility scores reflect how well an asset's characteristics align with your archetype profile, risk tolerance, and investment objectives — not a buy/sell recommendation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function CompatibilityRow({ score, rank }: { score: ReturnType<typeof mockCompatibilityScores>[0]; rank: number }) {
  const color = getScoreColor(score.score)

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#334155] w-4 text-right flex-shrink-0">#{rank}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#f1f5f9]">{score.ticker}</span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: `${color}20`, color }}
            >
              {score.label}
            </span>
          </div>
          <span className="text-sm font-bold" style={{ color }}>{score.score}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#1e1e3a] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score.score}%` }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="h-full rounded-full"
            style={{ background: color }}
          />
        </div>
        {score.reasons[0] && <p className="text-[10px] text-[#64748b] mt-1">{score.reasons[0]}</p>}
      </div>
    </div>
  )
}

function ArchetypeExplorer({ profile }: { profile: ComputedDnaProfile }) {
  const categories = [
    { label: 'Investment Archetypes', archetypes: ARCHETYPE_CATEGORIES.investment, primary: profile.primaryInvestmentArchetype },
    { label: 'Behavioral Archetypes', archetypes: ARCHETYPE_CATEGORIES.behavioral, primary: profile.primaryBehavioralArchetype },
    { label: 'Operational Archetypes', archetypes: ARCHETYPE_CATEGORIES.operational, primary: profile.primaryOperationalArchetype },
  ]

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#f1f5f9]">All 12 Archetypes</h2>
      {categories.map(cat => (
        <div key={cat.label}>
          <p className="text-xs uppercase tracking-wider text-[#64748b] mb-3">{cat.label}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {cat.archetypes.map(arch => {
              const isPrimary = arch.id === cat.primary
              return (
                <motion.div
                  key={arch.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'rounded-[14px] p-4 border transition-all',
                    isPrimary ? 'border-opacity-50' : 'border-[#1e1e3a] bg-[#0f0f1a]'
                  )}
                  style={isPrimary ? {
                    background: `linear-gradient(135deg, ${arch.color}10, ${arch.color}05)`,
                    borderColor: `${arch.color}40`,
                  } : {}}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{arch.icon}</span>
                      <div>
                        <p className="text-sm font-semibold text-[#f1f5f9]">{arch.label}</p>
                        <p className="text-[10px] text-[#64748b]">{arch.tagline}</p>
                      </div>
                    </div>
                    {isPrimary && (
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0"
                        style={{ background: `${arch.color}25`, color: arch.color }}
                      >
                        You
                      </span>
                    )}
                  </div>

                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-[#10b981] uppercase tracking-wide mb-1.5">Strengths</p>
                    <ul className="space-y-1">
                      {arch.strengths.slice(0, 2).map((s: string, i: number) => (
                        <li key={i} className="text-[11px] text-[#94a3b8] flex items-start gap-1.5">
                          <span className="text-[#10b981] flex-shrink-0">+</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-[10px] font-semibold text-[#ef4444] uppercase tracking-wide mb-1.5">Blind Spots</p>
                    <ul className="space-y-1">
                      {arch.blindSpots.slice(0, 2).map((b: string, i: number) => (
                        <li key={i} className="text-[11px] text-[#94a3b8] flex items-start gap-1.5">
                          <span className="text-[#ef4444] flex-shrink-0">-</span>{b}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {arch.traits.slice(0, 3).map((t: string) => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded-full text-[#64748b]" style={{ background: '#1e1e3a' }}>{t}</span>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
