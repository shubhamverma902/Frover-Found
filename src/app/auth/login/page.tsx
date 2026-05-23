'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/layout';
import { PATH } from '@/constants/path';
import { Form, Input } from '@/components/elements';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { LOGIN_PANEL_IMAGE, LOGIN_PANEL_TESTIMONIAL } from '@/constants/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError, selectIsAuthenticated, selectUser, selectAuthStatus, selectAuthError } from '@/store/slices/authSlice';

const LoginPage = () => {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user            = useAppSelector(selectUser);
  const status          = useAppSelector(selectAuthStatus);
  const error           = useAppSelector(selectAuthError);

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect: if a pending invite was saved before login, go accept it first
  useEffect(() => {
    if (!isAuthenticated) return;
    const pendingToken = sessionStorage.getItem('pendingInviteToken');
    if (pendingToken) {
      sessionStorage.removeItem('pendingInviteToken');
      router.push(`${PATH.auth.acceptInvite}?token=${pendingToken}`);
      return;
    }
    router.push(user?.onboardingCompleted ? PATH.dashboard.base : PATH.onboarding);
  }, [isAuthenticated, user, router]);

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  const loading = status === 'loading';

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Full-screen background image */}
      <Image
        src={LOGIN_PANEL_IMAGE.src}
        alt={LOGIN_PANEL_IMAGE.alt}
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        priority
        className="scale-105"
      />

      {/* Dark charcoal overlay */}
      <div className="absolute inset-0 bg-[#23292E]/78" />

      {/* Ambient glow — top right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#E4BC62]/5 blur-3xl pointer-events-none" />
      {/* Ambient glow — bottom left */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#DFB3AE]/6 blur-3xl pointer-events-none" />

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

      {/* Invitation card */}
      <div className="relative z-10 w-full max-w-md px-5 py-8 animate-fade-in-up">
        <div className="bg-[#FDFDF8] border border-[#E4BC62]/50 shadow-2xl shadow-black/70 p-1">
          <div className="border border-[#E4BC62]/20 px-8 py-10">

            {/* Top ornament */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-[#E4BC62]/40" />
              <span className="text-[#E4BC62] text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
              <div className="flex-1 h-px bg-[#E4BC62]/40" />
            </div>

            {/* Heading */}
            <div className="text-center mb-8">
              <p className="text-[10px] font-semibold text-zinc-400 tracking-[0.35em] uppercase mb-3">
                You are welcome back
              </p>
              <h1 className="text-3xl font-bold text-[#23292E] leading-tight">Sign In</h1>
              <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                Continue planning your dream celebration.
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-5 px-4 py-3 border border-[#DFB3AE]/50 bg-[#DFB3AE]/10 text-xs text-[#23292E] flex items-center justify-between gap-3">
                <span>{error}</span>
                <button onClick={() => dispatch(clearError())} className="shrink-0 text-[#DFB3AE] hover:text-[#23292E] transition-colors">✕</button>
              </div>
            )}

            {/* Form */}
            <Form onSubmit={handleSubmit}>
              <label className="block">
                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </span>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  width="100%"
                  height={48}
                  className="focus:border-[#23292E] focus:ring-[#DFB3AE]/30"
                />
              </label>

              <label className="block">
                <span className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
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
                    className="focus:border-[#23292E] focus:ring-[#DFB3AE]/30 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#23292E] transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                  </button>
                </div>
              </label>

              <div className="flex justify-end -mt-1">
                <a href="#" className="text-xs text-[#DFB3AE] hover:underline font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#23292E] text-white font-semibold text-sm hover:bg-[#23292E]/85 active:scale-95 transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? 'Signing in…' : 'Sign In \u2746'}
              </button>
            </Form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#E4BC62]/25" />
              <span className="text-[#E4BC62]/40 text-[10px]">◆</span>
              <div className="flex-1 h-px bg-[#E4BC62]/25" />
            </div>

            {/* Switch to signup */}
            <p className="text-center text-sm text-zinc-400">
              New to Forever Found?{' '}
              <button
                onClick={() => router.push(PATH.auth.signup)}
                className="font-semibold text-[#23292E] hover:underline"
              >
                Create an account →
              </button>
            </p>

            {/* Testimonial pull quote */}
            <div className="mt-7 pt-6 border-t border-[#DDDED9]">
              <p className="text-xs text-zinc-400 italic text-center leading-relaxed">
                &ldquo;{LOGIN_PANEL_TESTIMONIAL.quote}&rdquo;
              </p>
              <p className="mt-2 text-center text-[10px] font-semibold text-[#DFB3AE] tracking-widest uppercase">
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
  );
};

export default LoginPage;
