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
    primary: 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 text-white font-bold hover:shadow-2xl hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 rounded-xl',
    secondary: 'bg-gradient-to-r from-pink-500 via-pink-600 to-rose-600 text-white font-bold hover:shadow-2xl hover:shadow-pink-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 rounded-xl',
    accent: 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white font-bold hover:shadow-2xl hover:shadow-orange-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 rounded-xl',
    outline: 'border-3 border-emerald-500 text-emerald-400 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-emerald-600 hover:text-white hover:shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.03] active:scale-[0.97] bg-gray-800 font-bold transition-all duration-300 rounded-xl',
    ghost: 'text-purple-400 hover:bg-gradient-to-r hover:from-purple-900/30 hover:to-pink-900/30 hover:shadow-lg hover:scale-[1.03] active:scale-[0.97] font-semibold transition-all duration-300 rounded-xl',
    danger: 'bg-gradient-to-r from-red-500 via-red-600 to-rose-600 text-white font-bold hover:shadow-2xl hover:shadow-red-500/50 hover:scale-[1.03] active:scale-[0.97] transition-all duration-300 rounded-xl',
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
