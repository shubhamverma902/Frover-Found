interface GuestStatCardsProps {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

export const GuestStatCards = ({ total, confirmed, pending, declined }: GuestStatCardsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
    {[
      { label: 'Total Invited', value: total,     note: 'all guests',                                                  border: 'border-b-[#DDDED9]', val: 'text-[#23292E] dark:text-white' },
      { label: 'Confirmed',     value: confirmed,  note: total > 0 ? `${Math.round(confirmed / total * 100)}% of list` : '—', border: 'border-b-[#E4BC62]', val: 'text-[#E4BC62]'              },
      { label: 'Pending',       value: pending,    note: 'awaiting RSVP',                                               border: 'border-b-[#DFB3AE]', val: 'text-[#DFB3AE]'             },
      { label: 'Declined',      value: declined,   note: 'cannot attend',                                               border: 'border-b-[#DDDED9]', val: 'text-zinc-400'               },
    ].map(({ label, value, note, border, val }) => (
      <div key={label} className={`stat-card bg-card border border-[#DDDED9] dark:border-[#2a2f33] border-b-2 ${border} px-5 py-5 lift-deep shadow-crystal`}>
        <p className={`text-3xl font-black num-pop ${val}`}>{value}</p>
        <p className="text-xs font-bold text-[#23292E] dark:text-[#FDFDF8] mt-2">{label}</p>
        <p className="text-[10px] text-zinc-400 dark:text-[#DDDED9]/50 mt-0.5">{note}</p>
      </div>
    ))}
  </div>
);
