import { HELP_CATEGORIES } from '@/constants/help';

interface HelpCategoriesProps {
  activeCategory: string;
  onChange: (cat: string) => void;
}

export const HelpCategories = ({ activeCategory, onChange }: HelpCategoriesProps) => (
  <div>
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-[#DDDED9]" />
      <p className="text-[10px] font-semibold text-[#E4BC62] uppercase tracking-[0.35em]">Browse Topics</p>
      <div className="h-px flex-1 bg-[#DDDED9]" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {HELP_CATEGORIES.map((cat) => (
        <button
          key={cat.title}
          onClick={() => onChange(cat.title)}
          className={`group text-left p-4 border lift-deep transition-all duration-200 ${
            activeCategory === cat.title
              ? 'bg-[#23292E] border-[#E4BC62]/30'
              : 'bg-card border-[#DDDED9] dark:border-[#2a2f33] hover:border-[#DFB3AE]'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <span className={`text-lg ${activeCategory === cat.title ? 'text-[#E4BC62]' : 'text-[#DFB3AE]'}`}>
              {cat.icon}
            </span>
            <span className={`text-[10px] font-bold border px-1.5 py-0.5 ${
              activeCategory === cat.title
                ? 'border-[#E4BC62]/30 text-[#E4BC62]'
                : 'border-[#DDDED9] dark:border-[#2a2f33] text-zinc-400 dark:text-[#DDDED9]/50'
            }`}>
              {cat.count}
            </span>
          </div>
          <p className={`text-sm font-bold ${activeCategory === cat.title ? 'text-white' : 'text-[#23292E] dark:text-[#FDFDF8]'}`}>
            {cat.title}
          </p>
          <p className={`text-[11px] mt-0.5 leading-snug ${activeCategory === cat.title ? 'text-[#DDDED9]/50' : 'text-zinc-400 dark:text-[#DDDED9]/50'}`}>
            {cat.desc}
          </p>
        </button>
      ))}
    </div>
  </div>
);
