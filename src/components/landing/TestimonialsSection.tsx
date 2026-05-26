import Image from 'next/image';
import { TESTIMONIALS } from '@/constants/landing';

export const TestimonialsSection = () => (
  <section id="testimonials" className="py-24 px-6 bg-white dark:bg-[#0f1214]">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <span className="inline-block mb-3 text-sm font-semibold text-gold uppercase tracking-widest">
          Love Stories
        </span>
        <h2 className="text-4xl font-bold text-dark dark:text-white">Couples who trusted us</h2>
        <p className="mt-3 text-sm text-zinc-400 dark:text-silver/65 max-w-md mx-auto">
          Real words from real couples — unscripted, unfiltered.
        </p>
      </div>

      {/* Featured testimonial — full width */}
      <div className="relative mb-6 rounded-3xl border border-silver dark:border-silver/20 bg-silver/25 dark:bg-[#1E1840] px-8 py-10 lg:px-14 lg:py-12 overflow-hidden animate-fade-in-up">
        {/* Ghost avatar background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <Image
            src={TESTIMONIALS[0].avatar}
            alt=""
            fill
            sizes="100vw"
            style={{ objectFit: 'cover', objectPosition: 'top' }}
            className="opacity-[0.04] scale-110"
          />
        </div>

        <span className="pointer-events-none select-none absolute -top-5 left-6 text-[160px] leading-none text-gold/15 font-serif">&ldquo;</span>

        <div className="relative">
          <div className="flex gap-1 mb-5">
            {Array.from({ length: TESTIMONIALS[0].stars }).map((_, j) => (
              <span key={j} className="text-gold text-xl">★</span>
            ))}
          </div>

          <p className="text-xl lg:text-2xl text-dark dark:text-white leading-relaxed italic font-light max-w-4xl mb-8">
            &ldquo;{TESTIMONIALS[0].quote}&rdquo;
          </p>

          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 ring-2 ring-gold ring-offset-2 ring-offset-silver/25 dark:ring-offset-[#1E1840]">
              <Image src={TESTIMONIALS[0].avatar} alt={TESTIMONIALS[0].names} fill sizes="56px" style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <p className="font-bold text-dark dark:text-white">{TESTIMONIALS[0].names}</p>
              <p className="text-sm text-blush">{TESTIMONIALS[0].location}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Two supporting testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TESTIMONIALS.slice(1).map((t, i) => (
          <div
            key={i}
            className="card-hover animate-fade-in-up relative rounded-3xl border border-silver dark:border-silver/20 bg-white dark:bg-[#1E1840] px-7 py-8 overflow-hidden"
            style={{ animationDelay: `${(i + 1) * 0.15}s`, opacity: 0, animationFillMode: 'forwards' }}
          >
            <span className="pointer-events-none select-none absolute -top-3 left-4 text-[90px] leading-none text-gold/10 font-serif">&ldquo;</span>

            <div className="relative flex flex-col gap-4 h-full">
              <div className="flex gap-1">
                {Array.from({ length: t.stars }).map((_, j) => (
                  <span key={j} className="text-gold">★</span>
                ))}
              </div>

              <p className="text-sm text-zinc-600 dark:text-silver/65 leading-relaxed italic flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-silver dark:border-silver/20">
                <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-blush">
                  <Image src={t.avatar} alt={t.names} fill sizes="40px" style={{ objectFit: 'cover' }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">{t.names}</p>
                  <p className="text-xs text-blush">{t.location}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
