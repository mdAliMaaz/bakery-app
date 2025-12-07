"use client";

import { SelectHTMLAttributes, forwardRef } from "react";

interface PremiumSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  leftIcon?: React.ReactNode;
  placeholder?: string;
}

const PremiumSelect = forwardRef<HTMLSelectElement, PremiumSelectProps>(
  (
    { label, error, helperText, options, leftIcon, className = "", ...props },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
              {leftIcon}
            </div>
          )}

          <select
            ref={ref}
            className={`
              w-full
              px-4
              ${leftIcon ? "pl-10" : ""}
              py-3
              bg-gray-800
              border-2
              ${error ? "border-red-500" : "border-gray-600"}
              rounded-xl
              text-gray-100
              font-medium
              appearance-none
              cursor-pointer
              transition-all
              duration-300
              focus:outline-none
              focus:ring-4
              ${error ? "focus:ring-red-500/20 focus:border-red-500" : "focus:ring-indigo-500/20 focus:border-indigo-500"}
              hover:border-indigo-400
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500 animate-fade-in">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  },
);

PremiumSelect.displayName = "PremiumSelect";

export default PremiumSelect;
