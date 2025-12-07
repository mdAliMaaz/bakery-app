'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    console.log('ProtectedRoute render:', {
        isLoading,
        hasUser: !!user,
        userRole: user?.role,
        allowedRoles
    });

    useEffect(() => {
        console.log('ProtectedRoute useEffect triggered:', {
            isLoading,
            hasUser: !!user,
            userRole: user?.role
        });

        if (!isLoading && !user) {
            console.log('ProtectedRoute: No user, redirecting to login');
            router.push('/auth/login');
        } else if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
            console.log('ProtectedRoute: User role not allowed, redirecting to dashboard');
            router.push('/dashboard');
        } else if (!isLoading && user) {
            console.log('ProtectedRoute: User authenticated, allowing access');
        }
    }, [user, isLoading, allowedRoles, router]);

    if (isLoading) {
        console.log('ProtectedRoute: Still loading, showing loading screen');
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        console.log('ProtectedRoute: No user after loading, returning null');
        return null;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                    <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}

