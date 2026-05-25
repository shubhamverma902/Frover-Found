interface EventsSummaryStripProps {
  total: number;
  confirmed: number;
  inPlanning: number;
}

export const EventsSummaryStrip = ({ total, confirmed, inPlanning }: EventsSummaryStripProps) => (
  <div className="grid grid-cols-3 gap-3 stagger-children">
    {[
      { label: 'Total',       value: total,      color: 'from-silver/20 to-transparent', border: 'border-b-silver' },
      { label: 'Confirmed',   value: confirmed,   color: 'from-gold/10 to-transparent',  border: 'border-b-gold' },
      { label: 'In Planning', value: inPlanning,  color: 'from-blush/10 to-transparent',  border: 'border-b-blush' },
    ].map(({ label, value, color, border }) => (
      <div key={label} className={`stat-card bg-card border border-silver dark:border-[#2a2f33] border-b-2 ${border} px-4 py-4 text-center bg-gradient-to-b ${color} lift`}>
        <p className="text-3xl font-black text-dark dark:text-white num-pop">{value}</p>
        <p className="text-[10px] text-zinc-400 dark:text-silver/50 uppercase tracking-widest mt-1">{label}</p>
      </div>
    ))}
  </div>
);
