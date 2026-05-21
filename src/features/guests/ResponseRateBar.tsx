interface ResponseRateBarProps {
  responsePct: number;
  confirmed: number;
  declined: number;
  pending: number;
}

export const ResponseRateBar = ({ responsePct, confirmed, declined, pending }: ResponseRateBarProps) => (
  <div className="bg-card border border-[#DDDED9] dark:border-[#2a2f33] px-6 py-4 shadow-crystal">
    <div className="flex items-center gap-4">
      <div className="shrink-0">
        <p className="text-[10px] font-bold text-zinc-400 dark:text-[#DDDED9]/50 uppercase tracking-widest">Response Rate</p>
        <p className="text-lg font-black text-[#23292E] dark:text-white">{responsePct}%</p>
      </div>
      <div className="flex-1">
        <div className="relative h-3 bg-[#DDDED9]/30 dark:bg-[#DDDED9]/10 overflow-hidden mb-1.5">
          <div className="absolute inset-0"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 9px, rgba(221,222,217,0.5) 9px, rgba(221,222,217,0.5) 10px)' }}
          />
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#E4BC62] to-[#DFB3AE] bar-animate"
            style={{ width: `${responsePct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-[10px]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#E4BC62] inline-block" />{confirmed} confirmed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#DFB3AE] inline-block" />{declined} declined</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#DDDED9] inline-block" />{pending} pending</span>
        </div>
      </div>
    </div>
  </div>
);
