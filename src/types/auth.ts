/**
 * User role type
 */
export interface UserRole {
  id: number;
  name: string;
}

/**
 * User type
 */
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  email_verified_at?: string;
  roles?: UserRole[];
  created_at: string;
  updated_at: string;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Register data
 */
export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password: string;
  password_confirmation: string;
  nationality?: string;
}

/**
 * Auth response from API
 */
export interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Get user full name helper
 */
export function getUserFullName(user: User | null): string {
  if (!user) return '';
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`;
  }
  return user.email;
}

/**
 * Get user initials helper
 */
export function getUserInitials(user: User | null): string {
  if (!user) return 'U';
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
  }
  return user.email[0].toUpperCase();
}
