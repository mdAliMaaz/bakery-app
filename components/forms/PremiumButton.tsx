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
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transform hover:scale-[1.02] active:scale-[0.98]',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/25 transform hover:scale-[1.02] active:scale-[0.98]',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 hover:shadow-lg hover:shadow-accent/25 transform hover:scale-[1.02] active:scale-[0.98]',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]',
    ghost: 'hover:bg-muted text-foreground hover:shadow-sm transform hover:scale-[1.01] active:scale-[0.99]',
    danger: 'bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25 transform hover:scale-[1.02] active:scale-[0.98]',
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
        relative
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        font-semibold
        rounded-xl
        transition-all
        duration-300
        ease-out
        focus:outline-none
        focus:ring-2
        focus:ring-primary/50
        focus:ring-offset-2
        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:transform-none
        disabled:cursor-not-allowed
        disabled:hover:scale-100
        disabled:hover:shadow-none
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
