import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Badge, Button } from '@/components/ui'
import { FileText, ChevronRight, Shield, ShieldCheck, Lock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'

const ADMIN_KEY = 'Admin123'

export function AcademyPage() {
  const MODULES = [
    { id: 'stocks-101', title: 'What Is a Stock?', category: 'Beginner', duration: '5 min', completed: true },
    { id: 'etf-101', title: 'What Is an ETF?', category: 'Beginner', duration: '5 min', completed: true },
    { id: 'risk-basics', title: 'Understanding Risk', category: 'Beginner', duration: '8 min', completed: false },
    { id: 'pe-ratio', title: 'P/E Ratio Explained', category: 'Valuation', duration: '7 min', completed: false },
    { id: 'dcf', title: 'Discounted Cash Flow', category: 'Valuation', duration: '12 min', completed: false },
    { id: 'sharpe', title: 'Sharpe & Sortino Ratios', category: 'Risk Management', duration: '8 min', completed: false },
    { id: 'fomo', title: 'Avoiding FOMO', category: 'Behavioral Finance', duration: '6 min', completed: false },
    { id: 'loss-aversion', title: 'Loss Aversion Bias', category: 'Behavioral Finance', duration: '7 min', completed: false },
  ]

  const completed = MODULES.filter(m => m.completed).length

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9]">Investing Academy</h1>
          <p className="text-[#64748b] text-sm mt-0.5">Build your financial knowledge, one module at a time</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#3b82f6]">{completed}/{MODULES.length}</p>
          <p className="text-xs text-[#64748b]">modules complete</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map(mod => (
          <Card key={mod.id} hover>
            <div className="flex items-start justify-between mb-2">
              <Badge variant={mod.completed ? 'success' : 'default'} size="sm">
                {mod.category}
              </Badge>
              {mod.completed && <span className="text-[#10b981] text-xs">Done</span>}
            </div>
            <h3 className="font-medium text-[#f1f5f9] text-sm mb-1">{mod.title}</h3>
            <p className="text-xs text-[#64748b]">{mod.duration} read</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

const TIERS = [
  {
    name: 'Free',
    price: '$0/mo',
    features: ['Investor DNA', 'Basic Portfolio', 'Academy'],
    color: '#64748b',
    current: true,
  },
  {
    name: 'Plus',
    price: '$19/mo',
    features: ['Portfolio Doctor', 'Opportunity Scanner', 'News Intelligence', '+ all Free features'],
    color: '#06b6d4',
    current: false,
  },
  {
    name: 'Pro',
    price: '$49/mo',
    features: ['Stress Testing', 'Insider Activity', 'Advanced Analytics', 'AI Coach', '+ all Plus features'],
    color: '#f59e0b',
    current: false,
  },
]

function AdminUnlock() {
  const navigate = useNavigate()
  const { user, profile, refreshProfile } = useAuth()
  const [key, setKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already an admin — show entry point to the panel
  if (profile?.is_admin) {
    return (
      <button
        onClick={() => navigate('/admin')}
        className="w-full flex items-center gap-4 p-4 rounded-[12px] border border-[rgba(239,68,68,0.3)] bg-[rgba(239,68,68,0.06)] hover:bg-[rgba(239,68,68,0.1)] transition-colors duration-150 cursor-pointer group"
      >
        <div className="w-9 h-9 rounded-lg bg-[rgba(239,68,68,0.15)] flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#ef4444]" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-medium text-[#f1f5f9]">Admin access enabled</p>
          <p className="text-xs text-[#64748b] mt-0.5">Open the Admin Panel to manage users, subscriptions, and access codes</p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-[#94a3b8] transition-colors duration-150 flex-shrink-0" />
      </button>
    )
  }

  async function handleUnlock() {
    if (!user) return
    setError(null)

    if (key.trim() !== ADMIN_KEY) {
      setError('Incorrect admin key.')
      return
    }

    setLoading(true)
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id)
      if (updateError) throw updateError
      await refreshProfile()
      navigate('/admin')
    } catch {
      setError('Could not enable admin access. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 rounded-[12px] border border-[#1e293b] bg-[#0f172a]">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-[#94a3b8]" />
        </div>
        <div>
          <p className="text-sm font-medium text-[#f1f5f9]">Admin access</p>
          <p className="text-xs text-[#64748b] mt-0.5">Enter your admin key to unlock the Admin Panel.</p>
        </div>
      </div>

      {error && (
        <div className="bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] rounded-[8px] p-2.5 mb-3">
          <p className="text-xs text-[#ef4444]">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#475569]" />
          <input
            type="password"
            placeholder="Admin key"
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleUnlock()}
            disabled={loading}
            className="w-full bg-[#0f0f1a] border border-[#1e1e3a] text-[#f1f5f9] rounded-[8px] pl-9 pr-3 py-2 text-sm placeholder-[#334155] focus:outline-none focus:border-[#3b82f6] transition-colors disabled:opacity-50"
          />
        </div>
        <Button onClick={handleUnlock} loading={loading} disabled={!key.trim()} size="sm">
          Unlock
        </Button>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const navigate = useNavigate()

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-[#f1f5f9]">Settings & Subscription</h1>

      <div>
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map(tier => (
            <Card key={tier.name} className={tier.current ? 'border-[rgba(59,130,246,0.4)]' : ''}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#f1f5f9]">{tier.name}</h3>
                {tier.current && <Badge variant="info" size="sm">Current</Badge>}
              </div>
              <p className="text-2xl font-bold mb-4" style={{ color: tier.color }}>
                {tier.price}
              </p>
              <ul className="space-y-1.5 mb-5">
                {tier.features.map(f => (
                  <li key={f} className="text-sm text-[#94a3b8] flex items-start gap-2">
                    <span style={{ color: tier.color }}>+</span>
                    {f}
                  </li>
                ))}
              </ul>
              {!tier.current && (
                <Button variant={tier.name === 'Pro' ? 'primary' : 'secondary'} fullWidth size="sm">
                  Upgrade to {tier.name}
                </Button>
              )}
              {tier.current && (
                <p className="text-xs text-center text-[#64748b]">Your current plan</p>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-4 p-4 rounded-[12px] border border-[#1e1e3a] bg-[#0f0f1a]">
          <p className="text-sm text-[#64748b]">
            Have an access code?{' '}
            <button className="text-[#3b82f6] hover:text-[#60a5fa] underline cursor-pointer">
              Enter it here
            </button>{' '}
            to unlock premium features instantly.
          </p>
        </div>
      </div>

      {/* Legal & Compliance */}
      <div>
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Legal &amp; Compliance</h2>
        <button
          onClick={() => navigate('/legal')}
          className="w-full flex items-center gap-4 p-4 rounded-[12px] border border-[#1e293b] bg-[#0f172a] hover:bg-[#1e293b] transition-colors duration-150 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-[#94a3b8]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-[#f1f5f9]">Privacy Policy &amp; Terms of Service</p>
            <p className="text-xs text-[#64748b] mt-0.5">GDPR · CCPA · Singapore PDPA · Malaysia PDPA · Indonesia UU PDP</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#475569] group-hover:text-[#94a3b8] transition-colors duration-150 flex-shrink-0" />
        </button>
      </div>

      {/* Admin */}
      <div>
        <h2 className="text-lg font-semibold text-[#f1f5f9] mb-4">Administration</h2>
        <AdminUnlock />
      </div>
    </div>
  )
}
