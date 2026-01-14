'use client';

import { Provider } from 'react-redux';
import { useEffect, useRef } from 'react';
import { store } from './index';
import { initializeAuth, setInitialState } from './slices/authSlice';
import { STORAGE_KEYS } from '@/config';
import type { User } from '@/types';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const initialized = useRef(false);

  useEffect(() => {
    // Initialize auth from localStorage immediately on client
    if (!initialized.current && typeof window !== 'undefined') {
      initialized.current = true;
      
      // initializeAuth will handle setting state from localStorage and verifying token
      store.dispatch(initializeAuth());
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
