'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '@/components/layout';
import { PATH } from '@/constants/path';
import { AUTH_PANEL_IMAGE, AUTH_PANEL_STATS } from '@/constants/auth';

const AuthPage = () => {
  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center bg-dark text-white p-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gold/8 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-blush/10 blur-3xl" />

        <div className="relative z-10 text-center max-w-md">
          <div className="mb-10 flex justify-center">
            <Logo size="lg" theme="light" href={PATH.home} />
          </div>

          <div className="relative w-72 h-72 mx-auto mb-8 rounded-3xl overflow-hidden shadow-2xl shadow-black/40 animate-float ring-2 ring-gold/40">
            <Image src={AUTH_PANEL_IMAGE.src} alt={AUTH_PANEL_IMAGE.alt} fill sizes="288px" style={{ objectFit: 'cover' }} />
          </div>

          <h2 className="text-3xl font-bold mb-3">Your dream wedding awaits</h2>
          <p className="text-white/70 leading-relaxed">
            Join thousands of couples across India who trusted Forever Found to plan their perfect day.
          </p>

          <div className="mt-8 flex justify-center gap-6 text-sm text-white/60">
            {AUTH_PANEL_STATS.map((stat, i) => (
              <>
                {i > 0 && <div key={`d-${i}`} className="w-px bg-silver/20" />}
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-gold">{stat.value}</p>
                  <p>{stat.label}</p>
                </div>
              </>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white dark:bg-[#1E1840] px-6 py-12">
        <div className="lg:hidden mb-10">
          <Logo size="md" theme="auto" href={PATH.home} />
        </div>

        <div className="w-full max-w-sm animate-fade-in-up">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-2">Welcome</p>
            <h1 className="text-3xl font-bold text-dark dark:text-white">Let&apos;s get started</h1>
            <p className="mt-2 text-sm text-zinc-500 dark:text-silver/65">Login to your account or create a new one to begin planning.</p>
          </div>

          <div className="flex flex-col gap-4">
            <Link
              href={PATH.auth.signup}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gold text-dark font-semibold text-sm hover:bg-gold/90 active:scale-95 transition-all duration-200 shadow-md shadow-dark/15"
            >
              ✦ Create an account
            </Link>
            <Link
              href={PATH.auth.login}
              className="flex items-center justify-center w-full py-4 rounded-2xl border border-silver dark:border-silver/40 text-dark dark:text-white font-semibold text-sm hover:border-blush hover:bg-silver/30 dark:hover:border-blush/60 dark:hover:bg-white/5 active:scale-95 transition-all duration-200"
            >
              Login to my account
            </Link>
          </div>

          <p className="mt-8 text-center text-xs text-zinc-400 dark:text-silver/60">
            By continuing, you agree to Forever Found&apos;s{' '}
            <a href="#" className="text-blush hover:underline">Terms of Service</a>{' '}
            &amp;{' '}
            <a href="#" className="text-blush hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
