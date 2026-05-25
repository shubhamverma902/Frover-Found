export const STATUS_META: Record<string, {
  label: string; badge: string; bar: string; dot: string; stripe: string;
}> = {
  booked: {
    label:  'Booked',
    badge:  'bg-gold/15 text-dark dark:text-gold border border-gold/40',
    bar:    'bg-gradient-to-r from-gold to-blush',
    dot:    'bg-gold',
    stripe: 'border-l-gold',
  },
  shortlisted: {
    label:  'Shortlisted',
    badge:  'bg-blush/20 text-dark dark:text-blush border border-blush/40',
    bar:    'bg-blush',
    dot:    'bg-blush pulse-dot',
    stripe: 'border-l-blush',
  },
  pending: {
    label:  'Pending',
    badge:  'bg-silver/60 text-zinc-500 border border-silver',
    bar:    'bg-silver',
    dot:    'bg-silver',
    stripe: 'border-l-transparent',
  },
};
