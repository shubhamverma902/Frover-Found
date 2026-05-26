interface ResponseRateBarProps {
  responsePct: number;
  confirmed: number;
  declined: number;
  pending: number;
}

export const ResponseRateBar = ({ responsePct, confirmed, declined, pending }: ResponseRateBarProps) => (
  <div className="bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 px-6 py-4">
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-silver/50 uppercase tracking-widest">Response Rate</p>
        <p className="text-lg font-black text-dark dark:text-white">{responsePct}%</p>
      </div>
      <div className="flex-1">
        <div className="relative h-3 bg-silver/30 dark:bg-silver/10 rounded-full overflow-hidden mb-1.5">
          <div className="absolute inset-0"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(159,134,160,0.5) 9px, rgba(159,134,160,0.5) 10px)' }}
          />
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-gold to-blush bar-animate"
            style={{ width: `${responsePct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-gold inline-block" />{confirmed} confirmed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blush inline-block" />{declined} declined</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-silver inline-block" />{pending} pending</span>
        </div>
      </div>
    </div>
  </div>
);
