interface GuestStatCardsProps {
  total: number;
  confirmed: number;
  pending: number;
  declined: number;
}

export const GuestStatCards = ({ total, confirmed, pending, declined }: GuestStatCardsProps) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
    {[
      { label: 'Total Invited', value: total,     note: 'all guests',                                                  border: 'border-b-silver', val: 'text-dark dark:text-white' },
      { label: 'Confirmed',     value: confirmed,  note: total > 0 ? `${Math.round(confirmed / total * 100)}% of list` : '—', border: 'border-b-gold', val: 'text-gold'              },
      { label: 'Pending',       value: pending,    note: 'awaiting RSVP',                                               border: 'border-b-blush', val: 'text-blush'             },
      { label: 'Declined',      value: declined,   note: 'cannot attend',                                               border: 'border-b-silver', val: 'text-zinc-400'               },
    ].map(({ label, value, note, border, val }) => (
      <div key={label} className={`stat-card bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 border-b-2 ${border} px-5 py-5 lift-deep`}>
        <p className={`text-3xl font-black num-pop ${val}`}>{value}</p>
        <p className="text-xs font-bold text-dark dark:text-white mt-2">{label}</p>
        <p className="text-[10px] text-zinc-400 dark:text-silver/50 mt-0.5">{note}</p>
      </div>
    ))}
  </div>
);
