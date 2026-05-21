import { SearchIcon } from '@/components/icons';

interface HelpSearchHeroProps {
  search: string;
  onChange: (v: string) => void;
}

export const HelpSearchHero = ({ search, onChange }: HelpSearchHeroProps) => (
  <div className="bg-[#23292E] border border-[#E4BC62]/15 px-6 py-8 flex flex-col items-center text-center gap-4">
    <div className="flex items-center gap-3 mb-1">
      <div className="flex-1 h-px bg-[#E4BC62]/20" />
      <span className="text-[#E4BC62]/40 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
      <div className="flex-1 h-px bg-[#E4BC62]/20" />
    </div>
    <h2 className="text-2xl font-bold text-white">How can we help you?</h2>
    <p className="text-sm text-[#DDDED9]/50 max-w-md">Search our knowledge base or browse categories below</p>
    <div className="relative w-full max-w-lg mt-1">
      <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DDDED9]/40" />
      <input
        type="text"
        placeholder="Search for answers…"
        value={search}
        onChange={e => onChange(e.target.value)}
        className="w-full h-11 pl-10 pr-4 text-sm bg-[#DDDED9]/8 border border-[#DDDED9]/15 text-white placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/50 transition-colors"
      />
    </div>
  </div>
);
