'use client';

interface PremiumLoaderProps {
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    text?: string;
}

const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
};

const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
};

const getSizeValue = (size: 'sm' | 'md' | 'lg') => {
    return size === 'sm' ? 32 : size === 'md' ? 64 : 96;
};

export default function PremiumLoader({
    size = 'md',
    className = '',
    text
}: PremiumLoaderProps) {
    const sizeValue = getSizeValue(size);
    const halfSize = sizeValue / 2;

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <div
                className={`${sizeClasses[size]} relative`}
                style={{
                    perspective: '1000px',
                    transformStyle: 'preserve-3d',
                }}
            >
                {/* 3D Rotating Cube */}
                <div
                    className="absolute inset-0"
                    style={{
                        transformStyle: 'preserve-3d',
                        animation: 'rotate3d 2s infinite linear',
                    }}
                >
                    {/* Front Face */}
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: 'var(--gradient-primary)',
                            transform: `translateZ(${halfSize}px)`,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        }}
                    />
                    {/* Back Face */}
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: 'var(--gradient-secondary)',
                            transform: `translateZ(-${halfSize}px) rotateY(180deg)`,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        }}
                    />
                    {/* Right Face */}
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
                            transform: `rotateY(90deg) translateZ(${halfSize}px)`,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        }}
                    />
                    {/* Left Face */}
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: 'linear-gradient(135deg, var(--accent) 0%, var(--primary) 100%)',
                            transform: `rotateY(-90deg) translateZ(${halfSize}px)`,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        }}
                    />
                    {/* Top Face */}
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: 'var(--gradient-accent)',
                            transform: `rotateX(90deg) translateZ(${halfSize}px)`,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        }}
                    />
                    {/* Bottom Face */}
                    <div
                        className="absolute inset-0 rounded-lg"
                        style={{
                            background: 'var(--gradient-gold)',
                            transform: `rotateX(-90deg) translateZ(${halfSize}px)`,
                            boxShadow: '0 0 20px rgba(99, 102, 241, 0.5)',
                        }}
                    />
                </div>
            </div>

            {text && (
                <p className={`mt-4 text-muted-foreground font-medium ${textSizeClasses[size]} animate-pulse`}>
                    {text}
                </p>
            )}
        </div>
    );
}

