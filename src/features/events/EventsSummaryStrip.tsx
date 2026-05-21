interface EventsSummaryStripProps {
  total: number;
  confirmed: number;
  inPlanning: number;
}

export const EventsSummaryStrip = ({ total, confirmed, inPlanning }: EventsSummaryStripProps) => (
  <div className="grid grid-cols-3 gap-3 stagger-children">
    {[
      { label: 'Total',       value: total,      color: 'from-[#DDDED9]/20 to-transparent', border: 'border-b-[#DDDED9]' },
      { label: 'Confirmed',   value: confirmed,   color: 'from-[#E4BC62]/10 to-transparent',  border: 'border-b-[#E4BC62]' },
      { label: 'In Planning', value: inPlanning,  color: 'from-[#DFB3AE]/10 to-transparent',  border: 'border-b-[#DFB3AE]' },
    ].map(({ label, value, color, border }) => (
      <div key={label} className={`stat-card bg-card border border-[#DDDED9] dark:border-[#2a2f33] border-b-2 ${border} px-4 py-4 text-center bg-gradient-to-b ${color} lift`}>
        <p className="text-3xl font-black text-[#23292E] dark:text-white num-pop">{value}</p>
        <p className="text-[10px] text-zinc-400 dark:text-[#DDDED9]/50 uppercase tracking-widest mt-1">{label}</p>
      </div>
    ))}
  </div>
);
