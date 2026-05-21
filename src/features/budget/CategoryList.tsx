import { CategoryCard, BudgetCategoryItem } from './CategoryCard';

interface CategoryListProps {
  categories: BudgetCategoryItem[];
  expandedCat: string | null;
  onToggleExpand: (name: string) => void;
  onEditCategory: (name: string) => void;
  onAddExpense: () => void;
}

export const CategoryList = ({
  categories, expandedCat, onToggleExpand, onEditCategory, onAddExpense,
}: CategoryListProps) => (
  <div>
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[#DDDED9]" />
      <div className="flex items-center gap-2 px-3 py-1 border border-[#E4BC62]/25 bg-[#E4BC62]/5">
        <span className="w-1 h-1 rounded-full bg-[#E4BC62]" />
        <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.35em]">By Category</p>
        <span className="w-1 h-1 rounded-full bg-[#E4BC62]" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[#DDDED9]" />
    </div>

    {categories.length === 0 && (
      <div className="flex flex-col items-center py-14 px-6 text-center border border-dashed border-[#E4BC62]/20 bg-[#E4BC62]/[0.02]">
        <div className="relative mb-6">
          <svg width="88" height="88" viewBox="0 0 88 88" fill="none" aria-hidden="true">
            {/* Outer ring */}
            <circle cx="44" cy="44" r="30" fill="#1c2226" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.28"/>
            {/* Mid ring */}
            <circle cx="44" cy="44" r="20" fill="none" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.2"/>
            {/* Inner ring */}
            <circle cx="44" cy="44" r="11" fill="#E4BC62" fillOpacity="0.08" stroke="#E4BC62" strokeWidth="1" strokeOpacity="0.35"/>
            {/* Center diamond */}
            <path d="M44 38 L49 44 L44 50 L39 44Z" fill="#E4BC62" fillOpacity="0.45" stroke="#E4BC62" strokeWidth="0.5" strokeOpacity="0.7"/>
            {/* Segment ticks on outer ring */}
            <line x1="44" y1="14" x2="44" y2="18" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.4" strokeLinecap="round"/>
            <line x1="70.6" y1="26" x2="68" y2="29.2" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.3" strokeLinecap="round"/>
            <line x1="74" y1="44" x2="70" y2="44" stroke="#E4BC62" strokeWidth="1.5" strokeOpacity="0.25" strokeLinecap="round"/>
            {/* Accent dots */}
            <circle cx="22" cy="30" r="2" fill="#DFB3AE" fillOpacity="0.3"/>
            <circle cx="66" cy="60" r="1.5" fill="#DFB3AE" fillOpacity="0.25"/>
          </svg>
          <div className="absolute inset-0 -z-10 blur-2xl bg-[#E4BC62]/8 rounded-full scale-75"/>
        </div>

        <p className="text-[10px] font-bold text-[#E4BC62]/60 uppercase tracking-[0.35em] mb-2">Budget</p>
        <h3 className="text-base font-bold text-[#23292E] dark:text-white mb-3">No budget categories yet</h3>
        <p className="text-sm text-zinc-400 dark:text-[#DDDED9]/50 max-w-xs mb-7 leading-relaxed">
          Complete your onboarding to auto-populate wedding budget categories, or start by logging your first expense.
        </p>

        <button
          onClick={onAddExpense}
          className="px-7 py-3 text-sm font-bold bg-[#23292E] text-[#E4BC62] border border-[#E4BC62]/30 hover:bg-[#E4BC62] hover:text-[#23292E] transition-all duration-200 hover:shadow-[0_4px_20px_rgba(228,188,98,0.35)]"
        >
          + Add First Expense
        </button>

        <p className="mt-4 text-[10px] text-zinc-400/50 dark:text-[#DDDED9]/25 max-w-xs">
          Tip: Set your total budget above to track utilisation across categories
        </p>
      </div>
    )}

    <div className="space-y-3 stagger-children">
      {categories.map(cat => (
        <CategoryCard
          key={cat.category}
          cat={cat}
          expanded={expandedCat === cat.category}
          onToggleExpand={() => onToggleExpand(cat.category)}
          onEditCategory={onEditCategory}
          onAddExpense={onAddExpense}
        />
      ))}
    </div>
  </div>
);
