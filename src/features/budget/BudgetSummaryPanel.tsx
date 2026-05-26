import { PencilIcon } from '@/components/icons';
import { fmt } from '@/utils/format';

interface BudgetSummaryPanelProps {
  total: number;
  spent: number;
  remaining: number;
  totalPct: number;
  editingTotal: boolean;
  totalInput: string;
  onStartEdit: () => void;
  onInputChange: (v: string) => void;
  onCommit: () => void;
  onCancelEdit: () => void;
}

export const BudgetSummaryPanel = ({
  total, spent, remaining, totalPct,
  editingTotal, totalInput,
  onStartEdit, onInputChange, onCommit, onCancelEdit,
}: BudgetSummaryPanelProps) => (
  <div className="rounded-2xl overflow-hidden glow-gold relative">
    <div className="bg-card dark:bg-[#2A1F52] rounded-2xl border border-blush/15 dark:border-gold/12 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-blush/10 dark:divide-gold/10 overflow-hidden">

      {/* Total Budget — editable */}
      <div className="relative px-6 py-7 overflow-hidden group">
        <div className="absolute top-3 right-3 text-[10px] text-silver/20 dark:text-silver/10">◆</div>
        <p className="text-sm text-silver/50 dark:text-silver/30 mb-3">◆</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-silver dark:text-silver/65">Total Budget</p>
        {editingTotal ? (
          <div className="flex items-center gap-2">
            <span className="text-dark dark:text-white text-sm">₹</span>
            <input
              type="number"
              min={1}
              autoFocus
              className="flex-1 bg-transparent border-b border-gold/60 text-dark dark:text-white text-2xl font-black focus:outline-none pb-0.5 w-0"
              value={totalInput}
              onChange={e => onInputChange(e.target.value)}
              onBlur={onCommit}
              onKeyDown={e => { if (e.key === 'Enter') onCommit(); if (e.key === 'Escape') onCancelEdit(); }}
            />
          </div>
        ) : (
          <button
            onClick={onStartEdit}
            className="flex items-center gap-2 group/btn"
            title="Click to edit total budget"
          >
            <p className="text-4xl font-black num-pop leading-none text-dark dark:text-white">{fmt(total)}</p>
            <PencilIcon size={13} className="opacity-0 group-hover/btn:opacity-100 transition-opacity text-gold/50" />
          </button>
        )}
        <p className="text-xs mt-2 text-silver/50 dark:text-silver/55">
          {editingTotal ? 'Press Enter to save' : 'Click to edit'}
        </p>
      </div>

      {/* Spent */}
      <div className="relative px-6 py-7 overflow-hidden">
        <div className="absolute inset-0 shimmer pointer-events-none" />
        <div className="absolute top-3 right-3 text-[10px] text-gold/25">◆</div>
        <p className="text-sm text-gold mb-3">₹</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-gold">Spent</p>
        <p className="text-4xl font-black num-pop leading-none text-gold">{fmt(spent)}</p>
        <p className="text-xs mt-2 text-silver/50">{totalPct}% of total</p>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
      </div>

      {/* Remaining */}
      <div className="relative px-6 py-7 overflow-hidden">
        <div className="absolute top-3 right-3 text-[10px] text-silver/20 dark:text-silver/10">◆</div>
        <p className="text-sm text-silver/50 dark:text-silver/30 mb-3">◎</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-silver dark:text-silver/65">Remaining</p>
        <p className="text-4xl font-black num-pop leading-none text-dark dark:text-white">{fmt(remaining)}</p>
        <p className="text-xs mt-2 text-silver/50 dark:text-silver/55">{100 - totalPct}% free</p>
      </div>

    </div>
  </div>
);
