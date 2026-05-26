'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { CheckIcon } from '@/components/icons';
import { useCreateTaskMutation, useGetChecklistQuery } from '@/store/api';

interface AddTaskModalProps {
  onClose: () => void;
}

const AddTaskModal = ({ onClose }: AddTaskModalProps) => {
  const [createTask, { isLoading: mutating }] = useCreateTaskMutation();
  const { data: checklist } = useGetChecklistQuery();
  const categories = checklist ?? [];

  const [label,      setLabel]      = useState('');
  const [labelError, setLabelError] = useState('');
  const [due,        setDue]        = useState('');
  const [category,   setCategory]   = useState(categories[0]?.category ?? '');

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!label.trim()) { setLabelError('Required'); return; }
    if (!category) return;
    try {
      await createTask({ label: label.trim(), due: due || null, category }).unwrap();
      onClose();
    } catch { }
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Planning" title="Add New Task" aria-label="Add new task">
      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

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
              autoFocus
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

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={mutating}>
            {mutating ? 'Saving…' : 'Add Task ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default AddTaskModal;
