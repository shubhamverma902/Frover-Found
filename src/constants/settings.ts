export interface PlanFeature {
  feature: string;
  free:    boolean;
}

// ── Free vs Premium plan features ────────────────────────

export const PLAN_FEATURES: PlanFeature[] = [
  { feature: 'Unlimited vendors',     free: false },
  { feature: 'Budget analytics',      free: false },
  { feature: 'Priority support',      free: false },
  { feature: 'Dashboard & checklist', free: true  },
  { feature: 'Guest list (up to 50)', free: true  },
  { feature: '5 events',              free: true  },
];
