'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import PremiumButton from '@/components/forms/PremiumButton';
import PremiumInput from '@/components/forms/PremiumInput';
import PremiumSelect from '@/components/forms/PremiumSelect';
import { Zap, BarChart3, Lock as LockIcon, User as UserIcon, Mail, Lock, Plus } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('Staff');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(name, email, password, role);
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
            {/* Background Gradient */}

            {/* Decorative Elements */}

            <div className="relative z-10 max-w-6xl w-full mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Left Side - Branding */}
                    <div className="hidden md:block space-y-6 animate-slide-up">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                Join Us Today
                            </h1>
                            <p className="text-xl text-muted-foreground">
                                Start managing your restaurant inventory efficiently
                            </p>
                        </div>
                        <div className="space-y-3 pt-8">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Real-time Updates</h3>
                                    <p className="text-sm text-muted-foreground">Get instant notifications on stock changes</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                                    <BarChart3 className="w-5 h-5 text-secondary" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Analytics Dashboard</h3>
                                    <p className="text-sm text-muted-foreground">Track performance with detailed insights</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                                    <LockIcon className="w-5 h-5 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-foreground">Secure & Reliable</h3>
                                    <p className="text-sm text-muted-foreground">Your data is safe with us</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Register Form */}
                    <div className="w-full max-w-md mx-auto animate-scale-in">
                        <div className="bg-card border border-border p-8 shadow-xl">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                                    <Plus className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-3xl font-bold text-foreground mb-2">
                                    Create Account
                                </h2>
                                <p className="text-muted-foreground">
                                    Register for Restaurant Inventory Management
                                </p>
                            </div>

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                {error && (
                                    <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg animate-fade-in">
                                        {error}
                                    </div>
                                )}

                                <PremiumInput
                                    label="Full Name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                   
                                    leftIcon={<UserIcon className="w-5 h-5" />}
                                />

                                <PremiumInput
                                    label="Email address"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                   
                                    leftIcon={<Mail className="w-5 h-5" />}
                                />

                                <PremiumInput
                                    label="Password"
                                    type="password"
                                    required
                                    minLength={6}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                  
                                    leftIcon={<Lock className="w-5 h-5" />}
                                />

                                <PremiumSelect
                                    label="Role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    options={[
                                        { value: 'Staff', label: 'Staff' },
                                        { value: 'Admin', label: 'Admin' },
                                        { value: 'Viewer', label: 'Viewer' },
                                    ]}
                                />

                                <PremiumButton
                                    type="submit"
                                    isLoading={loading}
                                    className="w-full"
                                >
                                    Create Account
                                </PremiumButton>

                                <div className="text-center text-sm">
                                    <span className="text-muted-foreground">Already have an account? </span>
                                    <Link href="/auth/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                                        Sign in here
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