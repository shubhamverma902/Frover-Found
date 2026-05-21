'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import type { SeatingTable } from '@/constants/dashboard-pages';

interface Props {
  onSave:  (payload: { name: string; capacity: number; shape: SeatingTable['shape'] }) => void;
  onClose: () => void;
  saving:  boolean;
}

export const AddTableModal = ({ onSave, onClose, saving }: Props) => {
  const [name,     setName]     = useState('');
  const [capacity, setCapacity] = useState(8);
  const [shape,    setShape]    = useState<SeatingTable['shape']>('round');
  const [nameErr,  setNameErr]  = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameErr('Required'); return; }
    onSave({ name: name.trim(), capacity, shape });
  };

  return (
    <Modal onClose={onClose} className="max-w-sm">
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Seating</p>
          <h2 className="text-base font-bold text-white">Add Table</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

        <div>
          <FieldLabel>Table Name <span className="text-[#DFB3AE]">*</span></FieldLabel>
          <Input
            variant="dark"
            placeholder="e.g. Head Table, Table 1"
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

        <div className="flex gap-3 pt-2">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || saving}>
            {saving ? 'Adding…' : 'Add Table ✦'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
