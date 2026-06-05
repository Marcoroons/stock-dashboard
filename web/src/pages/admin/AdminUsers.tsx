import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Search } from 'lucide-react'

interface UserRow {
  id: string
  email: string | null
  full_name: string | null
  subscription_tier: string
  is_admin: boolean
  created_at: string
  updated_at: string | null
}

const TIER_COLORS: Record<string, string> = {
  free: '#64748b',
  plus: '#06b6d4',
  pro:  '#f59e0b',
}

export function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id, email, full_name, subscription_tier, is_admin, created_at, updated_at')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setUsers((data as UserRow[]) ?? [])
        setLoading(false)
      })
  }, [])

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    return !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b]" />
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#0f0f1a] border border-[#1e1e3a] text-[#f1f5f9] rounded-[10px] pl-10 pr-4 py-2 text-sm placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] transition-colors"
        />
      </div>

      <div className="rounded-[16px] border border-[#1e1e3a] overflow-hidden" style={{ background: '#0f0f1a' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e3a]">
              {['Name / Email', 'Plan', 'Admin', 'Joined'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-[#475569] text-sm">Loading...</td></tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-8 text-center text-[#475569] text-sm">No users found</td></tr>
            )}
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-[#1e1e3a] last:border-0 hover:bg-[#0a0a14] transition-colors">
                <td className="px-5 py-3">
                  <p className="text-[#f1f5f9] font-medium">{u.full_name || '—'}</p>
                  <p className="text-xs text-[#475569]">{u.email || u.id.slice(0, 8)}</p>
                </td>
                <td className="px-5 py-3">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{ background: `${TIER_COLORS[u.subscription_tier] ?? '#64748b'}15`, color: TIER_COLORS[u.subscription_tier] ?? '#64748b' }}
                  >
                    {u.subscription_tier}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.is_admin
                    ? <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.12)] text-[#ef4444]">Admin</span>
                    : <span className="text-[#475569] text-xs">—</span>
                  }
                </td>
                <td className="px-5 py-3 text-xs text-[#64748b]">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && (
          <div className="px-5 py-2 border-t border-[#1e1e3a]">
            <p className="text-[11px] text-[#475569]">{filtered.length} of {users.length} users</p>
          </div>
        )}
      </div>
    </div>
  )
}
