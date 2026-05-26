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
            ? 'bg-gold text-dark'
            : 'bg-dark text-silver/60 hover:text-silver border border-gold/15 hover:border-gold/40'
        }`}
      >
        {label}
        <span className={`text-[10px] font-black px-1.5 py-0.5 min-w-[18px] text-center leading-none ${
          activeFilter === value ? 'bg-dark/20 text-dark' : 'bg-white/5 text-silver/40'
        }`}>
          {count}
        </span>
      </button>
    ))}
  </div>
);
