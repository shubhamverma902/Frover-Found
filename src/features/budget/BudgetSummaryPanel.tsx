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
  <div className="bg-[#23292E] p-[3px] glow-gold relative">
    <div className="border border-[#E4BC62]/12 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E4BC62]/10">

      {/* Total Budget — editable */}
      <div className="relative px-6 py-7 overflow-hidden group">
        <div className="absolute top-3 right-3 text-[10px] text-[#DDDED9]/10">◆</div>
        <p className="text-sm text-[#DDDED9]/30 mb-3">◆</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-[#DDDED9]/35">Total Budget</p>
        {editingTotal ? (
          <div className="flex items-center gap-2">
            <span className="text-white text-sm">₹</span>
            <input
              type="number"
              min={1}
              autoFocus
              className="flex-1 bg-transparent border-b border-[#E4BC62]/60 text-white text-2xl font-black focus:outline-none pb-0.5 w-0"
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
            <p className="text-4xl font-black num-pop leading-none text-white">{fmt(total)}</p>
            <PencilIcon size={13} className="opacity-0 group-hover/btn:opacity-100 transition-opacity text-[#E4BC62]/50" />
          </button>
        )}
        <p className="text-xs mt-2 text-[#DDDED9]/25">
          {editingTotal ? 'Press Enter to save' : 'Click to edit'}
        </p>
      </div>

      {/* Spent */}
      <div className="relative px-6 py-7 overflow-hidden">
        <div className="absolute inset-0 shimmer pointer-events-none" />
        <div className="absolute top-3 right-3 text-[10px] text-[#E4BC62]/25">◆</div>
        <p className="text-sm text-[#E4BC62] mb-3">₹</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-[#E4BC62]">Spent</p>
        <p className="text-4xl font-black num-pop leading-none text-[#E4BC62]">{fmt(spent)}</p>
        <p className="text-xs mt-2 text-[#DDDED9]/50">{totalPct}% of total</p>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E4BC62]/50 to-transparent" />
      </div>

      {/* Remaining */}
      <div className="relative px-6 py-7 overflow-hidden">
        <div className="absolute top-3 right-3 text-[10px] text-[#DDDED9]/10">◆</div>
        <p className="text-sm text-[#DDDED9]/30 mb-3">◎</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2 text-[#DDDED9]/35">Remaining</p>
        <p className="text-4xl font-black num-pop leading-none text-white">{fmt(remaining)}</p>
        <p className="text-xs mt-2 text-[#DDDED9]/25">{100 - totalPct}% free</p>
      </div>

    </div>
  </div>
);
