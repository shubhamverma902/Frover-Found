export type Filter = 'all' | 'pending' | 'done';

interface FilterTabsProps {
  filter: Filter;
  onChange: (f: Filter) => void;
}

export const FilterTabs = ({ filter, onChange }: FilterTabsProps) => (
  <div className="flex gap-0 border border-[#DDDED9] dark:border-[#2a2f33] w-fit overflow-hidden">
    {(['all', 'pending', 'done'] as Filter[]).map((f, i) => (
      <button
        key={f}
        onClick={() => onChange(f)}
        className={`relative px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
          filter === f
            ? 'bg-[#23292E] text-[#E4BC62]'
            : 'text-zinc-400 dark:text-[#DDDED9]/50 hover:text-[#23292E] dark:hover:text-white hover:bg-[#DDDED9]/20 dark:hover:bg-[#DDDED9]/8'
        } ${i > 0 ? 'border-l border-[#DDDED9] dark:border-[#2a2f33]' : ''}`}
      >
        {filter === f && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E4BC62]" />
        )}
        {f}
      </button>
    ))}
  </div>
);
