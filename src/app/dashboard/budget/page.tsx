'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchBudget,
  updateTotal,
  selectBudgetTotal,
  selectBudgetSpent,
  selectBudgetRemaining,
  selectBudgetCategories,
  selectBudgetStatus,
} from '@/store/slices/budgetSlice';
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
  const dispatch   = useAppDispatch();
  const total      = useAppSelector(selectBudgetTotal);
  const spent      = useAppSelector(selectBudgetSpent);
  const remaining  = useAppSelector(selectBudgetRemaining);
  const categories = useAppSelector(selectBudgetCategories);
  const bdStatus   = useAppSelector(selectBudgetStatus);
  const totalPct   = total > 0 ? Math.round((spent / total) * 100) : 0;

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editCategory,   setEditCategory]   = useState<string | null>(null);
  const [editingTotal,   setEditingTotal]   = useState(false);
  const [totalInput,     setTotalInput]     = useState(String(total));
  const [expandedCat,    setExpandedCat]    = useState<string | null>(null);

  useEffect(() => {
    if (bdStatus !== 'idle') return;
    const thunk = dispatch(fetchBudget());
    return () => thunk.abort();
  }, [bdStatus, dispatch]);

  const loading = bdStatus === 'loading' || bdStatus === 'idle';

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

      {loading && <BudgetSkeleton />}

      {!loading && <>
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
