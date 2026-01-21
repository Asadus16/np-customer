/**
 * Application constants
 */

// API Configuration
// Use relative path to leverage Next.js API rewrites (configured in next.config.ts)
// This avoids mixed content errors by proxying through Next.js server
// The rewrite proxies /api/* requests to your HTTP backend
const getApiBaseUrl = (): string => {
  // If explicitly set to use direct URL (not using rewrites), use it
  if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_DIRECT === 'true') {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Use relative path - Next.js rewrites will proxy to backend
  // This works for both development and production
  return '/api';
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
