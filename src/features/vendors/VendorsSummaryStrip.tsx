import type { FC } from 'react';

interface Props {
  total: number;
  booked: number;
  shortlisted: number;
}

export const VendorsSummaryStrip: FC<Props> = ({ total, booked, shortlisted }) => (
  <div className="grid grid-cols-3 gap-3 stagger-children">
    {[
      { label: 'Total',       value: total,       border: 'border-b-silver', val: 'text-dark dark:text-white' },
      { label: 'Booked',      value: booked,      border: 'border-b-gold', val: 'text-gold' },
      { label: 'Shortlisted', value: shortlisted, border: 'border-b-blush', val: 'text-blush' },
    ].map(({ label, value, border, val }) => (
      <div key={label} className={`stat-card bg-card border border-silver dark:border-[#2a2f33] border-b-2 ${border} px-4 py-4 text-center lift shadow-crystal`}>
        <p className={`text-3xl font-black num-pop ${val}`}>{value}</p>
        <p className="text-[10px] text-zinc-400 dark:text-silver/50 uppercase tracking-widest mt-1">{label}</p>
      </div>
    ))}
  </div>
);
