'use client';

import { useState } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { updateTotal } from '@/store/slices/budgetSlice';
import { useGetBudgetQuery } from '@/store/api';
import {
  AddExpenseModal,
  EditCategoryModal,
  BudgetHeader,
  BudgetSummaryPanel,
  UtilisationBar,
  SpendingDonut,
  CategoryList,
  BudgetSkeleton,
} from '@/features/budget';

const BudgetPage = () => {
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetBudgetQuery();

  const total      = data?.total ?? 0;
  const categories = data?.categories ?? [];
  const spent      = categories.reduce((s, c) => s + c.spent, 0);
  const remaining  = total - spent;
  const totalPct   = total > 0 ? Math.round((spent / total) * 100) : 0;

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editCategory,   setEditCategory]   = useState<string | null>(null);
  const [editingTotal,   setEditingTotal]   = useState(false);
  const [totalInput,     setTotalInput]     = useState('');
  const [expandedCat,    setExpandedCat]    = useState<string | null>(null);

  const commitTotal = () => {
    const val = Number(totalInput);
    if (val > 0 && val !== total) dispatch(updateTotal(val));
    setEditingTotal(false);
  };

  const handleToggleExpand = (name: string) =>
    setExpandedCat(prev => (prev === name ? null : name));

  return (
    <div className="p-6 lg:p-8 space-y-8 page-sections">

      {showAddExpense && <AddExpenseModal  onClose={() => setShowAddExpense(false)} />}
      {editCategory   && <EditCategoryModal categoryName={editCategory} onClose={() => setEditCategory(null)} />}

      {isLoading && <BudgetSkeleton />}

      {!isLoading && <>
        <BudgetHeader
          totalPct={totalPct}
          onAddExpense={() => setShowAddExpense(true)}
        />

        <BudgetSummaryPanel
          total={total}
          spent={spent}
          remaining={remaining}
          totalPct={totalPct}
          editingTotal={editingTotal}
          totalInput={totalInput}
          onStartEdit={() => { setTotalInput(String(total)); setEditingTotal(true); }}
          onInputChange={setTotalInput}
          onCommit={commitTotal}
          onCancelEdit={() => setEditingTotal(false)}
        />

        <UtilisationBar
          totalPct={totalPct}
          spent={spent}
          total={total}
          remaining={remaining}
        />

        <SpendingDonut
          categories={categories}
          spent={spent}
          total={total}
        />

        <CategoryList
          categories={categories}
          expandedCat={expandedCat}
          onToggleExpand={handleToggleExpand}
          onEditCategory={setEditCategory}
          onAddExpense={() => setShowAddExpense(true)}
        />
      </>}

    </div>
  );
};

export default BudgetPage;
