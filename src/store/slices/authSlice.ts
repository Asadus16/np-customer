import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib';
import { STORAGE_KEYS } from '@/config';
import type { AuthState, User, LoginCredentials, RegisterData, AuthResponse } from '@/types';

// Always start with empty state to avoid hydration mismatch
// Auth will be initialized from localStorage on client side only
const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

/**
 * Initialize auth from localStorage
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue, dispatch }) => {
    if (typeof window === 'undefined') {
      return null;
    }

    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    const userJson = localStorage.getItem(STORAGE_KEYS.USER);

    if (!token || !userJson) {
      return null;
    }

    // First, set the state from localStorage immediately (for instant display)
    try {
      const user = JSON.parse(userJson) as User;
      dispatch(setInitialState({ 
        user, 
        token, 
        isAuthenticated: true, 
        isLoading: false 
      }));
    } catch {
      // Invalid JSON, will be cleared below
      return null;
    }

    // Then verify token with API
    try {
      // Verify token is still valid
      // The /auth/me endpoint returns { user: UserResource }
      const response = await api.get<{ user: User }>('/auth/me');
      return {
        user: response.data.user,
        token,
      };
    } catch (error: any) {
      // Only clear if we get a 401 (unauthorized) - token is definitely invalid
      // For other errors (network, 500, etc.), keep the existing state
      if (error?.response?.status === 401) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        return null;
      }
      // For other errors, return the existing localStorage data (already set above)
      try {
        const user = JSON.parse(userJson) as User;
        return {
          user,
          token,
        };
      } catch {
        return null;
      }
    }
  }
);

/**
 * Login action
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post<{ user: User; token: string; message?: string }>('/auth/login', credentials);
      
      // Handle response - user and token are at root level
      const user = response.data.user;
      const token = response.data.token;

      if (!user || !token) {
        return rejectWithValue('Invalid response from server');
      }

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return { user, token };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Invalid login credentials';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Register action - uses customer register endpoint
 */
export const register = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      // Use customer register endpoint for customer signup
      const response = await api.post<{ user: User; token: string; message?: string }>('/customer/register', {
        ...data,
        nationality: data.nationality || 'UAE', // Default nationality if not provided
      });
      
      // Handle response - user and token are at root level
      const user = response.data.user;
      const token = response.data.token;

      if (!user || !token) {
        return rejectWithValue('Invalid response from server');
      }

      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return { user, token };
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const errorMessage = err.response?.data?.message || 
        (err.response?.data?.errors ? JSON.stringify(err.response.data.errors) : null) ||
        'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Update profile action
 */
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (data: Partial<User>, { rejectWithValue }) => {
    try {
      const response = await api.put<{ user: User }>('/auth/profile', data);
      const user = response.data.user;

      // Update localStorage
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return user;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Logout action
 */
export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore errors during logout
  } finally {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    setInitialState: (state, action: PayloadAction<{ user: User; token: string; isAuthenticated: boolean; isLoading: boolean }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = action.payload.isAuthenticated;
      state.isLoading = action.payload.isLoading;
    },
  },
  extraReducers: (builder) => {
    // Initialize
    builder
      .addCase(initializeAuth.pending, (state) => {
        // Don't set loading to true if we already have user data
        // This prevents flickering when user is already set from localStorage
        if (!state.user) {
          state.isLoading = true;
        }
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        } else {
          // No payload means no valid token, clear auth state
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        // Don't clear state on rejection - might be network error
        // Only clear if we explicitly got null from fulfilled
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    });
  },
});

export const { setUser, clearError, setInitialState } = authSlice.actions;
export default authSlice.reducer;
