import { ButtonHTMLAttributes, forwardRef } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', fullWidth = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 touch-target no-select'

    const variants = {
      primary:
        'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-primary-500/50 disabled:cursor-not-allowed',
      secondary:
        'bg-slate-700 text-white hover:bg-slate-600 active:bg-slate-800 disabled:bg-slate-700/50 disabled:cursor-not-allowed',
      ghost:
        'bg-transparent text-slate-300 hover:bg-slate-800 active:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed',
      danger:
        'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-500/50 disabled:cursor-not-allowed',
    }

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-base',
      lg: 'px-6 py-3.5 text-lg',
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
