import type { WeddingEvent } from '@/types/event';

export const STATUS_META: Record<string, {
  label: string; dot: string; badge: string; bar: string; stripe: string; glow: string; gradFrom: string; gradOrb: string;
}> = {
  confirmed: {
    label:    'Confirmed',
    dot:      'bg-gold pulse-dot',
    badge:    'bg-gold/15 text-gold border border-gold/40',
    bar:      'bg-gradient-to-r from-gold to-blush',
    stripe:   'border-l-gold',
    glow:     'shadow-[0_0_18px_rgba(205,180,219,0.15)]',
    gradFrom: 'from-gold/8',
    gradOrb:  'bg-[radial-gradient(circle,rgba(205,180,219,0.18)_0%,transparent_70%)]',
  },
  planning: {
    label:    'Planning',
    dot:      'bg-blush pulse-dot',
    badge:    'bg-blush/20 text-blush border border-blush/40',
    bar:      'bg-blush',
    stripe:   'border-l-blush',
    glow:     '',
    gradFrom: 'from-blush/8',
    gradOrb:  'bg-[radial-gradient(circle,rgba(216,167,177,0.18)_0%,transparent_70%)]',
  },
  pending: {
    label:    'Pending',
    dot:      'bg-silver',
    badge:    'bg-silver/15 text-silver border border-silver/40',
    bar:      'bg-silver/60',
    stripe:   'border-l-silver/60',
    glow:     '',
    gradFrom: 'from-silver/5',
    gradOrb:  'bg-[radial-gradient(circle,rgba(159,134,160,0.10)_0%,transparent_70%)]',
  },
};

export const STATUS_OPTIONS: { value: WeddingEvent['status']; label: string; dot: string }[] = [
  { value: 'pending',   label: 'Pending',   dot: 'bg-silver' },
  { value: 'planning',  label: 'Planning',  dot: 'bg-blush' },
  { value: 'confirmed', label: 'Confirmed', dot: 'bg-gold' },
];
