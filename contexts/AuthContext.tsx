'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/auth/apiClient';
import { verifyAccessToken } from '@/lib/auth/jwt';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role?: string) => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
    updateAccessToken: (newToken: string) => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Configure API client whenever tokens change
    useEffect(() => {
        apiClient.configure({
            accessToken,
            refreshToken,
            onTokenRefresh: updateAccessToken,
            onLogout: logout,
        });
    }, [accessToken, refreshToken]);

    useEffect(() => {
        const loadTokens = async () => {
            try {
        const storedAccessToken = localStorage.getItem('accessToken');
        const storedRefreshToken = localStorage.getItem('refreshToken');
        const storedUser = localStorage.getItem('user');

                console.log('Loading tokens from localStorage:', {
                    hasAccessToken: !!storedAccessToken,
                    hasRefreshToken: !!storedRefreshToken,
                    hasUser: !!storedUser
                });

                // Always try to load tokens if they exist, even if expired
                // The API client will handle refresh automatically
                if (storedAccessToken && storedRefreshToken && storedUser) {
                    try {
                        console.log('Setting tokens from localStorage');
                        console.log('Access token exists:', !!storedAccessToken);
                        console.log('Refresh token exists:', !!storedRefreshToken);
                        console.log('User data exists:', !!storedUser);

            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setUser(JSON.parse(storedUser));
                        console.log('Tokens successfully loaded from localStorage');
                    } catch (parseError) {
                        console.error('Error parsing stored user data:', parseError);
                        // Clear corrupted data
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                    }
                } else {
                    console.log('No stored tokens found in localStorage');
                    console.log('Access token:', !!storedAccessToken);
                    console.log('Refresh token:', !!storedRefreshToken);
                    console.log('User:', !!storedUser);
                }
            } catch (error) {
                console.error('Error loading tokens from localStorage:', error);
                // Clear potentially corrupted data
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
        }

        setIsLoading(false);
        };

        loadTokens();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Login failed');
            }

            const data = await response.json();

            setUser(data.user);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            router.push("/dashboard");
        } catch (error: any) {
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, role?: string) => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Registration failed');
            }

            const data = await response.json();

            setUser(data.user);
            setAccessToken(data.accessToken);
            setRefreshToken(data.refreshToken);

            localStorage.setItem('accessToken', data.accessToken);
            localStorage.setItem('refreshToken', data.refreshToken);
            localStorage.setItem('user', JSON.stringify(data.user));

            router.push('/dashboard');
        } catch (error: any) {
            throw error;
        }
    };

    const updateAccessToken = (newToken: string) => {
        setAccessToken(newToken);
        localStorage.setItem('accessToken', newToken);
    };

    const refreshAccessToken = async () => {
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            updateAccessToken(data.accessToken);
        } catch (error) {
            // If refresh fails, logout
            logout();
            throw error;
        }
    };

    const logout = () => {
        console.log('LOGOUT CALLED - Clearing user session');
        console.log('Previous state:', {
            hadUser: !!user,
            hadAccessToken: !!accessToken,
            hadRefreshToken: !!refreshToken
        });

        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);

        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');

        console.log('User session cleared, redirecting to login');
        router.push('/auth/login');
    };

    return (
        <AuthContext.Provider value={{ user, accessToken, refreshToken, login, register, logout, refreshAccessToken, updateAccessToken, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

