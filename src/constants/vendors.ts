export const STATUS_META: Record<string, {
  label: string; badge: string; bar: string; dot: string; stripe: string;
}> = {
  booked: {
    label:  'Booked',
    badge:  'bg-[#E4BC62]/15 text-[#23292E] dark:text-[#E4BC62] border border-[#E4BC62]/40',
    bar:    'bg-gradient-to-r from-[#E4BC62] to-[#DFB3AE]',
    dot:    'bg-[#E4BC62]',
    stripe: 'border-l-[#E4BC62]',
  },
  shortlisted: {
    label:  'Shortlisted',
    badge:  'bg-[#DFB3AE]/20 text-[#23292E] dark:text-[#DFB3AE] border border-[#DFB3AE]/40',
    bar:    'bg-[#DFB3AE]',
    dot:    'bg-[#DFB3AE] pulse-dot',
    stripe: 'border-l-[#DFB3AE]',
  },
  pending: {
    label:  'Pending',
    badge:  'bg-[#DDDED9]/60 text-zinc-500 border border-[#DDDED9]',
    bar:    'bg-[#DDDED9]',
    dot:    'bg-[#DDDED9]',
    stripe: 'border-l-transparent',
  },
};
