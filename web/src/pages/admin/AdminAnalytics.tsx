import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface EventCount {
  event_name: string
  count: number
}

interface DailyActive {
  date: string
  users: number
}

interface RecentEvent {
  id: string
  event_name: string
  properties: Record<string, unknown>
  created_at: string
  user_id: string | null
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#f97316']

const formatLabel = (name: string) => name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

export function AdminAnalytics() {
  const [counts, setCounts] = useState<EventCount[]>([])
  const [dau, setDau] = useState<DailyActive[]>([])
  const [recent, setRecent] = useState<RecentEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [eventsRes, recentRes] = await Promise.all([
      supabase.from('analytics_events').select('event_name, user_id, created_at'),
      supabase.from('analytics_events').select('id, event_name, properties, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    const events = eventsRes.data ?? []
    setRecent((recentRes.data as RecentEvent[]) ?? [])

    // Event counts
    const countMap: Record<string, number> = {}
    events.forEach(e => { countMap[e.event_name] = (countMap[e.event_name] ?? 0) + 1 })
    setCounts(
      Object.entries(countMap)
        .map(([event_name, count]) => ({ event_name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 12)
    )

    // Daily active users (last 14 days)
    const now = Date.now()
    const buckets: Record<string, Set<string>> = {}
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().split('T')[0]
      buckets[d] = new Set()
    }
    events.forEach(e => {
      const d = e.created_at?.split('T')[0]
      if (d && d in buckets && e.user_id) buckets[d].add(e.user_id)
    })
    setDau(Object.entries(buckets).map(([date, set]) => ({ date: date.slice(5), users: set.size })))
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {/* Event counts + DAU */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-[16px] p-5 border border-[#1e1e3a]" style={{ background: '#0f0f1a' }}>
          <p className="text-sm font-semibold text-[#f1f5f9] mb-4">Top Events</p>
          {counts.length === 0 && !loading ? (
            <div className="h-[220px] flex items-center justify-center">
              <p className="text-sm text-[#475569]">No events tracked yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={counts} layout="vertical" barSize={10} margin={{ left: 0, right: 8 }}>
                <XAxis type="number" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category" dataKey="event_name" width={140}
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  tickLine={false} axisLine={false}
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
                  {counts.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="rounded-[16px] p-5 border border-[#1e1e3a]" style={{ background: '#0f0f1a' }}>
          <p className="text-sm font-semibold text-[#f1f5f9] mb-4">Daily Active Users — 14 Days</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dau} barSize={12}>
              <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1e1e3a', border: 'none', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#94a3b8' }}
                itemStyle={{ color: '#f1f5f9' }}
                formatter={(v: number) => [v, 'Users']}
              />
              <Bar dataKey="users" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent event stream */}
      <div className="rounded-[16px] border border-[#1e1e3a] overflow-hidden" style={{ background: '#0f0f1a' }}>
        <div className="px-5 py-4 border-b border-[#1e1e3a]">
          <p className="text-sm font-semibold text-[#f1f5f9]">Recent Events</p>
        </div>
        <div className="divide-y divide-[#1e1e3a] max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="px-5 py-6 text-center text-[#475569] text-sm">Loading...</div>
          )}
          {!loading && recent.length === 0 && (
            <div className="px-5 py-6 text-center text-[#475569] text-sm">No events yet</div>
          )}
          {recent.map(e => (
            <div key={e.id} className="px-5 py-3 flex items-start justify-between gap-4 hover:bg-[#0a0a14] transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#f1f5f9] font-medium">{formatLabel(e.event_name)}</p>
                {Object.keys(e.properties ?? {}).length > 0 && (
                  <p className="text-[11px] text-[#475569] mt-0.5 truncate">
                    {Object.entries(e.properties).map(([k, v]) => `${k}: ${v}`).join(' · ')}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[11px] text-[#475569]">{e.user_id?.slice(0, 8) ?? 'anon'}</p>
                <p className="text-[10px] text-[#334155]">
                  {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
