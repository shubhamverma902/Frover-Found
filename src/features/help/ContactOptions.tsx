import { CONTACT_OPTIONS } from '@/constants/help';

export const ContactOptions = () => (
  <div>
    <div className="flex items-center gap-4 mb-5">
      <div className="h-px flex-1 bg-[#DDDED9]" />
      <p className="text-[10px] font-semibold text-[#E4BC62] uppercase tracking-[0.35em]">Still Need Help?</p>
      <div className="h-px flex-1 bg-[#DDDED9]" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {CONTACT_OPTIONS.map((opt) => (
        <div key={opt.title} className="bg-[#23292E] border border-[#E4BC62]/15 p-6 flex flex-col gap-4">
          <div>
            <span className="text-2xl text-[#E4BC62]">{opt.icon}</span>
            <h3 className="mt-3 text-sm font-bold text-white">{opt.title}</h3>
            <p className="mt-1.5 text-xs text-[#DDDED9]/50 leading-relaxed">{opt.desc}</p>
          </div>
          <div className="mt-auto space-y-2">
            <button className="w-full py-2.5 text-xs font-semibold bg-[#E4BC62] text-[#23292E] hover:bg-[#E4BC62]/90 transition-colors">
              {opt.cta}
            </button>
            <p className="text-center text-[10px] text-[#DDDED9]/30">{opt.note}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);
