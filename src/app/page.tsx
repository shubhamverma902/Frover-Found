'use client';

import { Header, Footer } from '@/components/layout';
import { PATH } from '@/constants/path';
import {
  HeroSection,
  ServicesSection,
  StatsSection,
  GallerySection,
  TestimonialsSection,
  CtaSection,
} from '@/components/landing';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectHydrated } from '@/store/slices/authSlice';

const Home = () => {
  const hydrated        = useAppSelector(selectHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const primaryHref  = hydrated && isAuthenticated ? PATH.dashboard.base : PATH.auth.signup;
  const primaryLabel = hydrated && isAuthenticated ? 'Go to Dashboard →' : 'Start Planning →';
  const ctaHref      = hydrated && isAuthenticated ? PATH.dashboard.base : PATH.auth.signup;
  const ctaLabel     = hydrated && isAuthenticated ? 'Go to Dashboard ✦' : 'Plan My Wedding ✦';

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1214] text-zinc-900 dark:text-white">
      <Header />
      <main>
        <HeroSection primaryHref={primaryHref} primaryLabel={primaryLabel} />
        <ServicesSection />
        <StatsSection />
        <GallerySection />
        <TestimonialsSection />
        <CtaSection ctaHref={ctaHref} ctaLabel={ctaLabel} />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
