'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LayoutDashboard, Package, ChefHat, FileText, Menu, X, ChevronDown, LogOut, User, Package as PackageIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Recipes', href: '/recipes', icon: ChefHat },
        { name: 'Orders', href: '/orders', icon: FileText },
        { name: 'Ready to Dispatch', href: '/orders/ready', icon: FileText },
    ];

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    const IconComponent = ({ icon: Icon, className }: { icon: any; className?: string }) => {
        return <Icon className={className || 'w-5 h-5'} />;
    };

    // Load collapsed state from localStorage and detect screen size
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved) {
            setIsCollapsed(JSON.parse(saved));
        }

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Save collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        onClose();
    };

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-40 lg:hidden animate-fade-in"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed top-0 left-0 z-50 h-screen bg-card border-r border-border/50
                transform transition-all duration-500 ease-out shadow-xl backdrop-blur-xl
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0
                ${isCollapsed ? 'lg:w-20' : 'lg:w-72 w-80'}
                w-80
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <Link
                            href="/dashboard"
                            className={`flex items-center space-x-3 group ${isCollapsed ? 'lg:justify-center' : ''}`}
                            onClick={onClose}
                        >
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200 shadow-md">
                                <PackageIcon className="w-5 h-5 text-white" />
                            </div>
                            {!isCollapsed && (
                                <h1 className="text-lg font-bold text-foreground hidden lg:block">
                                    Restaurant Inventory
                                </h1>
                            )}
                        </Link>

                        {/* Desktop Collapse Button */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors duration-200"
                            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {isCollapsed ? (
                                <ChevronRight className="w-4 h-4" />
                            ) : (
                                <ChevronLeft className="w-4 h-4" />
                            )}
                        </button>

                        {/* Close button for mobile */}
                        <button
                            onClick={onClose}
                            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200"
                            aria-label="Close sidebar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={onClose}
                                    className={`
                                        flex items-center px-3 py-3 text-sm font-medium rounded-lg
                                        transition-all duration-200 group relative
                                        ${isCollapsed ? 'lg:px-3 lg:justify-center' : 'px-4'}
                                        ${isActive(item.href)
                                            ? 'bg-primary text-primary-foreground border border-primary'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }
                                    `}
                                    title={isCollapsed ? item.name : undefined}
                                >
                                    <Icon className={`w-5 h-5 flex-shrink-0 ${isCollapsed ? 'lg:mr-0' : 'mr-3'}`} />
                                    {(!isCollapsed || isMobile) && (
                                        <span className="truncate">{item.name}</span>
                                    )}
                                    {isActive(item.href) && (
                                        <div className={`w-2 h-2 bg-primary rounded-full ${isCollapsed ? 'lg:absolute lg:right-2 lg:top-1/2 lg:transform lg:-translate-y-1/2' : 'ml-auto'}`} />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Section */}
                    <div className="border-t border-border p-4">
                        {/* Theme Toggle */}
                        <div className={`mb-4 ${isCollapsed ? 'lg:flex lg:justify-center' : ''}`}>
                            <ThemeToggle />
                        </div>

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className={`
                                    flex items-center w-full rounded-lg hover:bg-muted transition-colors duration-200
                                    focus:outline-none focus:ring-2 focus:ring-primary
                                    ${isCollapsed ? 'lg:px-3 lg:justify-center lg:py-2' : 'px-3 py-2'}
                                `}
                                title={isCollapsed ? `${user?.name} (${user?.role})` : undefined}
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0">
                                    {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                                </div>
                                {(!isCollapsed || isMobile) && (
                                    <div className="flex-1 text-left min-w-0 ml-3">
                                        <div className="text-sm font-medium text-foreground truncate">{user?.name}</div>
                                        <div className="text-xs text-muted-foreground truncate">{user?.role}</div>
                                    </div>
                                )}
                                {(!isCollapsed || isMobile) && (
                                    <ChevronDown
                                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ml-2 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                    />
                                )}
                            </button>

                            {/* User Dropdown */}
                            {isUserMenuOpen && (
                                <div className={`absolute bottom-full mb-2 bg-card border border-border/50 rounded-2xl shadow-2xl py-3 animate-scale-in z-50 backdrop-blur-xl ${isCollapsed ? 'lg:left-20 lg:right-auto lg:w-64' : 'left-0 right-0'}`}>
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-muted transition-colors duration-200"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
