'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { TrashIcon, CheckIcon } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateTask, deleteTask, selectCategories, selectMutating } from '@/store/slices/checklistSlice';
import type { ChecklistTask } from '@/constants/dashboard-pages';

interface EditTaskModalProps {
  task:     ChecklistTask;
  category: string;
  onClose:  () => void;
}

const EditTaskModal = ({ task, category: initialCategory, onClose }: EditTaskModalProps) => {
  const dispatch   = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const mutating   = useAppSelector(selectMutating);

  const [label,         setLabel]         = useState(task.label);
  const [labelError,    setLabelError]    = useState('');
  const [due,           setDue]           = useState(task.due);
  const [category,      setCategory]      = useState(initialCategory);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const hasChanges =
    label.trim() !== task.label ||
    due.trim()   !== task.due   ||
    category     !== initialCategory;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!label.trim()) { setLabelError('Required'); return; }
    if (!category) return;
    const result = await dispatch(updateTask({
      taskId: task._id,
      label: label.trim(),
      due: due.trim() || 'No due date',
      originalCategory: initialCategory,
      category,
    }));
    if (updateTask.fulfilled.match(result)) onClose();
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteTask(task._id));
    if (deleteTask.fulfilled.match(result)) onClose();
  };

  return (
    <Modal onClose={onClose} className="flex flex-col max-h-[90svh]">

      {/* Header — fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Planning</p>
          <h2 className="text-base font-bold text-white">Edit Task</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-[10px] font-semibold text-[#DFB3AE] border border-[#DFB3AE]/30 px-2 py-0.5 uppercase tracking-widest">
              Unsaved
            </span>
          )}
          <Button variant="close" onClick={onClose}>✕</Button>
        </div>
      </div>

      {/* Form — scrollable body + fixed footer */}
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">

        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">

          {/* Current task pill */}
          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#E4BC62]/8 border border-[#E4BC62]/20 w-fit max-w-full">
            <span className="text-[#E4BC62] text-[10px]">◆</span>
            <span className="text-[11px] font-semibold text-[#E4BC62] truncate">{task.label}</span>
          </div>

          {/* Ornament */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
            <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
          </div>

          {/* Task label */}
          <div>
            <FieldLabel>Task <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. Book florist for mandap"
              value={label}
              onChange={e => { const v = e.target.value; setLabel(v); if (labelError) setLabelError(v.trim() ? '' : 'Required'); }}
              onBlur={() => { if (!label.trim()) setLabelError('Required'); }}
              error={!!labelError}
            />
            {labelError && <p className="text-xs text-red-400 mt-1">{labelError}</p>}
          </div>

          {/* Due */}
          <div>
            <FieldLabel>Due</FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. Due in 30 days"
              value={due}
              onChange={e => setDue(e.target.value)}
            />
          </div>

          {/* Category */}
          <div>
            <FieldLabel>Category <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <label
                  key={cat.category}
                  className={`flex items-center gap-3 px-3 py-2.5 border cursor-pointer transition-colors ${
                    category === cat.category
                      ? 'border-[#E4BC62]/40 bg-[#E4BC62]/8'
                      : 'border-[#DDDED9]/15 hover:border-[#DDDED9]/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={cat.category}
                    checked={category === cat.category}
                    onChange={() => setCategory(cat.category)}
                    className="sr-only"
                  />
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className={`text-xs font-semibold ${category === cat.category ? 'text-[#E4BC62]' : 'text-[#DDDED9]/50'}`}>
                    {cat.category}
                  </span>
                  {category === cat.category && (
                    <CheckIcon size={10} className="ml-auto shrink-0 text-[#E4BC62]" strokeWidth={1.8} />
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Delete zone */}
          <div className="border border-red-900/30 bg-red-950/20 px-4 py-3">
            <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-2">Danger Zone</p>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-red-300/80 flex-1">Remove this task permanently?</p>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-[11px] font-semibold border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={mutating}
                  className="px-3 py-1.5 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
                >
                  {mutating ? '…' : 'Yes, Delete'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-xs font-semibold text-red-400/70 hover:text-red-400 transition-colors"
              >
                <TrashIcon size={12} />
                Delete this task
              </button>
            )}
          </div>

        </div>

        {/* Footer — fixed */}
        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!hasChanges || mutating}>{mutating ? 'Saving…' : 'Save Changes ✦'}</Button>
        </div>

      </form>
    </Modal>
  );
};

export default EditTaskModal;
