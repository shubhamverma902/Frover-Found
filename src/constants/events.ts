import type { WeddingEvent } from './dashboard-pages';

export const STATUS_META: Record<string, {
  label: string; dot: string; badge: string; bar: string; stripe: string; glow: string; gradFrom: string; gradOrb: string;
}> = {
  confirmed: {
    label:    'Confirmed',
    dot:      'bg-[#E4BC62] pulse-dot',
    badge:    'bg-[#E4BC62]/15 text-[#23292E] dark:text-[#E4BC62] border border-[#E4BC62]/40',
    bar:      'bg-gradient-to-r from-[#E4BC62] to-[#DFB3AE]',
    stripe:   'border-l-[#E4BC62]',
    glow:     'shadow-[0_0_18px_rgba(228,188,98,0.15)]',
    gradFrom: 'from-[#E4BC62]/8',
    gradOrb:  'bg-[radial-gradient(circle,rgba(228,188,98,0.18)_0%,transparent_70%)]',
  },
  planning: {
    label:    'Planning',
    dot:      'bg-[#DFB3AE] pulse-dot',
    badge:    'bg-[#DFB3AE]/20 text-[#23292E] dark:text-[#DFB3AE] border border-[#DFB3AE]/40',
    bar:      'bg-[#DFB3AE]',
    stripe:   'border-l-[#DFB3AE]',
    glow:     '',
    gradFrom: 'from-[#DFB3AE]/8',
    gradOrb:  'bg-[radial-gradient(circle,rgba(223,179,174,0.18)_0%,transparent_70%)]',
  },
  pending: {
    label:    'Pending',
    dot:      'bg-[#DDDED9]',
    badge:    'bg-[#DDDED9]/15 text-[#DDDED9] border border-[#DDDED9]/40',
    bar:      'bg-[#DDDED9]/60',
    stripe:   'border-l-[#DDDED9]/60',
    glow:     '',
    gradFrom: 'from-[#DDDED9]/5',
    gradOrb:  'bg-[radial-gradient(circle,rgba(221,222,217,0.10)_0%,transparent_70%)]',
  },
};

export const STATUS_OPTIONS: { value: WeddingEvent['status']; label: string; dot: string }[] = [
  { value: 'pending',   label: 'Pending',   dot: 'bg-[#DDDED9]' },
  { value: 'planning',  label: 'Planning',  dot: 'bg-[#DFB3AE]' },
  { value: 'confirmed', label: 'Confirmed', dot: 'bg-[#E4BC62]' },
];
