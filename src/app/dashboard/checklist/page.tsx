'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchChecklist,
  toggleTask,
  selectCategories,
  selectChecklistStatus,
  selectDoneCount,
  selectTotalCount,
} from '@/store/slices/checklistSlice';
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
  const dispatch   = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const clStatus   = useAppSelector(selectChecklistStatus);
  const doneCount  = useAppSelector(selectDoneCount);
  const totalCount = useAppSelector(selectTotalCount);

  const [filter,   setFilter]   = useState<Filter>('all');
  const [showAdd,  setShowAdd]  = useState(false);
  const [editTask, setEditTask] = useState<{ task: ChecklistTask; category: string } | null>(null);

  useEffect(() => {
    if (clStatus === 'idle') dispatch(fetchChecklist());
  }, [clStatus, dispatch]);

  const loading  = clStatus === 'loading';
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6 page-sections">

      {showAdd  && <AddTaskModal  onClose={() => setShowAdd(false)} />}
      {editTask && <EditTaskModal task={editTask.task} category={editTask.category} onClose={() => setEditTask(null)} />}

      <ChecklistHeader
        doneCount={doneCount}
        totalCount={totalCount}
        progress={progress}
        onAddTask={() => setShowAdd(true)}
      />

      <FilterTabs filter={filter} onChange={setFilter} />

      {loading && <ChecklistSkeleton />}

      {!loading && categories.length === 0 && (
        <ChecklistEmptyState onAddTask={() => setShowAdd(true)} />
      )}

      {!loading && categories.length > 0 && (
        <div className="space-y-4 stagger-children">
          {categories.map(cat => (
            <CategorySection
              key={cat.category}
              cat={cat}
              filter={filter}
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
