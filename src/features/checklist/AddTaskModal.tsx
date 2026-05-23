'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { CheckIcon } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createTask, selectCategories, selectMutating } from '@/store/slices/checklistSlice';

interface AddTaskModalProps {
  onClose: () => void;
}

const AddTaskModal = ({ onClose }: AddTaskModalProps) => {
  const dispatch   = useAppDispatch();
  const categories = useAppSelector(selectCategories);
  const mutating   = useAppSelector(selectMutating);

  const [label,      setLabel]      = useState('');
  const [labelError, setLabelError] = useState('');
  const [due,        setDue]        = useState('');
  const [category,   setCategory]   = useState(categories[0]?.category ?? '');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!label.trim()) { setLabelError('Required'); return; }
    if (!category) return;
    const result = await dispatch(createTask({ label: label.trim(), due: due.trim() || 'No due date', category }));
    if (createTask.fulfilled.match(result)) onClose();
  };

  return (
    <Modal onClose={onClose} aria-label="Add new task" className="flex flex-col max-h-[90svh]">

      {/* Header — fixed */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Planning</p>
          <h2 className="text-base font-bold text-white">Add New Task</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      {/* Form — scrollable body + fixed footer */}
      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">

        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">

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
              autoFocus
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

        </div>

        {/* Footer — fixed */}
        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={mutating}>{mutating ? 'Saving…' : 'Add Task ✦'}</Button>
        </div>

      </form>
    </Modal>
  );
};

export default AddTaskModal;
