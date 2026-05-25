import { CONTACT_OPTIONS } from '@/constants/help';

export const ContactOptions = () => (
  <div>
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-silver" />
      <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.35em]">Still Need Help?</p>
      <div className="h-px flex-1 bg-silver" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CONTACT_OPTIONS.map((opt) => (
        <div key={opt.title} className="bg-dark border border-gold/15 p-6 flex flex-col gap-4">
          <div>
            <span className="text-2xl text-gold">{opt.icon}</span>
            <h3 className="mt-3 text-sm font-bold text-white">{opt.title}</h3>
            <p className="mt-1.5 text-xs text-silver/50 leading-relaxed">{opt.desc}</p>
          </div>
          <div className="mt-auto space-y-2">
            <button className="w-full py-2.5 text-xs font-semibold bg-gold text-dark hover:bg-gold/90 transition-colors">
              {opt.cta}
            </button>
            <p className="text-center text-[10px] text-silver/30">{opt.note}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
