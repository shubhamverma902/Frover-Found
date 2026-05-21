import Link from 'next/link';

interface CtaSectionProps {
  ctaHref: string;
  ctaLabel: string;
}

export const CtaSection = ({ ctaHref, ctaLabel }: CtaSectionProps) => (
  <section
    id="contact"
    className="py-20 px-6 bg-[#23292E] relative overflow-hidden flex items-center justify-center"
  >
    {/* Ambient glows */}
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#E4BC62]/5 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[#DFB3AE]/7 blur-3xl pointer-events-none" />

    {/* Invitation card */}
    <div className="relative z-10 w-full max-w-xl animate-fade-in-up">
      <div className="bg-[#FDFDF8] border border-[#E4BC62]/50 shadow-2xl shadow-black/60 p-1">
        <div className="border border-[#E4BC62]/25 px-8 py-10 sm:px-12 sm:py-12 text-center">

          {/* Top ornament */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-[#E4BC62]/40" />
            <span className="text-[#E4BC62] text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/40" />
          </div>

          <p className="text-[10px] font-semibold text-zinc-400 tracking-[0.35em] uppercase mb-5">
            You are cordially invited to
          </p>

          <h2 className="text-4xl sm:text-5xl font-bold text-[#23292E] leading-tight">
            Begin Your
          </h2>
          <h2 className="text-4xl sm:text-5xl font-bold text-[#E4BC62] italic leading-tight mt-1 mb-5">
            Love Story
          </h2>

          <p className="text-sm text-zinc-500 leading-relaxed max-w-sm mx-auto mb-7">
            Let&apos;s create something extraordinary together. Tell us about your wedding — we&apos;ll handle every beautiful detail.
          </p>

          {/* Bottom ornament */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-[#E4BC62]/40" />
            <span className="text-[#E4BC62] text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/40" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={ctaHref}
              className="px-9 py-3.5 bg-[#23292E] text-white text-sm font-semibold hover:bg-[#23292E]/85 active:scale-95 transition-all duration-200 shadow-md shadow-[#23292E]/20"
            >
              {ctaLabel}
            </Link>
            <a
              href="#services"
              className="px-9 py-3.5 border border-[#DDDED9] text-[#23292E] text-sm font-semibold hover:border-[#DFB3AE] hover:bg-[#DDDED9]/40 active:scale-95 transition-all duration-200"
            >
              Explore Services
            </a>
          </div>

          <p className="mt-8 text-[10px] text-zinc-400 tracking-[0.3em] uppercase">
            Forever Found &nbsp;·&nbsp; Weddings Across India &nbsp;·&nbsp; Est. 2011
          </p>

        </div>
      </div>
    </div>
  </section>
);
