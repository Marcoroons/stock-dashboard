import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
  hover?: boolean
  glow?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export function Card({ children, className, style, onClick, hover = false, glow = false, padding = 'md' }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        'glass-card',
        padding === 'none' && 'p-0',
        padding === 'sm'  && 'p-3',
        padding === 'md'  && 'p-5',
        padding === 'lg'  && 'p-7',
        hover && 'cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
        hover && 'hover:border-sky-200 dark:hover:border-sky-800',
        glow && 'hover:shadow-[0_0_24px_rgba(2,132,199,0.1)] dark:hover:shadow-[0_0_24px_rgba(56,189,248,0.12)]',
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
  const isPositive = delta?.startsWith('+')
  const isNegative = delta?.startsWith('-')

  return (
    <div className={cn(
      'glass-card p-5',
      className,
    )}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-2 text-stone-500 dark:text-stone-400">
        {label}
      </p>
      <p className="text-2xl font-bold text-stone-900 dark:text-stone-50">
        {value}
      </p>
      {(delta || subvalue) && (
        <p className={cn(
          'text-sm mt-1 font-medium',
          isPositive && 'text-green-600 dark:text-green-400',
          isNegative && 'text-red-600 dark:text-red-400',
          !isPositive && !isNegative && 'text-stone-500 dark:text-stone-400',
        )}>
          {delta || subvalue}
        </p>
      )}
    </div>
  )
}
