interface ApiClientOptions {
    accessToken: string | null;
    refreshToken: string | null;
    onTokenRefresh?: (newAccessToken: string) => void;
    onLogout?: () => void;
}

class ApiClient {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private onTokenRefresh?: (newAccessToken: string) => void;
    private onLogout?: () => void;
    private isRefreshing = false;
    private failedQueue: Array<{
        resolve: (value?: any) => void;
        reject: (reason?: any) => void;
    }> = [];

    configure(options: ApiClientOptions) {
        this.accessToken = options.accessToken;
        this.refreshToken = options.refreshToken;
        this.onTokenRefresh = options.onTokenRefresh;
        this.onLogout = options.onLogout;
    }

    private processQueue(error: any, token: string | null = null) {
        this.failedQueue.forEach(({ resolve, reject }) => {
            if (error) {
                reject(error);
            } else {
                resolve(token);
            }
        });

        this.failedQueue = [];
    }

    private async refreshAccessToken(): Promise<string | null> {
        if (!this.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken: this.refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            const newAccessToken = data.accessToken;

            // Update the stored token
            this.accessToken = newAccessToken;

            // Notify the context
            if (this.onTokenRefresh) {
                this.onTokenRefresh(newAccessToken);
            }

            // Update localStorage
            localStorage.setItem('accessToken', newAccessToken);

            return newAccessToken;
        } catch (error) {
            // If refresh fails, logout
            if (this.onLogout) {
                this.onLogout();
            }
            throw error;
        }
    }

    async request<T = any>(
        url: string,
        options: RequestInit = {}
    ): Promise<T> {
        const headers = new Headers(options.headers);

        // Add authorization header if we have a token
        if (this.accessToken) {
            headers.set('Authorization', `Bearer ${this.accessToken}`);
        }

        const requestOptions = {
            ...options,
            headers,
        };

        try {
            const response = await fetch(url, requestOptions);

            // If unauthorized and we have a refresh token, try to refresh
            if (response.status === 401 && this.refreshToken && !this.isRefreshing) {
                this.isRefreshing = true;

                try {
                    const newToken = await this.refreshAccessToken();
                    this.isRefreshing = false;

                    // Retry the original request with new token
                    headers.set('Authorization', `Bearer ${newToken}`);
                    const retryResponse = await fetch(url, {
                        ...requestOptions,
                        headers,
                    });

                    this.processQueue(null, newToken);
                    return await retryResponse.json();
                } catch (refreshError) {
                    this.isRefreshing = false;
                    this.processQueue(refreshError, null);
                    throw refreshError;
                }
            }

            // If still unauthorized after refresh attempt, logout
            if (response.status === 401 && this.onLogout) {
                this.onLogout();
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            // If we get a network error during token refresh, add to queue
            if (this.isRefreshing) {
                return new Promise((resolve, reject) => {
                    this.failedQueue.push({ resolve, reject });
                });
            }
            throw error;
        }
    }

    // Convenience methods
    async get<T = any>(url: string): Promise<T> {
        return this.request<T>(url, { method: 'GET' });
    }

    async post<T = any>(url: string, data?: any): Promise<T> {
        return this.request<T>(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T = any>(url: string, data?: any): Promise<T> {
        return this.request<T>(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(url: string): Promise<T> {
        return this.request<T>(url, { method: 'DELETE' });
    }
}

export const apiClient = new ApiClient();
export default apiClient;
