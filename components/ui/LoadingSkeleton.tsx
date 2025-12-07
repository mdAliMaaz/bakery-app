'use client';

interface LoadingSkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular';
    width?: string | number;
    height?: string | number;
    lines?: number;
}

export default function LoadingSkeleton({
    className = '',
    variant = 'rectangular',
    width,
    height,
    lines = 1,
}: LoadingSkeletonProps) {
    const baseClasses = 'animate-pulse bg-muted rounded';

    if (variant === 'text' && lines > 1) {
        return (
            <div className={className}>
                {Array.from({ length: lines }).map((_, index) => (
                    <div
                        key={index}
                        className={`${baseClasses} mb-2`}
                        style={{
                            width: index === lines - 1 ? '60%' : '100%',
                            height: height || '1rem',
                        }}
                    />
                ))}
            </div>
        );
    }

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === 'number' ? `${width}px` : width;
    if (height) style.height = typeof height === 'number' ? `${height}px` : height;

    const variantClasses = {
        text: 'h-4',
        circular: 'rounded-full',
        rectangular: 'rounded-lg',
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            style={style}
        />
    );
}

export function CardSkeleton() {
    return (
        <div className="bg-card border border-border p-6 shadow-md">
            <LoadingSkeleton variant="text" height="1.5rem" width="60%" className="mb-4" />
            <LoadingSkeleton variant="text" lines={3} className="mb-4" />
            <LoadingSkeleton variant="rectangular" height="2rem" width="40%" />
        </div>
    );
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="w-full">
            <div className="flex gap-4 mb-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <LoadingSkeleton key={i} variant="rectangular" height="2rem" className="flex-1" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex gap-4 mb-2">
                    {Array.from({ length: columns }).map((_, j) => (
                        <LoadingSkeleton key={j} variant="rectangular" height="3rem" className="flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}
