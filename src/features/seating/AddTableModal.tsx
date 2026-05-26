'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import type { SeatingTable } from '@/types/seating';

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

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameErr('Required'); return; }
    onSave({ name: name.trim(), capacity, shape });
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Seating" title="Add Table" aria-label="Add table" maxWidth="max-w-sm">
      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

          <div>
            <FieldLabel>Table Name <span className="text-blush">*</span></FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. Head Table, Table 1"
              value={name}
              onChange={e => { const v = e.target.value; setName(v); if (nameErr) setNameErr(v.trim() ? '' : 'Required'); }}
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
                      ? 'border-gold/50 bg-gold/10 text-gold'
                      : 'border-silver/15 text-silver/40 hover:border-silver/30',
                  ].join(' ')}
                >
                  <span>{s === 'round' ? '●' : '■'}</span>
                  {s}
                </button>
              ))}
            </div>
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || saving}>
            {saving ? 'Adding…' : 'Add Table ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};
