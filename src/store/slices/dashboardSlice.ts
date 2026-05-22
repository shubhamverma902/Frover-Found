import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import { fetchDashboardApi } from '@/api/dashboard.api';
import type { DashboardUserData, DashboardStatsData, DashboardTask, DashboardActivity } from '@/api/dashboard.api';
import { PATH } from '@/constants/path';

// ── Static data ───────────────────────────────────────────

export const DASHBOARD_ACTIONS = [
  { icon: '✅', label: 'Checklist',   desc: 'Tasks & milestones',           href: PATH.dashboard.checklist },
  { icon: '💰', label: 'Budget',      desc: 'Track spending & allocations', href: PATH.dashboard.budget    },
  { icon: '👥', label: 'Guests',      desc: 'Manage RSVPs & invitations',   href: PATH.dashboard.guests    },
  { icon: '🎪', label: 'Events',      desc: 'Sangeet, mehendi & more',      href: PATH.dashboard.events    },
  { icon: '🤝', label: 'Vendors',     desc: 'Photographers, caterers & more', href: PATH.dashboard.vendors },
  { icon: '⚙️', label: 'Settings',   desc: 'Profile & preferences',        href: PATH.dashboard.settings  },
];

// ── State ─────────────────────────────────────────────────

interface DashboardState {
  user:     DashboardUserData | null;
  stats:    DashboardStatsData | null;
  tasks:    DashboardTask[];
  activity: DashboardActivity[];
  status:   'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: DashboardState = {
  user:     null,
  stats:    null,
  tasks:    [],
  activity: [],
  status:   'idle',
};

// ── Thunk ─────────────────────────────────────────────────

export const fetchDashboard = createAsyncThunk(
  'dashboard/fetch',
  async (_, { rejectWithValue, signal }) => {
    try { return await fetchDashboardApi(signal); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load dashboard'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // optimistic task toggle for the dashboard task list
    toggleDashboardTask(state, { payload }: { payload: string }) {
      const t = state.tasks.find(t => t._id === payload);
      if (t) {
        t.done = !t.done;
        if (state.stats) state.stats.tasksDone += t.done ? 1 : -1;
      }
    },
    // refresh activity after mutations
    prependActivity(state, { payload }: { payload: DashboardActivity }) {
      state.activity = [payload, ...state.activity].slice(0, 8);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchDashboard.pending,   state => { state.status = 'loading'; })
      .addCase(fetchDashboard.fulfilled, (state, { payload }) => {
        state.status   = 'succeeded';
        state.user     = payload.user;
        state.stats    = payload.stats;
        state.tasks    = payload.tasks;
        state.activity = payload.activity;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed';
      });
  },
});

export const { toggleDashboardTask, prependActivity } = dashboardSlice.actions;

// ── Selectors ─────────────────────────────────────────────

export const selectDashboardUser     = (state: RootState) => state.dashboard.user;
export const selectDashboardStats    = (state: RootState) => state.dashboard.stats;
export const selectDashboardTasks    = (state: RootState) => state.dashboard.tasks;
export const selectDashboardActivity = (state: RootState) => state.dashboard.activity;
export const selectDashboardActions  = () => DASHBOARD_ACTIONS;
export const selectDashboardStatus   = (state: RootState) => state.dashboard.status;

export default dashboardSlice.reducer;
