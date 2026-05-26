import type { WeddingEvent } from '@/types/event';
import { STATUS_META } from '@/constants/events';
import { CheckIcon } from '@/components/icons';
import { toDisplayDate, toDisplayTime } from '@/utils/dateTime';

interface EventCardProps {
  event: WeddingEvent;
  onEdit: () => void;
  onConfirm: () => void;
}

export const EventCard = ({ event, onEdit, onConfirm }: EventCardProps) => {
  const meta         = STATUS_META[event.status];
  const isIncomplete = !event.venue || !event.time || !event.desc;

  return (
    <div
      className={`group relative flex flex-col bg-gradient-to-br from-[#1c2226] to-dark lift-deep overflow-hidden ${meta.glow}`}
    >
      {/* Per-status decorative background */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradFrom} to-transparent opacity-70`} />
        <div className={`absolute -top-10 -right-10 w-44 h-44 rounded-full ${meta.gradOrb}`} />
        <span className="absolute bottom-3 right-4 text-gold/[0.06] text-[5rem] font-black leading-none select-none">◆</span>
      </div>

      {/* Color bar */}
      <div className={`relative h-1 w-full shrink-0 ${meta.bar}`} />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-3.5 border-b border-gold/10 bg-gradient-to-r from-gold/5 to-transparent shrink-0">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${meta.dot}`} />
          <span className="text-sm font-bold text-background group-hover:text-gold transition-colors duration-200">
            {event.name}
          </span>
        </div>
        <span className={`text-[10px] font-bold px-2.5 py-1 uppercase tracking-widest tag-slide ${meta.badge}`}>
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="relative flex-1 px-5 pt-4 pb-3 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: '◆', label: 'Date',   value: event.date ? toDisplayDate(event.date) : '—' },
            { icon: '◎', label: 'Time',   value: event.time ? toDisplayTime(event.time) : '—' },
            { icon: '✉', label: 'Guests', value: `${event.guests}`                             },
          ].map(({ icon, label, value }) => (
            <div key={label} className="bg-black/20 border border-gold/10 px-3 py-3 text-center group-hover:border-gold/25 transition-colors duration-300">
              <p className="text-gold/80 text-[11px] mb-1.5">{icon}</p>
              <p className="text-background text-xs font-bold leading-tight">{value}</p>
              <p className="text-silver/35 text-[9px] uppercase tracking-widest mt-1">{label}</p>
            </div>
          ))}
        </div>

        {event.venue ? (
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-blush/10 to-transparent border-l-2 border-blush/50">
            <span className="text-blush">◎</span>
            <p className="text-xs font-semibold text-background">{event.venue}</p>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 px-3 py-2.5 border-l-2 border-silver/20">
            <span className="text-silver/30">◎</span>
            <p className="text-xs text-silver/30 italic">No venue set</p>
          </div>
        )}

        <p className="text-xs text-silver/50 leading-relaxed line-clamp-2">
          {event.desc || <span className="italic text-silver/25">No description</span>}
        </p>

        {isIncomplete && (
          <button
            type="button"
            onClick={onEdit}
            className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-dashed border-gold/40 bg-gold/5 hover:bg-gold/10 transition-colors group/incomplete"
          >
            <div className="flex items-center gap-2">
              <span className="text-gold text-[11px]">◆</span>
              <span className="text-[11px] font-semibold text-gold/80 group-hover/incomplete:text-gold">
                Complete event details
              </span>
            </div>
            <span className="text-[10px] font-bold text-gold/60 group-hover/incomplete:text-gold uppercase tracking-widest">
              Edit →
            </span>
          </button>
        )}
      </div>

      {/* Action row */}
      <div className="relative flex gap-0 divide-x divide-gold/10 border-t border-gold/10 shrink-0 mt-auto">
        <button
          onClick={onEdit}
          className="flex-1 py-2.5 text-[11px] font-bold text-blush hover:bg-blush/15 transition-all duration-200"
        >
          Edit ✎
        </button>
        {event.status !== 'confirmed' ? (
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-[11px] font-bold text-gold bg-black/20 hover:bg-gold hover:text-dark transition-all duration-200"
          >
            Confirm ✦
          </button>
        ) : (
          <div className="flex-1 py-2.5 text-[11px] font-bold text-gold bg-gold/8 text-center flex items-center justify-center gap-1">
            <CheckIcon size={10} className="text-gold" strokeWidth={1.8} />
            Done
          </div>
        )}
      </div>
    </div>
  );
};
