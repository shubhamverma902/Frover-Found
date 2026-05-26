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
          className="group bg-card rounded-2xl shadow-lg ring-1 ring-silver/20 dark:ring-white/5 p-5 lift-deep grad-border cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="text-xl text-blush">{guide.icon}</span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold border px-1.5 py-0.5 ${
                guide.tag === 'Popular'
                  ? 'rounded-lg border-gold/40 text-gold bg-gold/8'
                  : 'rounded-lg border-silver dark:border-[#3D3268] text-zinc-400 dark:text-silver/50'
              }`}>
                {guide.tag}
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-silver/50">{guide.time}</span>
            </div>
          </div>
          <h3 className="text-sm font-bold text-dark dark:text-white mb-1.5 group-hover:text-blush transition-colors">
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