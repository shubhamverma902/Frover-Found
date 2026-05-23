import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type { RootState } from '../store';
import {
  updateProfileApi,
  updateWeddingApi,
  updateNotificationsApi,
  deleteAccountApi,
  type NotificationPref,
  type ProfileData,
  type WeddingData,
} from '@/api/settings.api';
import { api } from '../api';

type ApiErr = AxiosError<{ message?: string }>;

// ── State ─────────────────────────────────────────────────

interface SettingsState {
  notifications: NotificationPref[];
  saving:        'idle' | 'profile' | 'wedding' | 'notifications';
}

const initialState: SettingsState = { notifications: [], saving: 'idle' };

// ── Thunks ────────────────────────────────────────────────

export const saveProfile = createAsyncThunk(
  'settings/saveProfile',
  async (payload: ProfileData, { dispatch, rejectWithValue }) => {
    try {
      const result = await updateProfileApi(payload);
      dispatch(api.util.invalidateTags(['Settings']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update profile'); }
  }
);

export const saveWedding = createAsyncThunk(
  'settings/saveWedding',
  async (payload: WeddingData, { dispatch, rejectWithValue }) => {
    try {
      const result = await updateWeddingApi(payload);
      dispatch(api.util.invalidateTags(['Settings']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update wedding details'); }
  }
);

export const saveNotifications = createAsyncThunk(
  'settings/saveNotifications',
  async (prefs: Record<string, boolean>, { dispatch, rejectWithValue }) => {
    try {
      await updateNotificationsApi(prefs);
      dispatch(api.util.invalidateTags(['Settings']));
      return prefs;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update notifications'); }
  }
);

export const removeAccount = createAsyncThunk(
  'settings/deleteAccount',
  async (_, { rejectWithValue }) => {
    try { await deleteAccountApi(); }
    catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to delete account'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    toggleNotification(state, { payload }: { payload: string }) {
      const n = state.notifications.find(n => n.key === payload);
      if (n) n.on = !n.on;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(saveProfile.pending,   state => { state.saving = 'profile'; })
      .addCase(saveProfile.fulfilled, state => { state.saving = 'idle'; })
      .addCase(saveProfile.rejected,  state => { state.saving = 'idle'; });

    builder
      .addCase(saveWedding.pending,   state => { state.saving = 'wedding'; })
      .addCase(saveWedding.fulfilled, state => { state.saving = 'idle'; })
      .addCase(saveWedding.rejected,  state => { state.saving = 'idle'; });

    builder
      .addCase(saveNotifications.pending,   state => { state.saving = 'notifications'; })
      .addCase(saveNotifications.fulfilled, state => { state.saving = 'idle'; })
      .addCase(saveNotifications.rejected,  state => { state.saving = 'idle'; });

    builder.addMatcher(
      api.endpoints.getSettings.matchFulfilled,
      (state, { payload }) => { state.notifications = payload.notifications; }
    );
  },
});

export const { toggleNotification } = settingsSlice.actions;

// ── Selectors ─────────────────────────────────────────────

export const selectSettingsSaving  = (state: RootState) => state.settings.saving;
export const selectNotifications   = (state: RootState) => state.settings.notifications;

export default settingsSlice.reducer;
