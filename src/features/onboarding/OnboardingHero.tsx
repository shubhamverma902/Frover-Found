import { Logo } from '@/components/layout';

export const OnboardingHero = () => (
  <>
    <div className="mb-8">
      <Logo size="md" theme="dark" href="/" />
    </div>
    <div className="text-center mb-10 max-w-lg">
      <p className="text-[10px] font-semibold text-[#E4BC62] uppercase tracking-[0.35em] mb-2">
        One-time setup
      </p>
      <h1 className="text-3xl font-bold text-[#23292E]">Tell us about your wedding</h1>
      <p className="mt-2 text-sm text-zinc-400">
        We use this to personalise your planning experience. Takes under 2 minutes.
      </p>
    </div>
  </>
);
