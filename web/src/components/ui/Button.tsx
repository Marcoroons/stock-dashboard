import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, variant = 'primary', size = 'md', loading = false, fullWidth = false, className, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-[10px] transition-all duration-200 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-3 py-1.5 text-sm min-h-[36px]',
        size === 'md' && 'px-4 py-2.5 text-sm min-h-[40px]',
        size === 'lg' && 'px-6 py-3.5 text-base min-h-[48px]',
        variant === 'primary' && 'bg-sky-600 text-white shadow-sm hover:bg-sky-700 active:scale-[0.98] dark:bg-sky-500 dark:hover:bg-sky-400 focus-visible:ring-sky-500',
        variant === 'secondary' && 'bg-white text-stone-700 border border-stone-200 shadow-sm hover:bg-stone-50 hover:border-stone-300 dark:bg-stone-800 dark:text-stone-200 dark:border-stone-700 dark:hover:bg-stone-700 dark:hover:border-stone-600 focus-visible:ring-stone-400',
        variant === 'ghost' && 'bg-transparent text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-stone-200 focus-visible:ring-stone-400',
        variant === 'outline' && 'bg-transparent text-sky-600 border border-sky-600 hover:bg-sky-50 dark:text-sky-400 dark:border-sky-400 dark:hover:bg-sky-900/30 focus-visible:ring-sky-500',
        variant === 'danger' && 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 hover:border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/40 focus-visible:ring-red-500',
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
})
