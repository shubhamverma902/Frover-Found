// ── Types ────────────────────────────────────────────────

export interface AuthPanelStat {
  value: string;
  label: string;
}

export interface AuthPanelImage {
  src: string;
  alt: string;
}

// ── Auth hub — Indian couple under floral ceiling ─────────

export const AUTH_PANEL_IMAGE: AuthPanelImage = {
  src: '/images/weddings/grand-floral.jpg',
  alt: 'Indian bride and groom under stunning gold and white floral ceiling',
};

export const AUTH_PANEL_STATS: AuthPanelStat[] = [
  { value: '500+',  label: 'Weddings' },
  { value: '50+',   label: 'Cities' },
  { value: '2000+', label: 'Couples' },
];

// ── Login page — traditional garb couple ─────────────────

export const LOGIN_PANEL_IMAGE: AuthPanelImage = {
  src: '/images/weddings/traditional-garb.jpg',
  alt: 'Indian couple in traditional wedding garb',
};

export const LOGIN_PANEL_TESTIMONIAL = {
  quote: 'Forever Found made our wedding in Amritsar absolutely flawless. Every tradition was honoured perfectly!',
  author: 'Gurpreet & Harjeet Singh',
};

// ── Signup page — bride and groom facing each other ───────

export const SIGNUP_PANEL_IMAGE: AuthPanelImage = {
  src: '/images/weddings/couple-facing.jpg',
  alt: 'Indian bride and groom facing each other at their wedding ceremony',
};

export const SIGNUP_FEATURES: string[] = [
  '💍 Personal wedding planning dashboard',
  '🌸 Access to 500+ verified vendors',
  '📅 Smart event timeline & checklists',
  '📸 Photography coordination included',
];
