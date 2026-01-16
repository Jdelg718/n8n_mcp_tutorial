import * as React from 'react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'outline' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'default', size = 'default', ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'

        const variants = {
            default: 'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600',
            outline: 'border-2 border-gray-300 bg-white hover:bg-gray-50 focus-visible:ring-gray-400',
            ghost: 'hover:bg-gray-100 focus-visible:ring-gray-400',
        }

        const sizes = {
            default: 'h-10 px-4 py-2',
            sm: 'h-8 px-3 text-sm',
            lg: 'h-12 px-8 text-lg',
        }

        return (
            <button
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)

Button.displayName = 'Button'

export { Button }
