'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/layout';
import { PATH } from '@/constants/path';
import { Form, Input } from '@/components/elements';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { LOGIN_PANEL_IMAGE, LOGIN_PANEL_TESTIMONIAL, PENDING_INVITE_TOKEN_KEY } from '@/constants/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError, selectIsAuthenticated, selectUser, selectAuthStatus, selectAuthError, selectAuthErrorCode } from '@/store/slices/authSlice';

const LoginPage = () => {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user            = useAppSelector(selectUser);
  const status          = useAppSelector(selectAuthStatus);
  const error           = useAppSelector(selectAuthError);
  const errorCode       = useAppSelector(selectAuthErrorCode);
  const isLocked        = errorCode === 429;

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect: if a pending invite was saved before login, go accept it first
  useEffect(() => {
    if (!isAuthenticated) return;
    const pendingToken = sessionStorage.getItem(PENDING_INVITE_TOKEN_KEY);
    if (pendingToken) {
      sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
      router.push(`${PATH.auth.acceptInvite}?token=${pendingToken}`);
      return;
    }
    router.push(user?.onboardingCompleted ? PATH.dashboard.base : PATH.onboarding);
  }, [isAuthenticated, user, router]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const loading  = status === 'loading';
  const disabled = loading || isLocked;

  return (
    <div className="relative min-h-screen">

      {/* Full-screen background — contained so glows don't cause scroll */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src={LOGIN_PANEL_IMAGE.src}
          alt={LOGIN_PANEL_IMAGE.alt}
          fill
          sizes="100vw"
          style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
          priority
          className="scale-105"
        />
        <div className="absolute inset-0 bg-dark/78" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-blush/6 blur-3xl pointer-events-none" />
      </div>

      {/* Logo — top left */}
      <div className="absolute top-6 left-8 z-20">
        <Logo size="md" theme="light" href={PATH.home} />
      </div>

      {/* Back — top right */}
      <div className="absolute top-7 right-8 z-20">
        <Link href={PATH.home} className="text-xs text-white/40 hover:text-white transition-colors duration-200">
          ← Back to Forever Found
        </Link>
      </div>

      {/* Scrollable content layer */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-[#FFF8F0] dark:bg-[#1E1840] border border-gold/50 shadow-2xl shadow-black/70 p-1 rounded-2xl">
          <div className="border border-gold/20 dark:border-gold/15 px-8 py-10 rounded-xl">

            {/* Top ornament */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-gold/40" />
              <span className="text-gold text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
              <div className="flex-1 h-px bg-gold/40" />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <p className="text-[10px] font-semibold text-zinc-400 dark:text-silver/65 tracking-[0.35em] uppercase mb-3">
                You are welcome back
              </p>
              <h1 className="text-3xl font-bold text-dark dark:text-white leading-tight">Sign In</h1>
              <p className="mt-2 text-sm text-zinc-400 dark:text-silver/65 leading-relaxed">
                Continue planning your dream celebration.
              </p>
            </div>

            {/* Lockout banner */}
            {isLocked && error && (
              <div role="alert" className="mb-5 px-4 py-3 border border-gold/50 bg-gold/8 dark:bg-gold/10 text-xs text-dark dark:text-white flex items-start gap-3">
                <span className="text-gold text-sm leading-none mt-px shrink-0">⊘</span>
                <div>
                  <p className="font-semibold mb-0.5">Account temporarily locked</p>
                  <p className="text-zinc-500 dark:text-silver/65 leading-relaxed">{error?.message}</p>
                </div>
              </div>
            )}

            {/* Regular error banner */}
            {!isLocked && error && (
              <div role="alert" className="mb-5 px-4 py-3 border border-blush/50 bg-blush/10 text-xs text-dark dark:text-white flex items-center justify-between gap-3">
                <span>{error.message}</span>
                <button aria-label="Dismiss error" onClick={() => dispatch(clearError())} className="shrink-0 text-blush hover:text-dark dark:hover:text-white transition-colors">✕</button>
              </div>
            )}

            {/* Form */}
            <Form onSubmit={handleSubmit}>
              <label className="block">
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest mb-1.5">
                  Email Address
                </span>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  width="100%"
                  height={48}
                  className="focus:border-dark dark:focus:border-gold/60 focus:ring-blush/30 dark:focus:ring-gold/20"
                />
              </label>

              <label className="block">
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest mb-1.5">
                  Password
                </span>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                    width="100%"
                    height={48}
                    className="focus:border-dark dark:focus:border-gold/60 focus:ring-blush/30 dark:focus:ring-gold/20 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-silver/60 hover:text-dark dark:hover:text-white transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </label>

              <div className="flex justify-end -mt-1">
                <Link href={PATH.auth.forgotPassword} className="text-xs text-blush hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={disabled}
                className="w-full h-12 bg-gold text-dark font-semibold text-sm hover:bg-gold/90 active:scale-95 transition-all duration-200 tracking-wide rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? 'Signing in…' : isLocked ? '⊛ Account Locked' : 'Sign In ❆'}
              </button>
            </Form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gold/25" />
              <span className="text-gold/40 text-[10px]">◆</span>
              <div className="flex-1 h-px bg-gold/25" />
            </div>

            {/* Switch to signup */}
            <p className="text-center text-sm text-zinc-400 dark:text-silver/65">
              New to Forever Found?{' '}
              <button
                onClick={() => router.push(PATH.auth.signup)}
                className="font-semibold text-dark dark:text-gold hover:underline"
              >
                Create an account →
              </button>
            </p>

            {/* Testimonial pull quote */}
            <div className="mt-7 pt-6 border-t border-silver dark:border-silver/25">
              <p className="text-xs text-zinc-400 dark:text-silver/60 italic text-center leading-relaxed">
                &ldquo;{LOGIN_PANEL_TESTIMONIAL.quote}&rdquo;
              </p>
              <p className="mt-2 text-center text-[10px] font-semibold text-blush tracking-widest uppercase">
                — {LOGIN_PANEL_TESTIMONIAL.author}
              </p>
            </div>

          </div>
        </div>

        {/* Estate line below card */}
        <p className="mt-5 text-center text-[10px] text-white/25 tracking-[0.3em] uppercase">
          Forever Found &nbsp;·&nbsp; Weddings Across India
        </p>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;
