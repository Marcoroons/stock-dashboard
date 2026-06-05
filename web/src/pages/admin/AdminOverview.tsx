import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, Users, DollarSign, Percent, Activity } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface KPIs {
  totalUsers: number
  payingUsers: number
  mrr: number
  conversionRate: number
}

interface DailySignup {
  date: string
  count: number
}

interface FeatureCount {
  event_name: string
  count: number
}

const FEATURE_COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

function KpiCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: string; sub?: string; icon: React.ElementType; color: string
}) {
  return (
    <div className="rounded-[16px] p-5 border border-[#1e1e3a]" style={{ background: '#0f0f1a' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-[10px] flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-4.5 h-4.5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-[#f1f5f9]">{value}</p>
      <p className="text-xs text-[#64748b] mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-[#475569] mt-1">{sub}</p>}
    </div>
  )
}

export function AdminOverview() {
  const [kpis, setKpis] = useState<KPIs | null>(null)
  const [signups, setSignups] = useState<DailySignup[]>([])
  const [features, setFeatures] = useState<FeatureCount[]>([])

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    const [profilesRes, subsRes, eventsRes] = await Promise.all([
      supabase.from('profiles').select('id, subscription_tier, created_at'),
      supabase.from('subscriptions').select('user_id, status').eq('status', 'active'),
      supabase.from('analytics_events').select('event_name, created_at'),
    ])

    const profiles = profilesRes.data ?? []
    const activeSubs = subsRes.data ?? []
    const events = eventsRes.data ?? []

    const totalUsers = profiles.length
    const payingUsers = activeSubs.length
    const conversionRate = totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0

    // MRR estimate from tier distribution
    const plusCount = profiles.filter(p => p.subscription_tier === 'plus').length
    const proCount = profiles.filter(p => p.subscription_tier === 'pro').length
    const mrr = plusCount * 5 + proCount * 15

    setKpis({ totalUsers, payingUsers, mrr, conversionRate })

    // Daily signups (last 30 days)
    const now = Date.now()
    const buckets: Record<string, number> = {}
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().split('T')[0]
      buckets[d] = 0
    }
    profiles.forEach(p => {
      const d = p.created_at?.split('T')[0]
      if (d && d in buckets) buckets[d]++
    })
    setSignups(Object.entries(buckets).map(([date, count]) => ({ date: date.slice(5), count })))

    // Feature usage counts
    const counts: Record<string, number> = {}
    events.forEach(e => {
      counts[e.event_name] = (counts[e.event_name] ?? 0) + 1
    })
    const sorted = Object.entries(counts)
      .map(([event_name, count]) => ({ event_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    setFeatures(sorted)
  }

  const formatLabel = (name: string) => name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Users"      value={kpis ? kpis.totalUsers.toLocaleString() : '—'}         icon={Users}      color="#3b82f6" />
        <KpiCard label="Paying Users"     value={kpis ? kpis.payingUsers.toLocaleString() : '—'}        icon={TrendingUp} color="#10b981" />
        <KpiCard label="Est. MRR"         value={kpis ? `$${kpis.mrr.toLocaleString()}` : '—'}          icon={DollarSign} color="#f59e0b" sub="based on tier distribution" />
        <KpiCard label="Conversion Rate"  value={kpis ? `${kpis.conversionRate.toFixed(1)}%` : '—'}     icon={Percent}    color="#06b6d4" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Signup trend */}
        <div className="rounded-[16px] p-5 border border-[#1e1e3a]" style={{ background: '#0f0f1a' }}>
          <p className="text-sm font-semibold text-[#f1f5f9] mb-4">New Signups — Last 30 Days</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={signups} barSize={8}>
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e1e3a', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature usage */}
        <div className="rounded-[16px] p-5 border border-[#1e1e3a]" style={{ background: '#0f0f1a' }}>
          <p className="text-sm font-semibold text-[#f1f5f9] mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#06b6d4]" /> Feature Usage
          </p>
          {features.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-sm text-[#475569]">No events tracked yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={features} layout="vertical" barSize={10} margin={{ left: 0, right: 8 }}>
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category" dataKey="event_name"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickLine={false} axisLine={false} width={130}
                  tickFormatter={formatLabel}
                />
                <Tooltip
                  contentStyle={{ background: '#1e1e3a', border: 'none', borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: '#94a3b8' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  formatter={(v: number) => [v, 'Events']}
                  labelFormatter={formatLabel}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {features.map((_, i) => (
                    <Cell key={i} fill={FEATURE_COLORS[i % FEATURE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
