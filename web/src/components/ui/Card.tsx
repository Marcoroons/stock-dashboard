import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, onClick, hover = false, glow = false, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'glass-card',
        padding === 'none' && 'p-0',
        padding === 'sm' && 'p-3',
        padding === 'md' && 'p-5',
        padding === 'lg' && 'p-7',
        hover && 'cursor-pointer transition-all duration-200 hover:border-[#3b82f6]/40 hover:translate-y-[-2px]',
        glow && 'hover:shadow-[0_0_30px_rgba(59,130,246,0.12)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface MetricCardProps {
  label: string
  value: string | React.ReactNode
  subvalue?: string
  trend?: 'up' | 'down' | 'neutral'
  delta?: string
  info?: string
  className?: string
}

export function MetricCard({ label, value, subvalue, delta, className }: MetricCardProps) {
  const trendColor = delta
    ? delta.startsWith('+') ? '#10b981' : delta.startsWith('-') ? '#ef4444' : '#94a3b8'
    : '#94a3b8'

  return (
    <div className={cn('glass-card p-4', className)}>
      <p className="text-xs text-[#64748b] font-medium uppercase tracking-wider mb-1.5">{label}</p>
      <p className="text-xl font-semibold text-[#f1f5f9]">{value}</p>
      {(delta || subvalue) && (
        <p className="text-xs mt-1" style={{ color: trendColor }}>
          {delta || subvalue}
        </p>
      )}
    </div>
  )
}
