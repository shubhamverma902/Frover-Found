import { ProgressRing } from '@/components/ui';
import { fmt } from '@/utils/format';

interface UtilisationBarProps {
  totalPct: number;
  spent: number;
  total: number;
  remaining: number;
}

export const UtilisationBar = ({ totalPct, spent, total, remaining }: UtilisationBarProps) => (
  <div className="bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden">
    <div className="flex items-center gap-6 px-6 py-5">
      <div className="relative w-16 h-16 shrink-0">
        <ProgressRing
          pct={totalPct}
          viewSize={56} radius={22} strokeWidth={5}
          trackColor="rgba(159,134,160,0.4)"
          gradientId="budgetGrad"
          gradientStops={[
            { offset: '0%',   color: '#23292E' },
            { offset: '60%',  color: '#E4BC62' },
            { offset: '100%', color: '#DFB3AE' },
          ]}
          duration="1.4s"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[12px] font-black text-dark dark:text-white">{totalPct}%</span>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-2.5">
          <p className="text-xs font-bold text-dark dark:text-white uppercase tracking-widest">Overall Utilisation</p>
          <p className="text-xs font-black text-gold">
            {fmt(spent)} <span className="text-zinc-400 dark:text-silver/50 font-normal">of</span> {fmt(total)}
          </p>
        </div>
        <div className="relative h-3 bg-silver/30 dark:bg-silver/10 rounded-full overflow-hidden">
          <div className="absolute inset-0"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(159,134,160,0.5) 11px, rgba(159,134,160,0.5) 12px)' }}
          />
          <div
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-dark via-gold to-blush bar-animate"
            style={{ width: `${totalPct}%` }}
          >
            <div className="absolute right-0 inset-y-0 w-4 bg-white/20" />
          </div>
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-silver/50 mt-1.5 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-silver/50 inline-block" />
          {fmt(remaining)} remaining
        </p>
      </div>
    </div>
  </div>
);
