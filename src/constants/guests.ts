export const RSVP_META: Record<string, {
  label: string; badge: string; dot: string; stripe: string; row: string;
}> = {
  confirmed: {
    label:  'Confirmed',
    badge:  'bg-gold/15 text-dark dark:text-gold border border-gold/40',
    dot:    'bg-gold',
    stripe: 'border-l-gold',
    row:    '',
  },
  pending: {
    label:  'Pending',
    badge:  'bg-blush/20 text-dark dark:text-blush border border-blush/40',
    dot:    'bg-blush pulse-dot',
    stripe: 'border-l-blush',
    row:    '',
  },
  declined: {
    label:  'Declined',
    badge:  'bg-silver/60 text-zinc-400 border border-silver',
    dot:    'bg-silver',
    stripe: 'border-l-transparent',
    row:    'opacity-60',
  },
};

export const AVATAR_COLORS = [
  'bg-gold text-dark',
  'bg-dark text-gold',
  'bg-blush text-dark',
  'bg-silver text-dark',
];
