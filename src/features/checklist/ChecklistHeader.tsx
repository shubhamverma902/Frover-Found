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
  <div className="bg-[#23292E] p-[3px] glow-gold-strong relative">
    <span className="absolute top-2 left-2 text-[#E4BC62]/25 text-[10px]">◆</span>
    <span className="absolute top-2 right-2 text-[#E4BC62]/25 text-[10px]">◆</span>
    <div className="border border-[#E4BC62]/20 px-6 py-5 relative overflow-hidden">
      <div className="absolute inset-0 shimmer pointer-events-none" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E4BC62] pulse-dot" />
            <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em]">Planning</p>
          </div>
          <h1 className="text-xl font-bold text-white">Checklist</h1>
          <p className="text-xs text-[#DDDED9]/50 mt-1">{doneCount} of {totalCount} tasks complete</p>
        </div>

        <div className="flex items-center gap-5">
          {/* Progress ring */}
          <div className="relative w-20 h-20 shrink-0">
            <div className="absolute inset-0 rounded-full border border-[#E4BC62]/10" />
            <ProgressRing
              pct={progress}
              viewSize={64} radius={26} strokeWidth={5}
              trackColor="rgba(221,222,217,0.08)"
              gradientId="checklistGrad"
              gradientStops={[
                { offset: '0%',   color: '#E4BC62' },
                { offset: '100%', color: '#DFB3AE' },
              ]}
              duration="1.2s"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-sm font-black text-[#E4BC62] leading-none">{progress}%</span>
              <span className="text-[9px] text-[#DDDED9]/30 mt-0.5">done</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E4BC62] shrink-0" />
              <span className="text-xs text-[#DDDED9]/60">{doneCount} completed</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#DDDED9]/30 shrink-0" />
              <span className="text-xs text-[#DDDED9]/40">{totalCount - doneCount} remaining</span>
            </div>
          </div>

          <div className="self-start sm:self-auto flex items-center gap-2">
            {onExport && (
              <button
                onClick={onExport}
                disabled={exporting}
                className="px-4 py-2.5 text-xs font-bold border border-[#E4BC62]/25 text-[#E4BC62]/65 hover:border-[#E4BC62]/50 hover:text-[#E4BC62] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {exporting ? 'Exporting…' : '↓ PDF'}
              </button>
            )}
            <button
              onClick={onAddTask}
              className="px-5 py-2.5 text-xs font-bold bg-[#E4BC62] text-[#23292E] hover:bg-[#E4BC62]/85 transition-all hover:shadow-[0_4px_16px_rgba(228,188,98,0.45)]"
            >
              + Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div className="mt-5 relative">
        <div className="h-1.5 bg-[#DDDED9]/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#E4BC62] to-[#DFB3AE] rounded-full bar-animate relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 inset-y-0 w-3 bg-white/25 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);
