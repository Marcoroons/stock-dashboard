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
        <label className="block text-sm font-medium mb-1.5 text-stone-700 dark:text-stone-300">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-[10px] border px-4 py-2.5 text-sm transition-all duration-200',
            'bg-white border-stone-200 text-stone-900 placeholder-stone-400',
            'focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20',
            'dark:bg-stone-800 dark:border-stone-700 dark:text-stone-100 dark:placeholder-stone-500 dark:focus:border-sky-400 dark:focus:ring-sky-400/20',
            icon ? 'pl-10' : '',
            rightIcon ? 'pr-10' : '',
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
