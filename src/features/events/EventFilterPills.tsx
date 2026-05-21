import type { WeddingEvent } from '@/constants/dashboard-pages';

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
            ? 'bg-[#E4BC62] text-[#23292E]'
            : 'bg-[#23292E] text-[#DDDED9]/60 hover:text-[#DDDED9] border border-[#E4BC62]/15 hover:border-[#E4BC62]/40'
        }`}
      >
        {label}
        <span className={`text-[10px] font-black px-1.5 py-0.5 min-w-[18px] text-center leading-none ${
          activeFilter === value ? 'bg-[#23292E]/20 text-[#23292E]' : 'bg-white/5 text-[#DDDED9]/40'
        }`}>
          {count}
        </span>
      </button>
    ))}
  </div>
);
