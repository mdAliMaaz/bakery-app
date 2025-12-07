'use client';

import { InputHTMLAttributes, forwardRef, useState } from 'react';

interface PremiumInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const PremiumInput = forwardRef<HTMLInputElement, PremiumInputProps>(
    ({ label, error, helperText, leftIcon, rightIcon, className = '', placeholder, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        // Properly check for value including number 0
        const hasValue = props.value !== undefined &&
            props.value !== null &&
            String(props.value).trim() !== '';
        const showLabelUp = label ? (isFocused || hasValue) : false;

        return (
            <div className="w-full">
                <div className="relative">
                    {leftIcon && (
                        <div className={`absolute left-3 text-muted-foreground transition-all duration-200 ${showLabelUp ? 'top-3' : 'top-1/2 -translate-y-1/2'}`}>
                            {leftIcon}
                        </div>
                    )}

                    {label && (
                        <label
                            className={`
                absolute
                left-4
                ${leftIcon ? 'left-10' : ''}
                transition-all
                duration-200
                pointer-events-none
                z-10
                ${showLabelUp
                                    ? 'top-2 text-xs font-medium text-primary'
                                    : 'top-1/2 -translate-y-1/2 text-sm text-muted-foreground'
                                }
              `}
                        >
                            {label}
                        </label>
                    )}

                    <input
                        ref={ref}
                        className={`
              w-full
              px-4
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${label && showLabelUp ? 'pt-6 pb-2' : 'py-3'}
              bg-input
              border
              ${error ? 'border-red-500' : isFocused ? 'border-primary' : 'border-border'}
              rounded-xl
              text-foreground
              ${label ? 'placeholder:text-transparent' : 'placeholder:text-muted-foreground'}
              transition-all
              duration-200
              focus:outline-none
              focus:ring-2
              ${error ? 'focus:ring-red-500' : 'focus:ring-primary'}
              focus:ring-offset-2
              ${className}
            `}
                        placeholder={label ? (showLabelUp ? '' : placeholder) : placeholder}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            props.onBlur?.(e);
                        }}
                        {...props}
                    />

                    {rightIcon && (
                        <div className={`absolute right-3 text-muted-foreground transition-all duration-200 ${showLabelUp ? 'top-3' : 'top-1/2 -translate-y-1/2'}`}>
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
                )}

                {helperText && !error && (
                    <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
                )}
            </div>
        );
    }
);

PremiumInput.displayName = 'PremiumInput';

export default PremiumInput;
