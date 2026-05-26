'use client';

import { useDroppable } from '@dnd-kit/core';
import type { Guest } from '@/types/guest';
import { GuestChip } from './GuestChip';

interface Props {
  guests: Guest[];
  total:  number;
}

export const GuestPool = ({ guests, total }: Props) => {
  const { isOver, setNodeRef } = useDroppable({ id: 'pool' });

  const assigned = total - guests.length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gold/50 text-[9px]">◈</span>
        <p className="text-[10px] font-bold text-dark/50 dark:text-silver/50 uppercase tracking-[0.35em]">Unassigned</p>
        <span className="text-[9px] text-dark/30 dark:text-silver/25 border border-dark/15 dark:border-silver/15 px-1.5 py-0.5 ml-auto">
          {guests.length} / {total}
        </span>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="h-[2px] bg-silver/8 mb-4">
          <div
            className="h-full bg-gold/50 transition-all duration-500"
            style={{ width: `${Math.round((assigned / total) * 100)}%` }}
          />
        </div>
      )}

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={[
          'flex-1 rounded-sm border-2 border-dashed p-3 flex flex-col gap-1.5 transition-colors min-h-[120px]',
          isOver
            ? 'border-gold/50 bg-gold/5'
            : 'border-silver/10',
        ].join(' ')}
      >
        {guests.length === 0 ? (
          <p className="text-[10px] text-dark/25 dark:text-silver/20 text-center mt-6">
            {total === 0 ? 'No guests added yet' : 'All guests seated ✓'}
          </p>
        ) : (
          guests.map(g => <GuestChip key={g._id} guest={g} />)
        )}
        {isOver && (
          <p className="text-[10px] text-gold/60 text-center animate-pulse mt-1">
            Release to unassign
          </p>
        )}
      </div>

      <p className="text-[9px] text-dark/25 dark:text-silver/20 mt-2 text-center">Drag guests to a table</p>
    </div>
  );
};
