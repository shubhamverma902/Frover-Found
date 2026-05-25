import type { FC } from 'react';
import { STATUS_META } from '@/constants/vendors';
import { CheckIcon, StarIcon } from '@/components/icons';
import type { Vendor } from '@/constants/dashboard-pages';

interface Props {
  vendor: Vendor;
  onViewDetail: () => void;
  onEdit: () => void;
  onBook: () => void;
}

export const VendorCard: FC<Props> = ({ vendor: v, onViewDetail, onEdit, onBook }) => {
  const meta = STATUS_META[v.status];
  return (
    <div className={`group bg-card border border-silver dark:border-[#2a2f33] border-l-[3px] ${meta.stripe} overflow-hidden lift-deep shadow-crystal grad-border`}>
      <div className={`h-1 w-full ${meta.bar}`} />

      <div className="flex items-stretch gap-0 border-b border-silver dark:border-[#2a2f33]">
        <div className="w-16 bg-dark flex items-center justify-center text-3xl shrink-0 group-hover:bg-gold transition-colors duration-350 border-r border-gold/10">
          {v.icon}
        </div>
        <div className="flex-1 px-4 py-3.5 bg-gradient-to-r from-silver/10 dark:from-silver/5 to-transparent">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-dark dark:text-background group-hover:text-blush transition-colors">
                {v.name}
              </p>
              <p className="text-[10px] text-zinc-400 dark:text-silver/50 uppercase tracking-widest mt-0.5">{v.category}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span className={`text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${meta.badge}`}>
                {meta.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 mt-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} size={11} filled={i < v.rating}
                className={i < v.rating ? 'text-gold' : 'text-silver'} />
            ))}
            <span className="ml-1.5 text-[10px] font-semibold text-zinc-400 dark:text-silver/50">{v.rating}.0</span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3.5 space-y-2 border-b border-silver/50 dark:border-[#2a2f33]/50">
        <div className="flex items-center gap-2.5">
          <span className="text-blush text-xs w-4">✉</span>
          <span className="text-xs text-zinc-500 dark:text-silver/60 truncate">{v.contact || '—'}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="text-blush text-xs w-4">◎</span>
          <span className="text-xs text-zinc-500 dark:text-silver/60">{v.location || '—'}</span>
        </div>
      </div>

      <div className="flex gap-0 divide-x divide-silver dark:divide-[#2a2f33]">
        <button
          onClick={onViewDetail}
          className="flex-1 py-3 text-[11px] font-bold text-zinc-500 dark:text-silver/60 hover:bg-silver/15 dark:hover:bg-silver/8 hover:text-dark dark:hover:text-white transition-all duration-200"
        >
          View Details
        </button>
        <button
          onClick={onEdit}
          className="flex-1 py-3 text-[11px] font-bold text-zinc-500 dark:text-silver/60 hover:bg-silver/15 dark:hover:bg-silver/8 hover:text-dark dark:hover:text-white transition-all duration-200"
        >
          Edit ✎
        </button>
        {v.status !== 'booked' ? (
          <button
            onClick={onBook}
            className="flex-1 py-3 text-[11px] font-bold text-gold bg-dark hover:bg-gold hover:text-dark transition-all duration-250"
          >
            Book Now ✦
          </button>
        ) : (
          <div className="flex-1 py-3 text-[11px] font-bold text-gold bg-gold/8 text-center flex items-center justify-center gap-1">
            <CheckIcon size={11} className="text-gold" strokeWidth={2} />
            Confirmed
          </div>
        )}
      </div>
    </div>
  );
};
