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
      draft.notifications.forEach(n => { n.read = true; });
      draft.unreadCount = 0;
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
