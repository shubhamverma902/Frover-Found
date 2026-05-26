'use client';

import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { SeatingTable } from '@/types/seating';
import type { Guest } from '@/types/guest';
import { GuestChip } from './GuestChip';

const ShapeIcon = ({ shape }: { shape: SeatingTable['shape'] }) =>
  shape === 'round'
    ? <span className="text-[11px] text-gold/50">●</span>
    : <span className="text-[11px] text-gold/50">■</span>;

interface Props {
  table:      SeatingTable;
  guests:     Guest[];         // full guest objects for this table
  onEdit:     (table: SeatingTable) => void;
  onUnassign: (guestId: string) => void;
}

export const TableCard = ({ table, guests, onEdit, onUnassign }: Props) => {
  const { isOver, setNodeRef } = useDroppable({ id: table._id });
  const [hoverGuest, setHoverGuest] = useState<string | null>(null);

  const pct  = Math.round((guests.length / table.capacity) * 100);
  const over = guests.length > table.capacity;

  return (
    <div
      ref={setNodeRef}
      className={[
        'flex flex-col bg-card dark:bg-dark rounded-2xl border transition-colors min-h-[180px]',
        isOver ? 'border-gold/60 bg-gold/5' : 'border-silver/20 dark:border-silver/10 hover:border-silver/40 dark:hover:border-silver/20',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-silver/15 dark:border-silver/8">
        <ShapeIcon shape={table.shape} />
        <p className="text-[11px] font-bold text-dark dark:text-silver/80 flex-1 truncate">{table.name}</p>
        <span className={`text-[10px] font-black rounded-md px-1.5 py-0.5 ${over ? 'text-red-400 bg-red-900/20' : 'text-gold/60 bg-gold/8'}`}>
          {guests.length}/{table.capacity}
        </span>
        <button
          type="button"
          onClick={() => onEdit(table)}
          className="text-silver/25 hover:text-gold/60 transition-colors text-[10px] leading-none px-1"
          title="Edit table"
        >
          ✎
        </button>
      </div>

      {/* Capacity bar */}
      <div className="h-[2px] bg-silver/8 rounded-full">
        <div
          className={`h-full rounded-full transition-all duration-500 ${over ? 'bg-red-400' : 'bg-gold/50'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Guest chips */}
      <div className="flex-1 p-3 flex flex-wrap gap-1.5 content-start">
        {guests.length === 0 && !isOver && (
          <p className="text-[10px] text-silver/60 dark:text-silver/55 w-full text-center mt-4">Drop guests here</p>
        )}
        {guests.map(g => (
          <div
            key={g._id}
            className="relative group"
            onMouseEnter={() => setHoverGuest(g._id)}
            onMouseLeave={() => setHoverGuest(null)}
          >
            <GuestChip guest={g} />
            {hoverGuest === g._id && (
              <button
                type="button"
                onClick={() => onUnassign(g._id)}
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[8px] leading-none flex items-center justify-center hover:bg-red-500 transition-colors z-10"
                title="Remove from table"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {isOver && (
          <div className="w-full flex items-center justify-center py-2">
            <span className="text-[10px] text-gold/60 animate-pulse">Release to seat here</span>
          </div>
        )}
      </div>
    </div>
  );
};
