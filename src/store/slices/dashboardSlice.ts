import { createAppAsyncThunk } from '../thunk';
import { api } from '../api';
import { PATH } from '@/constants/path';

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
    dispatch(api.util.updateQueryData('getDashboard', undefined, draft => {
      const t = draft.tasks.find(t => t._id === taskId);
      if (t) {
        t.done = !t.done;
        if (draft.stats) draft.stats.tasksDone += t.done ? 1 : -1;
      }
    }));
  }
);
