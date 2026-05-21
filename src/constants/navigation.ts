import { PATH } from './path';

// ── Types ─────────────────────────────────────────────────

export interface NavItem {
  icon:  string;
  label: string;
  href:  string;
}

export interface NavGroup {
  section: string;
  items:   NavItem[];
}

// ── Sidebar nav groups ────────────────────────────────────

export const SIDEBAR_NAV: NavGroup[] = [
  {
    section: 'Overview',
    items: [
      { icon: '⊞', label: 'Dashboard',  href: PATH.dashboard.base      },
    ],
  },
  {
    section: 'Planning',
    items: [
      { icon: '◆', label: 'My Events',  href: PATH.dashboard.events    },
      { icon: '✓', label: 'Checklist',  href: PATH.dashboard.checklist },
      { icon: '₹', label: 'Budget',     href: PATH.dashboard.budget    },
      { icon: '✉', label: 'Guest List', href: PATH.dashboard.guests    },
      { icon: '◈', label: 'Vendors',    href: PATH.dashboard.vendors   },
    ],
  },
  {
    section: 'Account',
    items: [
      { icon: '◎', label: 'Settings',   href: PATH.dashboard.settings  },
      { icon: '?', label: 'Help',        href: PATH.dashboard.help      },
    ],
  },
];

// ── App header quick-nav (profile dropdown) ───────────────

export const HEADER_MENU_ITEMS: NavItem[] = [
  { icon: '⊞', label: 'Dashboard',  href: PATH.dashboard.base      },
  { icon: '◆', label: 'My Events',  href: PATH.dashboard.events    },
  { icon: '✓', label: 'Checklist',  href: PATH.dashboard.checklist },
  { icon: '₹', label: 'Budget',     href: PATH.dashboard.budget    },
  { icon: '✉', label: 'Guest List', href: PATH.dashboard.guests    },
  { icon: '◈', label: 'Vendors',    href: PATH.dashboard.vendors   },
];
