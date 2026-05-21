import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { fetchNotificationsApi, markAllReadApi } from '@/api/notifications.api';
import type { AppNotification } from '@/api/notifications.api';

interface NotificationsState {
  items:       AppNotification[];
  unreadCount: number;
  status:      'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: NotificationsState = {
  items:       [],
  unreadCount: 0,
  status:      'idle',
};

// ── Thunks ────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'notifications/fetch',
  async (_, { rejectWithValue }) => {
    try { return await fetchNotificationsApi(); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load notifications'); }
  }
);

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try { await markAllReadApi(); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to mark read'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    prependNotification(state, { payload }: { payload: AppNotification }) {
      state.items       = [payload, ...state.items].slice(0, 20);
      state.unreadCount += 1;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchNotifications.pending,   state => { state.status = 'loading'; })
      .addCase(fetchNotifications.fulfilled, (state, { payload }) => {
        state.status      = 'succeeded';
        state.items       = payload.notifications;
        state.unreadCount = payload.unreadCount;
      })
      .addCase(fetchNotifications.rejected,  state => { state.status = 'failed'; });

    builder
      .addCase(markAllRead.fulfilled, state => {
        state.unreadCount = 0;
        state.items       = state.items.map(n => ({ ...n, read: true }));
      });
  },
});

export const { prependNotification } = notificationsSlice.actions;

// ── Selectors ─────────────────────────────────────────────

export const selectNotifications       = (state: RootState) => state.notifications.items;
export const selectUnreadCount         = (state: RootState) => state.notifications.unreadCount;
export const selectNotificationsStatus = (state: RootState) => state.notifications.status;

export default notificationsSlice.reducer;
