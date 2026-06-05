import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeRow {
  id: string
  code: string
  tier: string
  max_uses: number | null
  times_used: number
  expires_at: string | null
  is_active: boolean
  created_at: string
}

const TIER_COLORS: Record<string, string> = {
  plus: '#06b6d4',
  pro:  '#f59e0b',
}

export function AdminCodes() {
  const [codes, setCodes] = useState<CodeRow[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ code: '', tier: 'plus', max_uses: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { loadCodes() }, [])

  async function loadCodes() {
    const { data } = await supabase
      .from('access_codes')
      .select('*')
      .order('created_at', { ascending: false })
    setCodes((data as CodeRow[]) ?? [])
    setLoading(false)
  }

  async function handleCreate() {
    if (!form.code.trim()) return
    setSaving(true)
    setError(null)
    const payload = {
      code: form.code.trim().toUpperCase(),
      tier: form.tier,
      max_uses: form.max_uses ? parseInt(form.max_uses) : null,
      is_active: true,
    }
    const { error: err } = await supabase.from('access_codes').insert(payload)
    if (err) {
      setError(err.message)
    } else {
      setForm({ code: '', tier: 'plus', max_uses: '' })
      setCreating(false)
      await loadCodes()
    }
    setSaving(false)
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('access_codes').update({ is_active: !current }).eq('id', id)
    setCodes(c => c.map(code => code.id === id ? { ...code, is_active: !current } : code))
  }

  return (
    <div className="space-y-4">
      {/* Create form */}
      {creating ? (
        <div className="rounded-[16px] p-5 border border-[#1e1e3a]" style={{ background: '#0f0f1a' }}>
          <p className="text-sm font-semibold text-[#f1f5f9] mb-4">New Access Code</p>
          {error && <p className="text-xs text-[#ef4444] mb-3">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              placeholder="Code (e.g. FRIEND50)"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="bg-[#0a0a14] border border-[#1e1e3a] text-[#f1f5f9] rounded-[9px] px-3 py-2 text-sm placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] font-mono tracking-wider"
            />
            <select
              value={form.tier}
              onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}
              className="bg-[#0a0a14] border border-[#1e1e3a] text-[#f1f5f9] rounded-[9px] px-3 py-2 text-sm focus:outline-none focus:border-[#3b82f6]"
            >
              <option value="plus">Plus</option>
              <option value="pro">Pro</option>
            </select>
            <input
              type="number"
              placeholder="Max uses (blank = unlimited)"
              value={form.max_uses}
              onChange={e => setForm(f => ({ ...f, max_uses: e.target.value }))}
              className="bg-[#0a0a14] border border-[#1e1e3a] text-[#f1f5f9] rounded-[9px] px-3 py-2 text-sm placeholder-[#334155] focus:outline-none focus:border-[#3b82f6]"
            />
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreate}
              disabled={saving || !form.code.trim()}
              className={cn(
                'px-4 py-2 rounded-[9px] text-sm font-semibold transition-all cursor-pointer',
                saving || !form.code.trim() ? 'opacity-40 cursor-not-allowed bg-[#1e1e3a] text-[#64748b]' : 'bg-[#3b82f6] text-white hover:bg-[#2563eb]',
              )}
            >
              {saving ? 'Creating...' : 'Create'}
            </button>
            <button onClick={() => { setCreating(false); setError(null) }} className="px-4 py-2 rounded-[9px] text-sm text-[#64748b] hover:text-[#f1f5f9] transition-colors cursor-pointer">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-[10px] text-sm font-semibold bg-[#3b82f6] text-white hover:bg-[#2563eb] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Code
        </button>
      )}

      {/* Table */}
      <div className="rounded-[16px] border border-[#1e1e3a] overflow-hidden" style={{ background: '#0f0f1a' }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1e1e3a]">
              {['Code', 'Tier', 'Usage', 'Expires', 'Active'].map(h => (
                <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#475569]">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-[#475569] text-sm">Loading...</td></tr>
            )}
            {codes.map(c => (
              <tr key={c.id} className="border-b border-[#1e1e3a] last:border-0 hover:bg-[#0a0a14] transition-colors">
                <td className="px-5 py-3">
                  <span className="font-mono text-[#f1f5f9] tracking-wider text-sm">{c.code}</span>
                </td>
                <td className="px-5 py-3">
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                    style={{ background: `${TIER_COLORS[c.tier] ?? '#64748b'}15`, color: TIER_COLORS[c.tier] ?? '#64748b' }}
                  >
                    {c.tier}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-[#94a3b8]">
                  {c.times_used}{c.max_uses != null ? ` / ${c.max_uses}` : ''} uses
                </td>
                <td className="px-5 py-3 text-xs text-[#64748b]">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString() : 'Never'}
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => toggleActive(c.id, c.is_active)}
                    className="cursor-pointer transition-colors"
                  >
                    {c.is_active
                      ? <Check className="w-4 h-4 text-[#10b981]" />
                      : <X className="w-4 h-4 text-[#ef4444]" />
                    }
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
