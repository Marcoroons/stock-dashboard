import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

// Inset icons sit at left/right: 12px and are 16px wide (end at ~28px).
// We reserve 44px on the iconned side as an inline style so the buffer is
// guaranteed — inline styles beat any utility class, stale cached CSS, or a
// caller-supplied padding class. See input-icon-padding-standard memory.
const ICON_INSET_PADDING = '2.75rem' // 44px

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, icon, rightIcon, className, style, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 pointer-events-none">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          style={{
            ...style,
            ...(icon ? { paddingLeft: ICON_INSET_PADDING } : null),
            ...(rightIcon ? { paddingRight: ICON_INSET_PADDING } : null),
          }}
          className={cn(
            'w-full rounded-[10px] border px-4 py-2.5 text-sm transition-all duration-200',
            'bg-white border-stone-200 text-stone-900 placeholder-stone-400',
            'focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
            'dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/20',
            error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-600 dark:focus:border-red-500' : '',
            className,
          )}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs mt-1 text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  )
})
