import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/auth/apiClient';

export const useApi = () => {
    const { accessToken, refreshToken, updateAccessToken, logout, isLoading } = useAuth();

    // Configure API client whenever tokens are available (even if loading)
    // This ensures the client is ready as soon as tokens are loaded
    useEffect(() => {
        if (accessToken && refreshToken) {
            console.log('Configuring API client with tokens');
            apiClient.configure({
                accessToken,
                refreshToken,
                onTokenRefresh: updateAccessToken,
                onLogout: logout,
            });
        } else {
            // Try to load from localStorage if not in context yet
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');
            if (storedAccessToken && storedRefreshToken) {
                console.log('Configuring API client with tokens from localStorage');
                apiClient.configure({
                    accessToken: storedAccessToken,
                    refreshToken: storedRefreshToken,
                    onTokenRefresh: updateAccessToken,
                    onLogout: logout,
                });
            }
        }
    }, [accessToken, refreshToken, updateAccessToken, logout]);

    return apiClient;
};

export default useApi;
