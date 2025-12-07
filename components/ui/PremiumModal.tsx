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
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
            }}
        >
            <div
                ref={modalRef}
                onClick={(e) => e.stopPropagation()}
                className={`relative w-full ${sizeClasses[size]} shadow-2xl animate-scale-in border border-border overflow-hidden`}
                style={{
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: 'var(--card)',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                }}
            >

                <div className="relative z-10 flex flex-col h-full">
                    {title && (
                        <div className="px-4 py-3 border-b border-border" style={{ backgroundColor: 'var(--muted)' }}>
                            <h2 className="text-lg font-semibold" style={{ color: 'var(--card-foreground)' }}>{title}</h2>
                        </div>
                    )}

                    {showCloseButton && (
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 z-20 p-2 rounded-lg bg-muted hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            style={{ marginTop: '4px', marginRight: '4px' }}
                            aria-label="Close modal"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}

                    <div
                        className="relative overflow-visible flex-1 p-4"
                        style={{
                            maxHeight: 'calc(90vh - 70px)',
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
