import { HELP_CATEGORIES } from '@/constants/help';

interface HelpCategoriesProps {
  activeCategory: string;
  onChange: (cat: string) => void;
}

export const HelpCategories = ({ activeCategory, onChange }: HelpCategoriesProps) => (
  <div>
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-silver" />
      <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.35em]">Browse Topics</p>
      <div className="h-px flex-1 bg-silver" />
    </div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {HELP_CATEGORIES.map((cat) => (
        <button
          key={cat.title}
          onClick={() => onChange(cat.title)}
          className={`group text-left p-4 border lift-deep transition-all duration-200 ${
            activeCategory === cat.title
              ? 'rounded-2xl bg-blush/12 dark:bg-[#1E1840] border-blush/40 dark:border-gold/30'
              : 'rounded-2xl bg-card border-silver dark:border-[#3D3268] hover:border-blush'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <span className={`text-lg ${activeCategory === cat.title ? 'text-gold' : 'text-blush'}`}>
              {cat.icon}
            </span>
            <span className={`text-[10px] font-bold border px-1.5 py-0.5 ${
              activeCategory === cat.title
                ? 'rounded-md border-gold/30 text-gold'
                : 'rounded-md border-silver dark:border-[#3D3268] text-zinc-400 dark:text-silver/50'
            }`}>
              {cat.count}
            </span>
          </div>
          <p className={`text-sm font-bold ${activeCategory === cat.title ? 'text-blush dark:text-white' : 'text-dark dark:text-white'}`}>
            {cat.title}
          </p>
          <p className={`text-[11px] mt-0.5 leading-snug ${activeCategory === cat.title ? 'text-silver/50' : 'text-zinc-400 dark:text-silver/50'}`}>
            {cat.desc}
          </p>
        </button>
      ))}
    </div>
  </div>
);