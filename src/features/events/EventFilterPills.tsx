import type { WeddingEvent } from '@/types/event';

export type EventFilter = 'all' | WeddingEvent['status'];

interface FilterOption {
  value: EventFilter;
  label: string;
  count: number;
}

interface EventFilterPillsProps {
  filters: FilterOption[];
  activeFilter: EventFilter;
  onChange: (v: EventFilter) => void;
}

export const EventFilterPills = ({ filters, activeFilter, onChange }: EventFilterPillsProps) => (
  <div className="flex items-center gap-2 flex-wrap">
    {filters.map(({ value, label, count }) => (
      <button
        key={value}
        onClick={() => onChange(value)}
        className={`flex items-center gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
          activeFilter === value
            ? 'rounded-xl bg-gold text-dark'
            : 'rounded-xl bg-subtle dark:bg-[#1E1840] text-dark/60 dark:text-silver/80 hover:text-dark dark:hover:text-white border border-silver/30 dark:border-silver/20 hover:border-blush/50 dark:hover:border-gold/40'
        }`}
      >
        {label}
        <span className={`text-[10px] font-black px-1.5 py-0.5 min-w-[18px] text-center leading-none ${
          activeFilter === value ? 'rounded-md bg-dark/20 text-dark' : 'rounded-md bg-dark/8 dark:bg-white/8 text-silver dark:text-silver/65'
        }`}>
          {count}
        </span>
      </button>
    ))}
  </div>
);
