import { SearchIcon } from '@/components/icons';

interface HelpSearchHeroProps {
  search: string;
  onChange: (v: string) => void;
}

export const HelpSearchHero = ({ search, onChange }: HelpSearchHeroProps) => (
  <div className="bg-card dark:bg-[#2A1F52] rounded-2xl border border-blush/20 dark:border-gold/15 px-6 py-8 flex flex-col items-center text-center gap-4">
    <div className="flex items-center gap-3 mb-1">
      <div className="flex-1 h-px bg-blush/20 dark:bg-gold/20" />
      <span className="text-blush/40 dark:text-gold/40 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
      <div className="flex-1 h-px bg-blush/20 dark:bg-gold/20" />
    </div>
    <h2 className="text-2xl font-bold text-dark dark:text-white">How can we help you?</h2>
    <p className="text-sm text-silver dark:text-silver/50 max-w-md">Search our knowledge base or browse categories below</p>
    <div className="relative w-full max-w-lg mt-1">
      <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-silver/40" />
      <input
        type="text"
        placeholder="Search for answers…"
        value={search}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 pl-10 pr-4 text-sm rounded-xl bg-subtle dark:bg-silver/8 border border-silver/20 dark:border-silver/15 text-dark dark:text-white placeholder:text-silver/50 focus:outline-none focus:border-blush/50 dark:focus:border-gold/50 transition-colors"
      />
    </div>
  </div>
);
