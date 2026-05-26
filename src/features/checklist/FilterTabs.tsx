export type Filter = 'all' | 'pending' | 'done';

interface FilterTabsProps {
  filter: Filter;
  onChange: (f: Filter) => void;
}

export const FilterTabs = ({ filter, onChange }: FilterTabsProps) => (
  <div className="flex gap-0 rounded-xl ring-1 ring-silver/30 dark:ring-white/8 w-fit overflow-hidden">
    {(['all', 'pending', 'done'] as Filter[]).map((f, i) => (
      <button
        key={f}
        onClick={() => onChange(f)}
        className={`relative px-6 py-2.5 text-[11px] font-bold uppercase tracking-widest transition-all duration-200 ${
          filter === f
            ? 'bg-blush/15 dark:bg-[#1E1840] text-blush dark:text-gold'
            : 'text-zinc-400 dark:text-silver/50 hover:text-dark dark:hover:text-white hover:bg-silver/20 dark:hover:bg-silver/8'
        } ${i > 0 ? 'border-l border-silver dark:border-[#3D3268]' : ''}`}
      >
        {filter === f && (
          <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blush dark:bg-gold" />
        )}
        {f}
      </button>
    ))}
  </div>
);