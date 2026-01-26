/**
 * Application constants
 */

// API Configuration
// Use NEXT_PUBLIC_API_URL directly for backend API calls
const getApiBaseUrl = (): string => {
  // Use NEXT_PUBLIC_API_URL if set
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Fallback to localhost:8000 for development
  // This assumes Laravel backend is running on port 8000
  if (typeof window !== 'undefined') {
    // Client-side: use current origin or default to localhost:8000
    const origin = window.location.origin;
    // If running on localhost, try to use port 8000 for API
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:8000/api';
    }
    // For production, you might want to use the same origin
    return `${origin}/api`;
  }
  
  // Server-side fallback
  return 'http://localhost:8000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// App Configuration
export const APP_NAME = 'NP Customer';
export const APP_VERSION = '1.0.0';

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'np_auth_token',
  USER: 'np_user',
  CART: 'np_cart',
  THEME: 'np_theme',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VENDORS: '/vendors',
  VENDOR_DETAIL: '/vendors/:id',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  NEW_ORDER: '/orders/new',
  PROFILE: '/profile',
  ADDRESSES: '/profile/addresses',
  PAYMENT_METHODS: '/profile/payment-methods',
  NOTIFICATIONS: '/notifications',
  SUBSCRIPTIONS: '/subscriptions',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

// Date/Time Formats
export const DATE_FORMAT = 'MMM dd, yyyy';
export const TIME_FORMAT = 'hh:mm a';
export const DATETIME_FORMAT = 'MMM dd, yyyy hh:mm a';

// Currency
export const CURRENCY = 'AED';
export const CURRENCY_LOCALE = 'en-AE';
