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
      className={`group bg-card rounded-2xl ring-1 ring-silver/20 dark:ring-white/5 overflow-hidden lift-deep shadow-lg grad-border ${
        over ? 'border-l-[3px] border-l-blush' : 'border-l-[3px] border-l-transparent hover:border-l-gold/50'
      }`}
    >
      {/* Clickable header row */}
      <div
        onClick={onToggleExpand}
        className="cursor-pointer px-5 pt-4 pb-3.5 select-none"
      >
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-blush/15 dark:bg-dark border border-blush/20 dark:border-gold/12 rounded-xl flex items-center justify-center text-xl shrink-0">
              {cat.icon}
            </div>
            <div>
              <p className="text-sm font-bold text-dark dark:text-white">{cat.category}</p>
              <p className="text-[10px] text-zinc-400 dark:text-silver/65">
                {pct}% utilised · {cat.expenses.length} expense{cat.expenses.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-base font-black text-dark dark:text-white">{fmt(cat.spent)}</p>
              <p className="text-[10px] text-zinc-400 dark:text-silver/65">of {fmt(cat.allocated)} budgeted</p>
            </div>
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onEditCategory(cat.category); }}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-gold/30 text-gold/60 hover:border-gold hover:text-gold hover:bg-gold/10 transition-all duration-200 shrink-0"
              title="Edit category"
            >
              <PencilIcon size={13} />
            </button>
            <ChevronDownIcon
              size={14}
              className={`shrink-0 text-silver/70 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>

        <div className="relative h-3 bg-silver/25 dark:bg-silver/8 rounded-full overflow-hidden mb-2">
          <div className="absolute inset-0"
            style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(159,134,160,0.4) 7px, rgba(159,134,160,0.4) 8px)' }}
          />
          <div
            className={`absolute left-0 top-0 h-full bar-animate ${
              over
                ? 'bg-gradient-to-r from-blush to-blush/70'
                : pct > 80
                ? 'bg-gradient-to-r from-gold to-blush'
                : 'bg-gradient-to-r from-dark to-gold'
            }`}
            style={{ width: `${safePct}%` }}
          >
            <div className="absolute right-0 inset-y-0 w-3 bg-white/20" />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className={`text-[11px] font-medium ${over ? 'text-blush' : 'text-zinc-400 dark:text-silver/65'}`}>
            {over
              ? `⚠ Over by ${fmt(cat.spent - cat.allocated)}`
              : `${fmt(cat.allocated - cat.spent)} remaining`}
          </span>
          <span className={`text-[10px] font-black rounded-lg border px-2 py-0.5 ${
            over
              ? 'border-blush/40 bg-blush/8 text-blush'
              : pct > 80
              ? 'border-gold/40 bg-gold/8 text-gold'
              : 'border-silver dark:border-[#3D3268] text-zinc-400 dark:text-silver/65'
          }`}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Expense list — accordion */}
      {expanded && (
        <div className="border-t border-silver/50 dark:border-[#3D3268]/80">
          {cat.expenses.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-4">
              <span className="text-silver/25 text-lg">◎</span>
              <p className="text-xs text-zinc-400 dark:text-silver/35">No expenses recorded yet.</p>
              <button
                onClick={onAddExpense}
                className="ml-auto text-[10px] font-bold text-gold hover:text-gold/70 transition-colors uppercase tracking-widest"
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
                      ? 'border-b border-silver/30 dark:border-[#3D3268]/60'
                      : ''
                  } bg-gradient-to-r from-silver/5 dark:from-silver/3 to-transparent`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold/50 shrink-0" />
                  <p className="flex-1 text-xs text-dark dark:text-white/70 truncate">
                    {exp.note || '—'}
                  </p>
                  <span className="text-[10px] text-silver/40 shrink-0">{exp.date}</span>
                  <span className="text-xs font-black text-gold shrink-0">{fmt(exp.amount)}</span>
                </div>
              ))}
              <div className="flex items-center justify-between px-5 py-2.5 bg-gold/5 border-t border-gold/10">
                <p className="text-[10px] text-silver/40 uppercase tracking-widest">
                  {cat.expenses.length} expense{cat.expenses.length !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-4">
                  <p className="text-[10px] font-bold text-gold">Total: {fmt(cat.spent)}</p>
                  <button
                    onClick={onAddExpense}
                    className="text-[10px] font-bold text-silver/40 hover:text-gold transition-colors uppercase tracking-widest"
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