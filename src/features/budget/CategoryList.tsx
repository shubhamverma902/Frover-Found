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
      <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[#E4BC62]/20 bg-[#E4BC62]/3">
        <span className="text-4xl mb-3 text-[#E4BC62]/20">◆</span>
        <p className="text-sm font-semibold text-[#DDDED9]/40">No budget categories yet</p>
        <p className="text-xs text-[#DDDED9]/25 mt-1 max-w-xs">
          Complete your onboarding to auto-populate categories, or add expenses to get started.
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
