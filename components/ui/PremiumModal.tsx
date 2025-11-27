'use client';

import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    showCloseButton?: boolean;
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4',
};

export default function PremiumModal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true,
}: PremiumModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Focus trap
            const handleEscape = (e: KeyboardEvent) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleEscape);
            return () => {
                document.removeEventListener('keydown', handleEscape);
                document.body.style.overflow = '';
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === backdropRef.current) {
            onClose();
        }
    };

    return (
        <div
            ref={backdropRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
            style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
            }}
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full ${sizeClasses[size]} rounded-2xl shadow-2xl animate-scale-in border border-border overflow-hidden`}
                style={{
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--card)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05)',
                }}
            >
                {/* Subtle glass overlay for depth */}
                <div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
                    }}
                />
                <div
                    className="dark:block hidden absolute inset-0 rounded-2xl pointer-events-none"
                    style={{
                        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.03) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    }}
                />

                <div className="relative z-10 flex flex-col h-full">
                    {title && (
                        <div className="px-6 py-4 border-b border-border" style={{ backgroundColor: 'var(--muted)' }}>
                            <h2 className="text-xl font-semibold" style={{ color: 'var(--card-foreground)' }}>{title}</h2>
                        </div>
                    )}

                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div
                        className="overflow-y-auto flex-1 p-6"
                        style={{
                            maxHeight: 'calc(90vh - 80px)',
                            color: 'var(--card-foreground)',
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
