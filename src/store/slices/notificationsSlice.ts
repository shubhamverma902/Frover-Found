import { createAppAsyncThunk } from '../thunk';
import type { AxiosError } from 'axios';
import { markAllReadApi } from '@/api/notifications.api';
import { api } from '../api';

type ApiErr = AxiosError<{ message?: string }>;

// ── Thunks ────────────────────────────────────────────────

export const markAllRead = createAppAsyncThunk(
  'notifications/markAllRead',
  async (_, { dispatch, rejectWithValue }) => {
    const patch = dispatch(api.util.updateQueryData('getNotifications', undefined, draft => {
      let changed = 0;
      draft.notifications.forEach(n => { if (!n.read) { n.read = true; changed++; } });
      draft.unreadCount = Math.max(0, draft.unreadCount - changed);
    }));
    try {
      await markAllReadApi();
      dispatch(api.util.invalidateTags(['Notifications']));
    } catch (e) {
      patch.undo();
      return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to mark read');
    }
  }
);
