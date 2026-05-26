import { ProgressRing } from '@/components/ui';

interface ChecklistHeaderProps {
  doneCount:  number;
  totalCount: number;
  progress:   number;
  exporting?: boolean;
  onAddTask:  () => void;
  onExport?:  () => void;
}

export const ChecklistHeader = ({ doneCount, totalCount, progress, exporting, onAddTask, onExport }: ChecklistHeaderProps) => (
  <div className="rounded-2xl overflow-hidden glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-gold/25 text-[10px] z-10">◆</span>
    <span className="absolute top-2 right-2 text-gold/25 text-[10px] z-10">◆</span>
    <div className="bg-card dark:bg-[#2A1F52] rounded-2xl border border-blush/20 dark:border-gold/20 px-6 py-5 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blush dark:bg-gold pulse-dot" />
            <p className="text-[10px] font-bold text-blush dark:text-gold uppercase tracking-[0.4em]">Planning</p>
          </div>
          <h1 className="text-xl font-bold text-dark dark:text-white">Checklist</h1>
          <p className="text-xs text-silver dark:text-silver/70 mt-1">{doneCount} of {totalCount} tasks complete</p>
        </div>

        <div className="flex items-center gap-5">
          {/* Progress ring */}
          <div className="relative w-20 h-20 shrink-0">
            <div className="absolute inset-0 rounded-full border border-gold/10" />
            <ProgressRing
              pct={progress}
              viewSize={64} radius={26} strokeWidth={5}
              trackColor="rgba(159,134,160,0.08)"
              gradientId="checklistGrad"
              gradientStops={[
                { offset: '0%',   color: '#E4BC62' },
                { offset: '100%', color: '#DFB3AE' },
              ]}
              duration="1.2s"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-blush dark:text-gold leading-none">{progress}%</span>
              <span className="text-[9px] text-silver/50 dark:text-silver/60 mt-0.5">done</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-blush dark:bg-gold shrink-0" />
              <span className="text-xs text-silver dark:text-silver/60">{doneCount} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-silver/30 shrink-0" />
              <span className="text-xs text-silver/60 dark:text-silver/40">{totalCount - doneCount} remaining</span>
            </div>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-2">
            {onExport && (
              <button
                onClick={onExport}
                disabled={exporting}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-blush/30 dark:border-gold/25 text-blush dark:text-gold/65 hover:border-blush dark:hover:border-gold/50 hover:text-blush dark:hover:text-gold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {exporting ? 'Exporting…' : '↓ PDF'}
              </button>
            )}
            <button
              onClick={onAddTask}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-blush text-white hover:bg-blush/90 transition-all hover:shadow-[0_4px_16px_rgba(216,167,177,0.45)]"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div className="mt-5 relative">
        <div className="h-1.5 bg-silver/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-blush rounded-full bar-animate relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 inset-y-0 w-3 bg-white/25 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
