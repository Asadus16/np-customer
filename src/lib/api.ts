import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, STORAGE_KEYS } from '@/config';

/**
 * Create and configure axios instance
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Request interceptor - Add auth token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle common errors
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Only redirect to login if this is not a public endpoint
      // Public endpoints should not require authentication
      const url = error.config?.url || '';
      const isPublicEndpoint = url.includes('/public/');
      
      if (!isPublicEndpoint && typeof window !== 'undefined') {
        // Clear auth
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        
        // Don't redirect if:
        // 1. We're already on an auth page
        // 2. We're on a booking page (let the component handle it with login modal)
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.startsWith('/auth/');
        const isBookingPage = currentPath.startsWith('/booking/');
        
        if (!isAuthPage && !isBookingPage) {
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

/**
 * API Response wrapper type
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

/**
 * API Error type
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}
