'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { Menu } from 'lucide-react';

interface AppLayoutProps {
    children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    // Load collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved) {
            setIsSidebarCollapsed(JSON.parse(saved));
        }
    }, []);

    // Close sidebar on mobile when clicking outside or on navigation
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (isSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isSidebarOpen]);

    // Handle escape key to close sidebar
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isSidebarOpen) {
                setIsSidebarOpen(false);
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isSidebarOpen]);

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-card border-b border-border px-4 py-3 flex items-center justify-between">
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                    aria-label="Open sidebar"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <h1 className="text-lg font-semibold text-foreground">
                    Restaurant Inventory
                </h1>

                {/* Spacer for centering */}
                <div className="w-10" />
            </div>

            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

            {/* Main Content */}
            <div className={`
                transition-all duration-300 ease-in-out
                ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}
                ml-0
            `}>
                {/* Mobile top padding to account for fixed header */}
                <div className="pt-16 lg:pt-0">
                    <main className="min-h-screen">
                        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
