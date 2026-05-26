'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import type { SeatingTable } from '@/types/seating';

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
    <ModalShell onClose={onClose} eyebrow="Seating" title="Edit Table" aria-label="Edit table" maxWidth="max-w-sm">
      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

          <div>
            <FieldLabel>Table Name <span className="text-blush">*</span></FieldLabel>
            <Input
              variant="dark"
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

          <div className="pt-2 border-t border-silver/10">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="flex-1 text-xs text-red-300/80">Remove this table?</p>
                <Button variant="cancel-sm" type="button" onClick={() => setConfirmDelete(false)}>No</Button>
                <Button variant="danger" type="button" onClick={onDelete} disabled={saving}>Yes, Delete</Button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="text-[11px] font-semibold text-red-400/60 hover:text-red-400 transition-colors">
                Delete table
              </button>
            )}
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || saving}>
            {saving ? 'Saving…' : 'Save ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};
