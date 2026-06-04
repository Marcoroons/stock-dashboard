import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'ghost'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
      variant === 'default' && 'bg-[#1e1e3a] text-[#94a3b8] border border-[#252545]',
      variant === 'success' && 'bg-[rgba(16,185,129,0.12)] text-[#10b981] border border-[rgba(16,185,129,0.25)]',
      variant === 'warning' && 'bg-[rgba(245,158,11,0.12)] text-[#f59e0b] border border-[rgba(245,158,11,0.25)]',
      variant === 'error'   && 'bg-[rgba(239,68,68,0.12)] text-[#ef4444] border border-[rgba(239,68,68,0.25)]',
      variant === 'info'    && 'bg-[rgba(59,130,246,0.12)] text-[#60a5fa] border border-[rgba(59,130,246,0.25)]',
      variant === 'ghost'   && 'bg-transparent text-[#64748b]',
      className,
    )}>
      {children}
    </span>
  )
}
