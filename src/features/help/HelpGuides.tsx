import { HELP_GUIDES } from '@/constants/help';

export const HelpGuides = () => (
  <div>
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-silver" />
      <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.35em]">Quick-Start Guides</p>
      <div className="h-px flex-1 bg-silver" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {HELP_GUIDES.map((guide) => (
        <div
          key={guide.title}
          className="group bg-card border border-silver dark:border-[#2a2f33] p-5 lift-deep grad-border shadow-crystal cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="text-xl text-blush">{guide.icon}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold border px-1.5 py-0.5 ${
                guide.tag === 'Popular'
                  ? 'border-gold/40 text-gold bg-gold/8'
                  : 'border-silver dark:border-[#2a2f33] text-zinc-400 dark:text-silver/50'
              }`}>
                {guide.tag}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-silver/50">{guide.time}</span>
            </div>
          </div>
          <h3 className="text-sm font-bold text-dark dark:text-background mb-1.5 group-hover:text-blush transition-colors">
            {guide.title}
          </h3>
          <p className="text-xs text-zinc-400 dark:text-silver/50 leading-relaxed">{guide.desc}</p>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-blush group-hover:gap-2 transition-all">
            Read guide <span>→</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
