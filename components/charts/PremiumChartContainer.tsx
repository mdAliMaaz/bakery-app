'use client';

import { ReactNode } from 'react';

interface PremiumChartContainerProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
    action?: ReactNode;
}

export default function PremiumChartContainer({
    title,
    description,
    children,
    className = '',
    action,
}: PremiumChartContainerProps) {
    return (
        <div
            className={`
        bg-card
        border
        border-border
        p-6
        shadow-md
        hover:shadow-lg
        transition-all
        duration-300
        ${className}
      `}
        >
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {action && <div>{action}</div>}
            </div>
            <div className="relative">
                {children}
            </div>
        </div>
    );
}
