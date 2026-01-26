'use client';

import { useState, useCallback } from 'react';
import { addToFavorites, removeFromFavorites } from '@/lib/favorites';
import { useAuth } from './useAuth';

interface UseFavoriteReturn {
  isFavorite: boolean;
  isLoading: boolean;
  error: Error | null;
  toggleFavorite: () => Promise<boolean>;
  setInitialFavorite: (value: boolean) => void;
}

/**
 * Custom hook for managing vendor favorite status
 */
export function useFavorite(vendorId: string, initialValue: boolean = false): UseFavoriteReturn {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const setInitialFavorite = useCallback((value: boolean) => {
    setIsFavorite(value);
  }, []);

  const toggleFavorite = useCallback(async (): Promise<boolean> => {
    if (!isAuthenticated) {
      setError(new Error('Please login to add favorites'));
      return false;
    }

    if (!vendorId) {
      setError(new Error('Vendor ID is required'));
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (isFavorite) {
        await removeFromFavorites(vendorId);
        setIsFavorite(false);
      } else {
        await addToFavorites(vendorId);
        setIsFavorite(true);
      }
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to update favorite');
      setError(error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [vendorId, isFavorite, isAuthenticated]);

  return {
    isFavorite,
    isLoading,
    error,
    toggleFavorite,
    setInitialFavorite,
  };
}
