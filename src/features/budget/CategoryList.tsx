import { CategoryCard, BudgetCategoryItem } from './CategoryCard';
import { BudgetWheelIllustration } from '@/components/icons';

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
      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-silver" />
      <div className="flex items-center gap-2 px-3 py-1 border border-gold/25 bg-gold/5">
        <span className="w-1 h-1 rounded-full bg-gold" />
        <p className="text-[10px] font-bold text-gold uppercase tracking-[0.35em]">By Category</p>
        <span className="w-1 h-1 rounded-full bg-gold" />
      </div>
      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-silver" />
    </div>

    {categories.length === 0 && (
      <div className="flex flex-col items-center py-14 px-6 text-center border border-dashed border-gold/20 bg-gold/[0.02]">
        <div className="relative mb-6">
          <BudgetWheelIllustration />
          <div className="absolute inset-0 -z-10 blur-2xl bg-gold/8 rounded-full scale-75"/>
        </div>

        <p className="text-[10px] font-bold text-gold/60 uppercase tracking-[0.35em] mb-2">Budget</p>
        <h3 className="text-base font-bold text-dark dark:text-white mb-3">No budget categories yet</h3>
        <p className="text-sm text-zinc-400 dark:text-silver/70 max-w-xs mb-7 leading-relaxed">
          Complete your onboarding to auto-populate wedding budget categories, or start by logging your first expense.
        </p>

        <button
          onClick={onAddExpense}
          className="px-7 py-3 text-sm font-bold bg-subtle dark:bg-dark text-gold border border-gold/30 hover:bg-gold hover:text-dark transition-all duration-200 hover:shadow-[0_4px_20px_rgba(205,180,219,0.35)]"
        >
          + Add First Expense
        </button>

        <p className="mt-4 text-[10px] text-zinc-400/50 dark:text-silver/55 max-w-xs">
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
