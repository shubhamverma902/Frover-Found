// sessionStorage key used to carry an invite token across the login/signup redirect.
// Flow: unauthenticated user lands on /accept-invite → token saved here → redirected to
// login or signup → after auth the token is read, removed, and used to resume the invite.
// sessionStorage is intentional: survives same-tab navigation, cleared on tab close, and
// never appears in the URL bar or server access logs the way a query param would.
export const PENDING_INVITE_TOKEN_KEY = 'pendingInviteToken';

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
