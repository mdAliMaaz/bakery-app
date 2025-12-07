'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PremiumButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    children: ReactNode;
}

const variantClasses = {
    primary: 'bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:shadow-xl hover:shadow-sky-500/40 hover:scale-[1.02] active:scale-[0.98] border border-sky-400/30 transition-all duration-200',
    secondary: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] border border-orange-400/30 transition-all duration-200',
    accent: 'bg-gradient-to-r from-violet-500 to-violet-600 text-white hover:shadow-xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] border border-violet-400/30 transition-all duration-200',
    outline: 'border-2 border-green-500 text-green-600 dark:text-green-400 hover:bg-green-500 hover:text-white hover:shadow-xl hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98] bg-card transition-all duration-200',
    ghost: 'text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-card/50 transition-all duration-200',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-xl hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] border border-red-400/30 transition-all duration-200',
};

const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
};

export default function PremiumButton({
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    className = '',
    disabled,
    ...props
}: PremiumButtonProps) {
    return (
        <button
            className={`
        relative overflow-hidden
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        font-semibold
        transition-all
        duration-300
        focus:outline-none
        focus:ring-2
        focus:ring-primary/50
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        disabled:hover:shadow-none
        before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
        ${className}
      `}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <span className="flex items-center justify-center">
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                    </svg>
                    Loading...
                </span>
            ) : (
                <span className="flex items-center justify-center gap-2">
                    {leftIcon && <span>{leftIcon}</span>}
                    {children}
                    {rightIcon && <span>{rightIcon}</span>}
                </span>
            )}
        </button>
    );
}
