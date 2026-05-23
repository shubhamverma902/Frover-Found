'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import type { SeatingTable } from '@/constants/dashboard-pages';

interface Props {
  table:     SeatingTable;
  onSave:    (payload: { name: string; capacity: number; shape: SeatingTable['shape'] }) => void;
  onDelete:  () => void;
  onClose:   () => void;
  saving:    boolean;
}

export const EditTableModal = ({ table, onSave, onDelete, onClose, saving }: Props) => {
  const [name,          setName]          = useState(table.name);
  const [capacity,      setCapacity]      = useState(table.capacity);
  const [shape,         setShape]         = useState<SeatingTable['shape']>(table.shape);
  const [nameErr,       setNameErr]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameErr('Required'); return; }
    onSave({ name: name.trim(), capacity, shape });
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-sm" aria-label="Edit table" className="flex flex-col max-h-[90svh]">
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Seating</p>
          <h2 className="text-base font-bold text-white">Edit Table</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">

          <div>
            <FieldLabel>Table Name <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input
              variant="dark"
              value={name}
              onChange={e => { setName(e.target.value); if (nameErr) setNameErr(''); }}
              onBlur={() => { if (!name.trim()) setNameErr('Required'); }}
              error={!!nameErr}
            />
            {nameErr && <p className="text-xs text-red-400 mt-1">{nameErr}</p>}
          </div>

          <div>
            <FieldLabel>Capacity (seats)</FieldLabel>
            <Input
              variant="dark"
              type="number"
              min={1}
              max={200}
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
            />
          </div>

          <div>
            <FieldLabel>Shape</FieldLabel>
            <div className="flex gap-2">
              {(['round', 'rectangular'] as const).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setShape(s)}
                  className={[
                    'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 border text-[11px] font-bold capitalize transition-colors',
                    shape === s
                      ? 'border-[#E4BC62]/50 bg-[#E4BC62]/10 text-[#E4BC62]'
                      : 'border-[#DDDED9]/15 text-[#DDDED9]/40 hover:border-[#DDDED9]/30',
                  ].join(' ')}
                >
                  <span>{s === 'round' ? '●' : '■'}</span>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#DDDED9]/10">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs text-red-300/80">Remove this table?</p>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 text-[11px] border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors">
                  No
                </button>
                <button type="button" onClick={onDelete} disabled={saving}
                  className="px-2.5 py-1 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60">
                  Yes, Delete
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="text-[11px] font-semibold text-red-400/60 hover:text-red-400 transition-colors">
                Delete table
              </button>
            )}
          </div>

        </div>

        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || saving}>
            {saving ? 'Saving…' : 'Save ✦'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
