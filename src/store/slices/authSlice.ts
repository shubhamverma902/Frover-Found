import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { loginApi, registerApi, getMeApi } from '@/api/auth.api';
import type { LoginPayload, RegisterPayload } from '@/api/auth.api';
import { submitOnboarding } from './onboardingSlice';

// ── Types ────────────────────────────────────────────────────

export interface AuthUser {
  id?:                  string;
  name:                 string;
  email:                string;
  plan:                 'free' | 'premium';
  onboardingCompleted?: boolean;
}

interface AuthState {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  // true after the initial restoreAuth check resolves (fulfilled or rejected)
  // Used by ProtectedRoute to avoid flashing a redirect before the token is validated
  hydrated:        boolean;
  status:          'idle' | 'loading' | 'succeeded' | 'failed';
  error:           string | null;
}

// ── Helpers ──────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';

const saveToken  = (token: string) => localStorage.setItem(TOKEN_KEY, token);
const clearToken = ()               => localStorage.removeItem(TOKEN_KEY);
const getToken   = ()               => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null);

// ── Async Thunks ─────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const result = await loginApi(credentials);
      saveToken(result.token);
      return result.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Login failed. Please try again.');
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (payload: RegisterPayload & { plan: 'free' | 'premium' }, { rejectWithValue }) => {
    try {
      const result = await registerApi(payload);
      saveToken(result.token);
      return result.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Sign up failed. Please try again.');
    }
  }
);

export const restoreAuth = createAsyncThunk(
  'auth/restoreAuth',
  async (_, { rejectWithValue }) => {
    const token = getToken();
    if (!token) return rejectWithValue('No token');
    try {
      return await getMeApi();
    } catch {
      clearToken();
      return rejectWithValue('Session expired');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────

const initialState: AuthState = {
  user:            null,
  isAuthenticated: false,
  hydrated:        false,
  status:          'idle',
  error:           null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      clearToken();
      state.user            = null;
      state.isAuthenticated = false;
      state.hydrated        = true;
      state.status          = 'idle';
      state.error           = null;
    },
    clearError(state) {
      state.error  = null;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    const pending   = (state: AuthState) => { state.status = 'loading'; state.error = null; };
    const fulfilled = (state: AuthState, action: { payload: AuthUser }) => {
      state.status          = 'succeeded';
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.hydrated        = true;
    };
    const rejected  = (state: AuthState, action: any) => {
      state.status = 'failed';
      state.error  = action.payload as string;
    };

    builder
      .addCase(loginUser.pending,   pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected,  rejected)

      .addCase(signupUser.pending,   pending)
      .addCase(signupUser.fulfilled, fulfilled)
      .addCase(signupUser.rejected,  rejected)

      // restoreAuth is silent — no loading spinner, but marks hydrated either way
      .addCase(restoreAuth.fulfilled, fulfilled)
      .addCase(restoreAuth.rejected,  (state) => { state.status = 'idle'; state.hydrated = true; })

      // Keep auth user in sync after onboarding completes in the same session
      .addCase(submitOnboarding.fulfilled, state => {
        if (state.user) state.user.onboardingCompleted = true;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// ── Selectors ─────────────────────────────────────────────────

export const selectUser            = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectHydrated        = (state: RootState) => state.auth.hydrated;
export const selectAuthStatus      = (state: RootState) => state.auth.status;
export const selectAuthError       = (state: RootState) => state.auth.error;

export default authSlice.reducer;
