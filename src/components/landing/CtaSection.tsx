import Link from 'next/link';

interface CtaSectionProps {
  ctaHref: string;
  ctaLabel: string;
}

export const CtaSection = ({ ctaHref, ctaLabel }: CtaSectionProps) => (
  <section
    id="contact"
    className="py-20 px-6 bg-dark relative overflow-hidden flex items-center justify-center"
  >
    {/* Ambient glows */}
    <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-blush/7 blur-3xl pointer-events-none" />

    {/* Invitation card */}
    <div className="relative z-10 w-full max-w-xl animate-fade-in-up">
      <div className="bg-[#FFF8F0] dark:bg-[#1E1840] border border-gold/50 shadow-2xl shadow-black/60 p-1 rounded-2xl">
        <div className="border border-gold/25 dark:border-gold/15 px-8 py-10 sm:px-12 sm:py-12 text-center rounded-xl">

          {/* Top ornament */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-px bg-gold/40" />
            <span className="text-gold text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/40" />
          </div>

          <p className="text-[10px] font-semibold text-zinc-400 dark:text-silver/65 tracking-[0.35em] uppercase mb-5">
            You are cordially invited to
          </p>

          <h2 className="text-4xl sm:text-5xl font-bold text-dark dark:text-white leading-tight">
            Begin Your
          </h2>
          <h2 className="text-4xl sm:text-5xl font-bold text-gold italic leading-tight mt-1 mb-5">
            Love Story
          </h2>

          <p className="text-sm text-zinc-500 dark:text-silver/65 leading-relaxed max-w-sm mx-auto mb-7">
            Let&apos;s create something extraordinary together. Tell us about your wedding — we&apos;ll handle every beautiful detail.
          </p>

          {/* Bottom ornament */}
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 h-px bg-gold/40" />
            <span className="text-gold text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/40" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={ctaHref}
              className="px-9 py-3.5 bg-gold text-dark text-sm font-semibold hover:bg-gold/90 active:scale-95 transition-all duration-200 shadow-md shadow-dark/20 rounded-full"
            >
              {ctaLabel}
            </Link>
            <a
              href="#services"
              className="px-9 py-3.5 border border-silver dark:border-silver/40 text-dark dark:text-white text-sm font-semibold hover:border-blush dark:hover:border-blush/60 hover:bg-silver/40 dark:hover:bg-white/5 active:scale-95 transition-all duration-200 rounded-full"
            >
              Explore Services
            </a>
          </div>

          <p className="mt-8 text-[10px] text-zinc-400 dark:text-silver/65 tracking-[0.3em] uppercase">
            Forever Found &nbsp;·&nbsp; Weddings Across India &nbsp;·&nbsp; Est. 2011
          </p>

        </div>
      </div>
    </div>
  </section>
);
