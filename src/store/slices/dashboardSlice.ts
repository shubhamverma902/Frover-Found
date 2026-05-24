import { createAppAsyncThunk } from '../thunk';
import { api } from '../api';
import { PATH } from '@/constants/path';
import { toggleTaskApi } from '@/api/checklist.api';

// ── Static data ───────────────────────────────────────────

export const DASHBOARD_ACTIONS = [
  { icon: '✅', label: 'Checklist',   desc: 'Tasks & milestones',             href: PATH.dashboard.checklist },
  { icon: '💰', label: 'Budget',      desc: 'Track spending & allocations',   href: PATH.dashboard.budget    },
  { icon: '👥', label: 'Guests',      desc: 'Manage RSVPs & invitations',     href: PATH.dashboard.guests    },
  { icon: '🎪', label: 'Events',      desc: 'Sangeet, mehendi & more',        href: PATH.dashboard.events    },
  { icon: '🤝', label: 'Vendors',     desc: 'Photographers, caterers & more', href: PATH.dashboard.vendors   },
  { icon: '⚙️', label: 'Settings',   desc: 'Profile & preferences',          href: PATH.dashboard.settings  },
];

// ── Thunks ────────────────────────────────────────────────

export const toggleDashboardTask = createAppAsyncThunk(
  'dashboard/toggleTask',
  async (taskId: string, { dispatch }) => {
    // Optimistic update so the UI responds immediately
    const patch = dispatch(api.util.updateQueryData('getDashboard', undefined, draft => {
      const t = draft.tasks.find(t => t._id === taskId);
      if (t) {
        t.done = !t.done;
        if (draft.stats) draft.stats.tasksDone += t.done ? 1 : -1;
      }
    }));
    try {
      await toggleTaskApi(taskId);
      // Bust both caches so checklist page and insights page reflect the change
      dispatch(api.util.invalidateTags(['Checklist']));
    } catch {
      patch.undo();
    }
  }
);
