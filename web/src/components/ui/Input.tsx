import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, rightIcon, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-[#94a3b8] mb-1.5">{label}</label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-[#0f0f1a] border border-[#1e1e3a] text-[#f1f5f9] rounded-[10px]',
            'px-4 py-2.5 text-sm placeholder-[#334155]',
            'focus:outline-none focus:border-[#3b82f6] focus:ring-1 focus:ring-[rgba(59,130,246,0.3)]',
            'transition-colors duration-200',
            icon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
            error ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-[rgba(239,68,68,0.3)]' : '',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748b]">
            {rightIcon}
          </span>
        )}
      </div>
      {error && <p className="text-xs text-[#ef4444] mt-1">{error}</p>}
    </div>
  )
})
