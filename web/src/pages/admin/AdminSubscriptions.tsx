import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

interface SubRow {
  id: string
  user_id: string
  tier: string
  status: string
  stripe_subscription_id: string | null
  current_period_end: string | null
  created_at: string
  profiles?: { email: string | null; full_name: string | null } | null
}

const STATUS_COLORS: Record<string, string> = {
  active:    '#10b981',
  canceled:  '#ef4444',
  past_due:  '#f59e0b',
  trialing:  '#06b6d4',
}

const TIER_COLORS: Record<string, string> = {
  plus: '#06b6d4',
  pro:  '#f59e0b',
}

export function AdminSubscriptions() {
  const [subs, setSubs] = useState<SubRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('subscriptions')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setSubs((data as SubRow[]) ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="rounded-[16px] border border-[#1e1e3a] overflow-hidden" style={{ background: '#0f0f1a' }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#1e1e3a]">
            {['User', 'Plan', 'Status', 'Renews', 'Started'].map(h => (
              <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={5} className="px-5 py-8 text-center text-[#475569] text-sm">Loading...</td></tr>
          )}
          {!loading && subs.length === 0 && (
            <tr><td colSpan={5} className="px-5 py-8 text-center text-[#475569] text-sm">No subscriptions yet</td></tr>
          )}
          {subs.map(s => (
            <tr key={s.id} className="border-b border-[#1e1e3a] last:border-0 hover:bg-[#0a0a14] transition-colors">
              <td className="px-5 py-3">
                <p className="text-[#f1f5f9] font-medium">{s.profiles?.full_name || '—'}</p>
                <p className="text-xs text-[#475569]">{s.profiles?.email || s.user_id.slice(0, 8)}</p>
              </td>
              <td className="px-5 py-3">
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{ background: `${TIER_COLORS[s.tier] ?? '#64748b'}15`, color: TIER_COLORS[s.tier] ?? '#64748b' }}
                >
                  {s.tier}
                </span>
              </td>
              <td className="px-5 py-3">
                <span
                  className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                  style={{ background: `${STATUS_COLORS[s.status] ?? '#64748b'}15`, color: STATUS_COLORS[s.status] ?? '#64748b' }}
                >
                  {s.status}
                </span>
              </td>
              <td className="px-5 py-3 text-xs text-[#64748b]">
                {s.current_period_end ? new Date(s.current_period_end).toLocaleDateString() : '—'}
              </td>
              <td className="px-5 py-3 text-xs text-[#64748b]">
                {new Date(s.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && (
        <div className="px-5 py-2 border-t border-[#1e1e3a]">
          <p className="text-[11px] text-[#475569]">{subs.filter(s => s.status === 'active').length} active of {subs.length} total</p>
        </div>
      )}
    </div>
  )
}
