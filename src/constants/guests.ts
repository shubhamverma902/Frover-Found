export const RSVP_META: Record<string, {
  label: string; badge: string; dot: string; stripe: string; row: string;
}> = {
  confirmed: {
    label:  'Confirmed',
    badge:  'bg-[#E4BC62]/15 text-[#23292E] dark:text-[#E4BC62] border border-[#E4BC62]/40',
    dot:    'bg-[#E4BC62]',
    stripe: 'border-l-[#E4BC62]',
    row:    '',
  },
  pending: {
    label:  'Pending',
    badge:  'bg-[#DFB3AE]/20 text-[#23292E] dark:text-[#DFB3AE] border border-[#DFB3AE]/40',
    dot:    'bg-[#DFB3AE] pulse-dot',
    stripe: 'border-l-[#DFB3AE]',
    row:    '',
  },
  declined: {
    label:  'Declined',
    badge:  'bg-[#DDDED9]/60 text-zinc-400 border border-[#DDDED9]',
    dot:    'bg-[#DDDED9]',
    stripe: 'border-l-transparent',
    row:    'opacity-60',
  },
};

export const AVATAR_COLORS = [
  'bg-[#E4BC62] text-[#23292E]',
  'bg-[#23292E] text-[#E4BC62]',
  'bg-[#DFB3AE] text-[#23292E]',
  'bg-[#DDDED9] text-[#23292E]',
];
