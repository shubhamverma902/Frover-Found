import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import {
  fetchSettingsApi,
  updateProfileApi,
  updateWeddingApi,
  updateNotificationsApi,
  deleteAccountApi,
  type NotificationPref,
  type ProfileData,
  type WeddingData,
} from '@/api/settings.api';

// ── State ─────────────────────────────────────────────────

interface SettingsState {
  profile:       ProfileData | null;
  wedding:       WeddingData | null;
  notifications: NotificationPref[];
  status:        'idle' | 'loading' | 'succeeded' | 'failed';
  saving:        'idle' | 'profile' | 'wedding' | 'notifications';
  error:         string | null;
}

const initialState: SettingsState = {
  profile:       null,
  wedding:       null,
  notifications: [],
  status:        'idle',
  saving:        'idle',
  error:         null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchSettings = createAsyncThunk(
  'settings/fetch',
  async (_, { rejectWithValue, signal }) => {
    try { return await fetchSettingsApi(signal); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load settings'); }
  }
);

export const saveProfile = createAsyncThunk(
  'settings/saveProfile',
  async (payload: ProfileData, { rejectWithValue }) => {
    try { return await updateProfileApi(payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update profile'); }
  }
);

export const saveWedding = createAsyncThunk(
  'settings/saveWedding',
  async (payload: WeddingData, { rejectWithValue }) => {
    try { return await updateWeddingApi(payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update wedding details'); }
  }
);

export const saveNotifications = createAsyncThunk(
  'settings/saveNotifications',
  async (prefs: Record<string, boolean>, { rejectWithValue }) => {
    try { await updateNotificationsApi(prefs); return prefs; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update notifications'); }
  }
);

export const removeAccount = createAsyncThunk(
  'settings/deleteAccount',
  async (_, { rejectWithValue }) => {
    try { await deleteAccountApi(); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to delete account'); }
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
      .addCase(fetchSettings.pending,   state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, { payload }) => {
        state.status        = 'succeeded';
        state.profile       = payload.profile;
        state.wedding       = payload.wedding;
        state.notifications = payload.notifications;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed'; state.error = action.payload as string;
      });

    builder
      .addCase(saveProfile.pending,   state => { state.saving = 'profile'; })
      .addCase(saveProfile.fulfilled, (state, { payload }) => { state.saving = 'idle'; state.profile = payload; })
      .addCase(saveProfile.rejected,  state => { state.saving = 'idle'; });

    builder
      .addCase(saveWedding.pending,   state => { state.saving = 'wedding'; })
      .addCase(saveWedding.fulfilled, (state, { payload }) => { state.saving = 'idle'; state.wedding = payload; })
      .addCase(saveWedding.rejected,  state => { state.saving = 'idle'; });

    builder
      .addCase(saveNotifications.pending,   state => { state.saving = 'notifications'; })
      .addCase(saveNotifications.fulfilled, state => { state.saving = 'idle'; })
      .addCase(saveNotifications.rejected,  state => { state.saving = 'idle'; });
  },
});

export const { toggleNotification } = settingsSlice.actions;

// ── Selectors ─────────────────────────────────────────────

export const selectSettingsStatus    = (state: RootState) => state.settings.status;
export const selectSettingsSaving    = (state: RootState) => state.settings.saving;
export const selectSettingsProfile   = (state: RootState) => state.settings.profile;
export const selectSettingsWedding   = (state: RootState) => state.settings.wedding;
export const selectNotifications     = (state: RootState) => state.settings.notifications;

export default settingsSlice.reducer;
