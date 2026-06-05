import { Card, Badge, Button } from '@/components/ui'

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

export function SettingsPage() {
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
    </div>
  )
}
