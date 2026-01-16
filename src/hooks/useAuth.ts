'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  login as loginAction,
  register as registerAction,
  logout as logoutAction,
  clearError,
} from '@/store/slices/authSlice';
import type { LoginCredentials, RegisterData } from '@/types';
import { ROUTES } from '@/config';

/**
 * Custom hook for authentication
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginCredentials, skipRedirect = false) => {
      const result = await dispatch(loginAction(credentials));
      if (loginAction.fulfilled.match(result)) {
        if (!skipRedirect) {
          router.push(ROUTES.HOME);
        }
        return true;
      }
      return false;
    },
    [dispatch, router]
  );

  const register = useCallback(
    async (data: RegisterData, skipRedirect = false) => {
      const result = await dispatch(registerAction(data));
      if (registerAction.fulfilled.match(result)) {
        if (!skipRedirect) {
          router.push(ROUTES.HOME);
        }
        return true;
      }
      return false;
    },
    [dispatch, router]
  );

  const logout = useCallback(async () => {
    await dispatch(logoutAction());
    router.push(ROUTES.LOGIN);
  }, [dispatch, router]);

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError: clearAuthError,
  };
}
