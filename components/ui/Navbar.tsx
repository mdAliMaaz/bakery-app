'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LayoutDashboard, Package, ChefHat, FileText, Menu, X, ChevronDown, LogOut, User } from 'lucide-react';

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Recipes', href: '/recipes', icon: ChefHat },
        { name: 'Orders', href: '/orders', icon: FileText },
    ];

    const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/');

    const IconComponent = ({ icon: Icon, className }: { icon: any; className?: string }) => {
        return <Icon className={className || 'w-4 h-4'} />;
    };

    return (
        <nav className="sticky top-0 z-40 glass border-b border-border transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200 shadow-md">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-xl font-bold text-foreground">
                                Restaurant Inventory
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`
                                        relative
                                        inline-flex
                                        items-center
                                        px-4
                                        py-2
                                        text-sm
                                        font-medium
                                        rounded-lg
                                        transition-all
                                        duration-200
                                        ${isActive(item.href)
                                            ? 'text-primary bg-primary/10 dark:bg-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {item.name}
                                    {isActive(item.href) && (
                                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center space-x-3">
                        <ThemeToggle />

                        {/* User Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm shadow-md">
                                    {user?.name?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <div className="text-sm font-medium text-foreground">{user?.name}</div>
                                    <div className="text-xs text-muted-foreground">{user?.role}</div>
                                </div>
                                <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                                />
                            </button>

                            {/* User Dropdown */}
                            {isUserMenuOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-xl shadow-xl py-2 animate-scale-in z-50">
                                    <div className="px-4 py-3 border-b border-border">
                                        <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            logout();
                                            setIsUserMenuOpen(false);
                                        }}
                                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors duration-200 text-foreground"
                            aria-label="Toggle menu"
                        >
                            {isMobileMenuOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-border py-4 animate-slide-down">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`
                                        flex
                                        items-center
                                        px-4
                                        py-3
                                        text-base
                                        font-medium
                                        rounded-lg
                                        transition-all
                                        duration-200
                                        mb-1
                                        ${isActive(item.href)
                                            ? 'text-primary bg-primary/10 dark:bg-primary/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5 mr-3" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </nav>
    );
}

