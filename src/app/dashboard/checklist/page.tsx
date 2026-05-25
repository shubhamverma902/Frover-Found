'use client';

import { useState, useEffect } from 'react';
import { exportChecklistPDF } from '@/utils/exportPdf';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleTask, selectTogglingIds, resetChecklistMutating } from '@/store/slices/checklistSlice';
import { useGetChecklistQuery } from '@/store/api';
import {
  AddTaskModal,
  EditTaskModal,
  ChecklistHeader,
  FilterTabs,
  ChecklistSkeleton,
  CategorySection,
  ChecklistEmptyState,
} from '@/features/checklist';
import type { Filter } from '@/features/checklist';
import type { ChecklistTask } from '@/constants/dashboard-pages';

const ChecklistPage = () => {
  const dispatch    = useAppDispatch();
  const togglingIds = useAppSelector(selectTogglingIds);
  useEffect(() => { dispatch(resetChecklistMutating()); }, [dispatch]);
  const { data: categories = [], isLoading } = useGetChecklistQuery();

  const doneCount  = categories.flatMap(c => c.tasks).filter(t => t.done).length;
  const totalCount = categories.flatMap(c => c.tasks).length;
  const progress   = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const [filter,    setFilter]    = useState<Filter>('all');
  const [showAdd,   setShowAdd]   = useState(false);
  const [editTask,  setEditTask]  = useState<{ task: ChecklistTask; category: string } | null>(null);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportChecklistPDF(categories, doneCount, totalCount);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 page-sections">

      {showAdd  && <AddTaskModal  onClose={() => setShowAdd(false)} />}
      {editTask && <EditTaskModal task={editTask.task} category={editTask.category} onClose={() => setEditTask(null)} />}

      <ChecklistHeader
        doneCount={doneCount}
        totalCount={totalCount}
        progress={progress}
        exporting={exporting}
        onAddTask={() => setShowAdd(true)}
        onExport={categories.length > 0 ? handleExport : undefined}
      />

      <FilterTabs filter={filter} onChange={setFilter} />

      {isLoading && <ChecklistSkeleton />}

      {!isLoading && categories.length === 0 && (
        <ChecklistEmptyState onAddTask={() => setShowAdd(true)} />
      )}

      {!isLoading && categories.length > 0 && (
        <div className="space-y-4 stagger-children">
          {categories.map(cat => (
            <CategorySection
              key={cat.category}
              cat={cat}
              filter={filter}
              togglingIds={togglingIds}
              onToggleTask={id => dispatch(toggleTask(id))}
              onEditTask={(task, category) => setEditTask({ task, category })}
            />
          ))}
        </div>
      )}

    </div>
  );
};

export default ChecklistPage;
