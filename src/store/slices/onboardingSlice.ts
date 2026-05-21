import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { saveOnboardingApi, getOnboardingApi } from '@/api/onboarding.api';
import type { WeddingProfile } from '@/types/onboarding';

// ── State ────────────────────────────────────────────────────

interface OnboardingState {
  completed:      boolean;
  profile:        WeddingProfile | null;
  status:         'idle' | 'loading' | 'succeeded' | 'failed';
  error:          string | null;
}

const initialState: OnboardingState = {
  completed: false,
  profile:   null,
  status:    'idle',
  error:     null,
};

// ── Thunks ───────────────────────────────────────────────────

export const submitOnboarding = createAsyncThunk(
  'onboarding/submit',
  async (profile: WeddingProfile, { rejectWithValue }) => {
    try {
      return await saveOnboardingApi(profile);
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to save onboarding details.');
    }
  }
);

export const fetchOnboarding = createAsyncThunk(
  'onboarding/fetch',
  async (_, { rejectWithValue }) => {
    try {
      return await getOnboardingApi();
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? 'Failed to load onboarding details.');
    }
  }
);

// ── Slice ────────────────────────────────────────────────────

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    clearOnboardingError(state) {
      state.error  = null;
      state.status = 'idle';
    },
  },
  extraReducers: builder => {
    builder
      // submit
      .addCase(submitOnboarding.pending, state => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(submitOnboarding.fulfilled, (state, { payload }) => {
        state.status    = 'succeeded';
        state.completed = payload.onboardingCompleted;
        state.profile   = payload.weddingProfile;
      })
      .addCase(submitOnboarding.rejected, (state, { payload }) => {
        state.status = 'failed';
        state.error  = payload as string;
      })

      // fetch
      .addCase(fetchOnboarding.pending, state => {
        state.status = 'loading';
      })
      .addCase(fetchOnboarding.fulfilled, (state, { payload }) => {
        state.status    = 'succeeded';
        state.completed = payload.onboardingCompleted;
        state.profile   = payload.weddingProfile;
      })
      .addCase(fetchOnboarding.rejected, state => {
        state.status = 'idle';
      });
  },
});

export const { clearOnboardingError } = onboardingSlice.actions;

// ── Selectors ────────────────────────────────────────────────
// Import these in any feature that needs wedding details

export const selectOnboardingCompleted = (state: RootState) => state.onboarding.completed;
export const selectWeddingProfile      = (state: RootState) => state.onboarding.profile;
export const selectOnboardingStatus    = (state: RootState) => state.onboarding.status;
export const selectOnboardingError     = (state: RootState) => state.onboarding.error;

export default onboardingSlice.reducer;
