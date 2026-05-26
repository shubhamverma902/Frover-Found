'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Guest } from '@/types/guest';

const RSVP_DOT: Record<Guest['rsvp'], string> = {
  confirmed: 'bg-emerald-400',
  pending:   'bg-amber-400',
  declined:  'bg-red-400',
};

interface Props {
  guest:    Guest;
  overlay?: boolean;   // true when rendered inside DragOverlay
}

export const GuestChip = ({ guest, overlay = false }: Props) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: guest._id });

  const style = overlay
    ? undefined
    : { transform: CSS.Translate.toString(transform) };

  const initials = guest.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(overlay ? {} : { ...listeners, ...attributes })}
      className={[
        'flex items-center gap-2 px-2.5 py-1.5 bg-[#1c2226] border rounded-sm select-none transition-all',
        overlay
          ? 'border-gold/60 shadow-2xl shadow-black/60 cursor-grabbing rotate-1 scale-105'
          : isDragging
          ? 'border-gold/30 opacity-30 cursor-grabbing'
          : 'border-silver/15 hover:border-gold/40 cursor-grab active:cursor-grabbing',
      ].join(' ')}
    >
      <span className="w-5 h-5 rounded-full bg-gold/20 flex items-center justify-center text-[9px] font-black text-gold shrink-0">
        {initials}
      </span>
      <span className="text-[11px] font-semibold text-silver/80 truncate max-w-[100px]">{guest.name}</span>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${RSVP_DOT[guest.rsvp]}`} />
    </div>
  );
};
