import { CONTACT_OPTIONS } from '@/constants/help';
import { Button } from '@/components/elements';

export const ContactOptions = () => (
  <div>
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-silver" />
      <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.35em]">Still Need Help?</p>
      <div className="h-px flex-1 bg-silver" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CONTACT_OPTIONS.map((opt) => (
        <div key={opt.title} className="bg-card dark:bg-dark border border-silver/20 dark:border-gold/15 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <span className="text-2xl text-blush dark:text-gold">{opt.icon}</span>
            <h3 className="mt-3 text-sm font-bold text-dark dark:text-white">{opt.title}</h3>
            <p className="mt-1.5 text-xs text-silver dark:text-silver/50 leading-relaxed">{opt.desc}</p>
          </div>
          <div className="mt-auto space-y-2">
            <Button variant="gold-cta" className="w-full">{opt.cta}</Button>
            <p className="text-center text-[10px] text-silver dark:text-silver/30">{opt.note}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
