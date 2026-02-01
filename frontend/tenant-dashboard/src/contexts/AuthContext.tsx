import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

/**
 * Authentication Context
 * 
 * Manages global authentication state for the application.
 * Provides login, logout, and token refresh functionality.
 * 
 * Features:
 * - JWT token management
 * - HTTP-only cookie storage
 * - Automatic token refresh
 * - User context persistence
 * - Protected route support
 */

interface User {
    id: string;
    email: string;
    full_name: string;
    role: string;
    tenantId: string;
    tenantSlug: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string, orgId: string) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Configure axios interceptor for authentication
    useEffect(() => {
        const interceptor = axios.interceptors.request.use(
            (config) => {
                // Token is sent via HTTP-only cookies
                config.withCredentials = true;

                // Add tenant slug header if available
                if (user?.tenantSlug) {
                    config.headers['x-tenant-slug'] = user.tenantSlug;
                }

                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => axios.interceptors.request.eject(interceptor);
    }, [user]);

    // Setup response interceptor for token refresh
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                // If 401 and not already retried, try to refresh token
                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        await refreshToken();
                        return axios(originalRequest);
                    } catch (refreshError) {
                        // Refresh failed, logout user
                        await logout();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                return Promise.reject(error);
            }
        );

        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get<User>(
                `${import.meta.env.VITE_API_URL}/auth/me`,
                { withCredentials: true }
            );

            setUser(response.data);
            setToken('authenticated'); // Token is in cookie
        } catch (error) {
            setUser(null);
            setToken(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string, orgId: string) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/login`,
                { email, password, orgId },
                {
                    withCredentials: true,
                    headers: { 'x-tenant-slug': orgId }
                }
            );

            setUser(response.data.user);
            setToken('authenticated');
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const logout = async () => {
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/logout`,
                {},
                { withCredentials: true }
            );
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setToken(null);
            window.location.href = '/login';
        }
    };

    const refreshToken = async () => {
        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {},
            { withCredentials: true }
        );

        setUser(response.data.user);
        setToken('authenticated');
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        refreshToken,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Protected Route Wrapper
 * 
 * Usage:
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRole
}) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!user) {
        window.location.href = '/login';
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        return (
            <div className="unauthorized">
                <h1>403 - Unauthorized</h1>
                <p>You don't have permission to access this page.</p>
            </div>
        );
    }

    return <>{children}</>;
};
