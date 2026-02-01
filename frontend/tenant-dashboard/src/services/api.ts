import axios from 'axios';

/**
 * API Service
 * 
 * Centralized HTTP client configuration for API calls.
 */

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    timeout: 30000,
    withCredentials: true, // Send cookies with requests
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add tenant slug header if available
        const tenantSlug = localStorage.getItem('tenantSlug');
        if (tenantSlug) {
            config.headers['x-tenant-slug'] = tenantSlug;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Unauthorized - redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
