'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { TrashIcon, CheckIcon } from '@/components/icons';
import { useUpdateTaskMutation, useDeleteTaskMutation, useGetChecklistQuery } from '@/store/api';
import type { ChecklistTask } from '@/types/checklist';

interface EditTaskModalProps {
  task:     ChecklistTask;
  category: string;
  onClose:  () => void;
}

const EditTaskModal = ({ task, category: initialCategory, onClose }: EditTaskModalProps) => {
  const [updateTask, { isLoading: saving }]   = useUpdateTaskMutation();
  const [deleteTask, { isLoading: deleting }] = useDeleteTaskMutation();
  const mutating = saving || deleting;

  const { data: checklist } = useGetChecklistQuery();
  const categories = checklist ?? [];

  const [label,         setLabel]         = useState(task.label);
  const [labelError,    setLabelError]    = useState('');
  const [due,           setDue]           = useState(task.due ? task.due.slice(0, 10) : '');
  const [category,      setCategory]      = useState(initialCategory);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const initialDue = task.due ? task.due.slice(0, 10) : '';
  const hasChanges =
    label.trim() !== task.label ||
    due           !== initialDue ||
    category     !== initialCategory;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!label.trim()) { setLabelError('Required'); return; }
    if (!category) return;
    try {
      await updateTask({
        taskId: task._id,
        label: label.trim(),
        due: due || null,
        originalCategory: initialCategory,
        category,
      }).unwrap();
      onClose();
    } catch { }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task._id).unwrap();
      onClose();
    } catch { }
  };

  const unsavedBadge = hasChanges && (
    <span className="text-[10px] font-semibold text-blush border border-blush/30 px-2 py-0.5 uppercase tracking-widest">
      Unsaved
    </span>
  );

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Planning"
      title="Edit Task"
      aria-label="Edit task"
      headerSlot={unsavedBadge}
    >
      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

          <div className="flex items-center gap-2.5 px-3 py-2 bg-gold/8 border border-gold/20 w-fit max-w-full">
            <span className="text-gold text-[10px]">◆</span>
            <span className="text-[11px] font-semibold text-gold truncate">{task.label}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div>
            <FieldLabel>Task <span className="text-blush">*</span></FieldLabel>
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

          <div>
            <FieldLabel>Due</FieldLabel>
            <Input
              variant="dark"
              type="date"
              value={due}
              onChange={e => setDue(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Category <span className="text-blush">*</span></FieldLabel>
            <div className="flex flex-col gap-1.5">
              {categories.map(cat => (
                <label
                  key={cat.category}
                  className={`flex items-center gap-3 px-3 py-2.5 border cursor-pointer transition-colors ${
                    category === cat.category
                      ? 'border-gold/40 bg-gold/8'
                      : 'border-silver/15 hover:border-silver/30'
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
                  <span className={`text-xs font-semibold ${category === cat.category ? 'text-gold' : 'text-silver/50'}`}>
                    {cat.category}
                  </span>
                  {category === cat.category && (
                    <CheckIcon size={10} className="ml-auto shrink-0 text-gold" strokeWidth={1.8} />
                  )}
                </label>
              ))}
            </div>
          </div>

          <div className="border border-red-900/30 bg-red-950/20 px-4 py-3">
            <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-2">Danger Zone</p>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-red-300/80 flex-1">Remove this task permanently?</p>
                <Button variant="cancel-sm" type="button" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button variant="danger" type="button" onClick={handleDelete} disabled={deleting}>
                  {deleting ? '…' : 'Yes, Delete'}
                </Button>
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

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!hasChanges || mutating}>
            {mutating ? 'Saving…' : 'Save Changes ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default EditTaskModal;
