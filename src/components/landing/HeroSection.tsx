import Link from 'next/link';
import { Carousel } from '@/components/ui';
import { CAROUSEL_IMAGES } from '@/constants/landing';

interface HeroSectionProps {
  primaryHref: string;
  primaryLabel: string;
}

export const HeroSection = ({ primaryHref, primaryLabel }: HeroSectionProps) => (
  <section className="relative h-screen min-h-[600px]">
    <div className="absolute inset-0">
      <Carousel images={CAROUSEL_IMAGES} className="h-full" />
    </div>

    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-[#23292E]/80 via-[#23292E]/40 to-[#23292E]/75 z-10 pointer-events-none" />

    {/* Hero content */}
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center text-white px-6 pt-16 pointer-events-none">
      <span className="animate-fade-in inline-flex items-center gap-2 mb-5 px-5 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-[#E4BC62]/40 text-[#E4BC62] text-sm font-medium">
        ✦ India&apos;s Most Trusted Wedding Planner
      </span>

      <h1 className="animate-fade-in-up-d1 text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl">
        Your Dream Wedding,{' '}
        <span className="text-[#E4BC62]">Perfectly Planned</span>
      </h1>

      <p className="animate-fade-in-up-d2 mt-6 text-lg sm:text-xl text-white/75 max-w-2xl leading-relaxed">
        From intimate ceremonies to grand celebrations across India, Forever Found
        crafts unforgettable love stories with care and elegance.
      </p>

      <div className="animate-fade-in-up-d3 mt-10 flex flex-col sm:flex-row gap-4 items-center pointer-events-auto">
        <Link
          href={primaryHref}
          className="px-8 py-4 rounded-full bg-[#E4BC62] hover:bg-[#E4BC62]/90 text-[#23292E] font-semibold text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-[#23292E]/30"
        >
          {primaryLabel}
        </Link>
        <a
          href="#gallery"
          className="px-8 py-4 rounded-full border border-[#E4BC62]/50 hover:bg-[#E4BC62]/10 text-[#E4BC62] font-semibold text-sm transition-all duration-200"
        >
          See Our Work
        </a>
      </div>
    </div>

    {/* Scroll indicator */}
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-float">
      <div className="w-6 h-10 rounded-full border-2 border-[#E4BC62]/50 flex items-start justify-center pt-2">
        <div className="w-1 h-2.5 rounded-full bg-[#E4BC62]/70" />
      </div>
    </div>
  </section>
);
