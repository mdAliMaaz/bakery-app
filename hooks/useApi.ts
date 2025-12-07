import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/auth/apiClient';

export const useApi = () => {
    const { accessToken, refreshToken, updateAccessToken, logout } = useAuth();

    // Configure API client with current tokens
    apiClient.configure({
        accessToken,
        refreshToken,
        onTokenRefresh: updateAccessToken,
        onLogout: logout,
    });

    return apiClient;
};

export default useApi;
