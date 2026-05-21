import { PencilIcon, ChevronDownIcon } from '@/components/icons';
import { fmt } from '@/utils/format';

interface Expense {
  _id: string;
  amount: number;
  note: string;
  date: string;
}

export interface BudgetCategoryItem {
  _id: string;
  icon: string;
  category: string;
  allocated: number;
  spent: number;
  expenses: Expense[];
}

interface CategoryCardProps {
  cat: BudgetCategoryItem;
  expanded: boolean;
  onToggleExpand: () => void;
  onEditCategory: (name: string) => void;
  onAddExpense: () => void;
}

export const CategoryCard = ({ cat, expanded, onToggleExpand, onEditCategory, onAddExpense }: CategoryCardProps) => {
  const pct     = cat.allocated > 0 ? Math.round((cat.spent / cat.allocated) * 100) : 0;
  const over    = pct > 100;
  const safePct = Math.min(pct, 100);

  return (
    <div
      className={`group bg-card border border-[#DDDED9] dark:border-[#2a2f33] overflow-hidden lift-deep grad-border ${
        over ? 'border-l-[3px] border-l-[#DFB3AE]' : 'border-l-[3px] border-l-transparent hover:border-l-[#E4BC62]/50'
      }`}
    >
      {/* Clickable header row */}
      <div
        onClick={onToggleExpand}
        className="cursor-pointer px-5 pt-4 pb-3.5 select-none"
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#23292E] border border-[#E4BC62]/12 flex items-center justify-center text-xl shrink-0">
              {cat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-[#23292E] dark:text-[#FDFDF8]">{cat.category}</p>
              <p className="text-[10px] text-zinc-400 dark:text-[#DDDED9]/50">
                {pct}% utilised · {cat.expenses.length} expense{cat.expenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-black text-[#23292E] dark:text-white">{fmt(cat.spent)}</p>
              <p className="text-[10px] text-zinc-400 dark:text-[#DDDED9]/50">of {fmt(cat.allocated)} budgeted</p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onEditCategory(cat.category); }}
              className="w-8 h-8 flex items-center justify-center border border-[#E4BC62]/30 text-[#E4BC62]/60 hover:border-[#E4BC62] hover:text-[#E4BC62] hover:bg-[#E4BC62]/10 transition-all duration-200 shrink-0"
              title="Edit category"
            >
              <PencilIcon size={13} />
            </button>
            <ChevronDownIcon
              size={14}
              className={`shrink-0 text-[#DDDED9]/70 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        <div className="relative h-3 bg-[#DDDED9]/25 dark:bg-[#DDDED9]/8 overflow-hidden mb-2">
          <div className="absolute inset-0"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(221,222,217,0.4) 7px, rgba(221,222,217,0.4) 8px)' }}
          />
          <div
            className={`absolute left-0 top-0 h-full bar-animate ${
              over
                ? 'bg-gradient-to-r from-[#DFB3AE] to-[#DFB3AE]/70'
                : pct > 80
                ? 'bg-gradient-to-r from-[#E4BC62] to-[#DFB3AE]'
                : 'bg-gradient-to-r from-[#23292E] to-[#E4BC62]'
            }`}
            style={{ width: `${safePct}%` }}
          >
            <div className="absolute right-0 inset-y-0 w-3 bg-white/20" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-[11px] font-medium ${over ? 'text-[#DFB3AE]' : 'text-zinc-400 dark:text-[#DDDED9]/50'}`}>
            {over
              ? `⚠ Over by ${fmt(cat.spent - cat.allocated)}`
              : `${fmt(cat.allocated - cat.spent)} remaining`}
          </span>
          <span className={`text-[10px] font-black border px-2 py-0.5 ${
            over
              ? 'border-[#DFB3AE]/40 bg-[#DFB3AE]/8 text-[#DFB3AE]'
              : pct > 80
              ? 'border-[#E4BC62]/40 bg-[#E4BC62]/8 text-[#E4BC62]'
              : 'border-[#DDDED9] dark:border-[#2a2f33] text-zinc-400 dark:text-[#DDDED9]/50'
          }`}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Expense list — accordion */}
      {expanded && (
        <div className="border-t border-[#DDDED9]/50 dark:border-[#2a2f33]/80">
          {cat.expenses.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="text-[#DDDED9]/25 text-lg">◎</span>
              <p className="text-xs text-zinc-400 dark:text-[#DDDED9]/35">No expenses recorded yet.</p>
              <button
                onClick={onAddExpense}
                className="ml-auto text-[10px] font-bold text-[#E4BC62] hover:text-[#E4BC62]/70 transition-colors uppercase tracking-widest"
              >
                + Add
              </button>
            </div>
          ) : (
            <>
              {cat.expenses.map((exp, i) => (
                <div
                  key={exp._id}
                  className={`flex items-center gap-4 px-5 py-3 ${
                    i < cat.expenses.length - 1
                      ? 'border-b border-[#DDDED9]/30 dark:border-[#2a2f33]/60'
                      : ''
                  } bg-gradient-to-r from-[#DDDED9]/5 dark:from-[#DDDED9]/3 to-transparent`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E4BC62]/50 shrink-0" />
                  <p className="flex-1 text-xs text-[#23292E] dark:text-[#FDFDF8]/70 truncate">
                    {exp.note || '—'}
                  </p>
                  <span className="text-[10px] text-[#DDDED9]/40 shrink-0">{exp.date}</span>
                  <span className="text-xs font-black text-[#E4BC62] shrink-0">{fmt(exp.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-2.5 bg-[#E4BC62]/5 border-t border-[#E4BC62]/10">
                <p className="text-[10px] text-[#DDDED9]/40 uppercase tracking-widest">
                  {cat.expenses.length} expense{cat.expenses.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-[#E4BC62]">Total: {fmt(cat.spent)}</p>
                  <button
                    onClick={onAddExpense}
                    className="text-[10px] font-bold text-[#DDDED9]/40 hover:text-[#E4BC62] transition-colors uppercase tracking-widest"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
