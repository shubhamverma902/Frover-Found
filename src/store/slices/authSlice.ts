import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { loginApi, registerApi, getMeApi, logoutApi } from '@/api/auth.api';
import type { LoginPayload, RegisterPayload } from '@/api/auth.api';
import { submitOnboarding } from './onboardingSlice';

// ── Types ────────────────────────────────────────────────────

export interface AuthUser {
  id?:                  string;
  name:                 string;
  email:                string;
  plan:                 'free' | 'premium';
  onboardingCompleted?: boolean;
  collaboratorRole?:    'planner' | 'viewer' | null;
}

interface AuthState {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  // true after the initial restoreAuth check resolves (fulfilled or rejected)
  // Used by ProtectedRoute to avoid flashing a redirect before the token is validated
  hydrated:        boolean;
  status:          'idle' | 'loading' | 'succeeded' | 'failed';
  error:           string | null;
  // HTTP status code for the last login error (null = no error or non-login error).
  // 429 means the account is temporarily locked out.
  errorCode:       number | null;
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
      return rejectWithValue({
        message: err.response?.data?.message ?? 'Login failed. Please try again.',
        code:    err.response?.status         ?? 0,
      });
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

// Calls the backend /auth/logout to clear the httpOnly refresh cookie,
// then clears local state. Falls back to local-only cleanup if the request fails.
export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { dispatch }) => {
    try { await logoutApi(); } catch { /* ignore network errors on logout */ }
    dispatch(logout());
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
  errorCode:       null,
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
      state.errorCode       = null;
    },
    clearError(state) {
      state.error     = null;
      state.errorCode = null;
      state.status    = 'idle';
    },
  },
  extraReducers: builder => {
    const pending   = (state: AuthState) => { state.status = 'loading'; state.error = null; state.errorCode = null; };
    const fulfilled = (state: AuthState, action: { payload: AuthUser }) => {
      state.status          = 'succeeded';
      state.user            = action.payload;
      state.isAuthenticated = true;
      state.hydrated        = true;
    };
    const rejected = (state: AuthState, action: { payload: unknown }) => {
      state.status    = 'failed';
      state.error     = typeof action.payload === 'string' ? action.payload : 'Something went wrong.';
      state.errorCode = null;
    };
    // loginUser carries { message, code } so we can distinguish a 429 lockout from a 401
    interface LoginErrorPayload { message: string; code: number; }
    const loginRejected = (state: AuthState, action: { payload: unknown }) => {
      const p         = action.payload as LoginErrorPayload | undefined;
      state.status    = 'failed';
      state.error     = p?.message ?? 'Login failed. Please try again.';
      state.errorCode = p?.code    ?? null;
    };

    builder
      .addCase(loginUser.pending,   pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected,  loginRejected)

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

export const selectUser              = (state: RootState) => state.auth.user;
export const selectIsAuthenticated   = (state: RootState) => state.auth.isAuthenticated;
export const selectHydrated          = (state: RootState) => state.auth.hydrated;
export const selectAuthStatus        = (state: RootState) => state.auth.status;
export const selectAuthError         = (state: RootState) => state.auth.error;
export const selectAuthErrorCode     = (state: RootState) => state.auth.errorCode;
export const selectCollaboratorRole  = (state: RootState) => state.auth.user?.collaboratorRole ?? null;

export default authSlice.reducer;
