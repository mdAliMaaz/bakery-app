import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/auth/apiClient';

export const useApi = () => {
    const { accessToken, refreshToken, updateAccessToken, logout, isLoading } = useAuth();

    // Only configure API client when not loading and we have tokens
    if (!isLoading && accessToken && refreshToken) {
        console.log('Configuring API client with tokens');
        apiClient.configure({
            accessToken,
            refreshToken,
            onTokenRefresh: updateAccessToken,
            onLogout: logout,
        });
    } else if (isLoading) {
        console.log('Auth context still loading, API client not configured yet');
    } else if (!accessToken || !refreshToken) {
        console.log('No tokens available, API client not configured');
    }

    return apiClient;
};

export default useApi;
