export const ONBOARDING_KEY = 'forever_found_onboarding_done';
export const ONBOARDING_PROFILE_KEY = 'forever_found_profile';

export interface EventType {
  id:    string;
  label: string;
  icon:  string;
}

export interface BudgetRange {
  value: string;
  label: string;
}

export interface WeddingStyle {
  value: string;
  label: string;
}

export const EVENT_TYPES: EventType[] = [
  { id: 'mehendi',   label: 'Mehendi',   icon: '🌿' },
  { id: 'haldi',     label: 'Haldi',     icon: '💛' },
  { id: 'sangeet',   label: 'Sangeet',   icon: '🎶' },
  { id: 'wedding',   label: 'Wedding',   icon: '💍' },
  { id: 'reception', label: 'Reception', icon: '🥂' },
  { id: 'tilak',     label: 'Tilak',     icon: '🪔' },
];

export const BUDGET_RANGES: BudgetRange[] = [
  { value: 'under_5l',  label: 'Under ₹5 Lakh'  },
  { value: '5l_15l',    label: '₹5 L – ₹15 L'   },
  { value: '15l_30l',   label: '₹15 L – ₹30 L'  },
  { value: '30l_50l',   label: '₹30 L – ₹50 L'  },
  { value: 'above_50l', label: 'Above ₹50 Lakh'  },
];

export const WEDDING_STYLES: WeddingStyle[] = [
  { value: 'traditional', label: 'Traditional'   },
  { value: 'royal',       label: 'Royal / Grand'  },
  { value: 'modern',      label: 'Modern Minimal' },
  { value: 'destination', label: 'Destination'    },
  { value: 'fusion',      label: 'Fusion'         },
];
