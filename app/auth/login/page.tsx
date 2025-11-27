'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import PremiumButton from '@/components/forms/PremiumButton';
import PremiumInput from '@/components/forms/PremiumInput';
import { Package, FileText, ChefHat, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10" />

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

            <div className="relative z-10 max-w-6xl w-full mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Branding */}
                    <div className="hidden md:block space-y-6 animate-slide-up">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Restaurant Inventory
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Manage your inventory, orders, and recipes with ease
                            </p>
                        </div>
                        <div className="space-y-3 pt-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Inventory Management</h3>
                                    <p className="text-sm text-muted-foreground">Track stock levels in real-time</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-secondary/10 dark:bg-secondary/20 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Order Tracking</h3>
                                    <p className="text-sm text-muted-foreground">Manage customer orders efficiently</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-accent/10 dark:bg-accent/20 flex items-center justify-center">
                                    <ChefHat className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Recipe Management</h3>
                                    <p className="text-sm text-muted-foreground">Organize your recipes and ingredients</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="w-full max-w-md mx-auto animate-scale-in">
                        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    Welcome Back
                                </h2>
                                <p className="text-muted-foreground">
                                    Sign in to your account to continue
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg animate-fade-in">
                                        {error}
                                    </div>
                                )}

                                <PremiumInput
                                    label="Email address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    leftIcon={<Mail className="w-5 h-5" />}
                                />

                                <PremiumInput
                                    label="Password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    leftIcon={<Lock className="w-5 h-5" />}
                                />

                                <PremiumButton
                                    type="submit"
                                    isLoading={loading}
                                    className="w-full"
                                >
                                    Sign in
                                </PremiumButton>

                                <div className="text-center text-sm">
                                    <span className="text-muted-foreground">Don&apos;t have an account? </span>
                                    <Link href="/auth/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                        Register here
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}