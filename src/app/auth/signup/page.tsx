'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/layout';
import { PATH } from '@/constants/path';
import { Checkbox, Form, Input, Radio } from '@/components/elements';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { SIGNUP_PANEL_IMAGE, PENDING_INVITE_TOKEN_KEY } from '@/constants/auth';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signupUser, clearError, selectIsAuthenticated, selectUser, selectAuthStatus, selectAuthError } from '@/store/slices/authSlice';

const JOURNEY_STEPS = [
  {
    n: '01',
    title: 'Create your account',
    desc: 'Set up your free Forever Found profile in under a minute.',
  },
  {
    n: '02',
    title: 'Share your vision',
    desc: 'Tell us your wedding date, style, and guest count.',
  },
  {
    n: '03',
    title: 'Meet your planner',
    desc: 'Get matched with a dedicated wedding consultant.',
  },
  {
    n: '04',
    title: 'Start planning',
    desc: 'Access your dashboard and build your dream day.',
  },
];

const SignupPage = () => {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user            = useAppSelector(selectUser);
  const status          = useAppSelector(selectAuthStatus);
  const error           = useAppSelector(selectAuthError);

  const [name,         setName]         = useState('');
  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [plan,         setPlan]         = useState<'free' | 'premium'>('free');
  const [localError,   setLocalError]   = useState<string | null>(null);

  // If arriving from a collaborator invite, skip onboarding and go accept the invite
  useEffect(() => {
    if (!isAuthenticated) return;
    const pendingToken = sessionStorage.getItem(PENDING_INVITE_TOKEN_KEY);
    if (pendingToken) {
      sessionStorage.removeItem(PENDING_INVITE_TOKEN_KEY);
      router.push(`${PATH.auth.acceptInvite}?token=${pendingToken}&type=collab`);
      return;
    }
    router.push(user?.onboardingCompleted ? PATH.dashboard.base : PATH.onboarding);
  }, [isAuthenticated, user, router]);

  const handleSignup = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!name.trim())        return setLocalError('Name is required.');
    if (password.length < 12) return setLocalError('Password must be at least 12 characters.');
    dispatch(clearError());
    dispatch(signupUser({ name, email, password, plan }));
  };

  const loading = status === 'loading';

  return (
    <div className="min-h-screen flex">

      {/* ── Left — Journey timeline ── */}
      <div className="hidden lg:flex lg:w-5/12 relative flex-col justify-center bg-dark text-white overflow-hidden">

        {/* Faint background image */}
        <Image
          src={SIGNUP_PANEL_IMAGE.src}
          alt=""
          fill
          sizes="41vw"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          className="opacity-[0.07] scale-110"
        />

        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-gold/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-blush/8 blur-3xl pointer-events-none" />

        <div className="relative z-10 px-14 py-16">
          <Logo size="lg" theme="light" href={PATH.home} />

          <div className="mt-14">
            <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.35em] mb-10">
              Your Journey
            </p>

            {/* Timeline */}
            <div>
              {JOURNEY_STEPS.map((step, i) => (
                <div key={step.n} className="flex gap-5">
                  {/* Dot + connector line */}
                  <div className="flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-gold text-dark text-xs font-black flex items-center justify-center shrink-0 shadow-lg shadow-gold/20">
                      {step.n}
                    </div>
                    {i < JOURNEY_STEPS.length - 1 && (
                      <div className="w-px flex-1 bg-gradient-to-b from-gold/40 to-gold/10 my-1 min-h-[36px]" />
                    )}
                  </div>

                  {/* Step text */}
                  <div className={i < JOURNEY_STEPS.length - 1 ? 'pb-9' : ''}>
                    <p className="font-semibold text-white leading-tight">{step.title}</p>
                    <p className="text-sm text-silver/55 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom ornament */}
          <div className="flex items-center gap-3 mt-14">
            <div className="flex-1 h-px bg-silver/10" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-silver/10" />
          </div>
          <p className="mt-4 text-[10px] text-silver/55 tracking-[0.25em] uppercase">
            Est. 2011 &nbsp;·&nbsp; 500+ Weddings &nbsp;·&nbsp; 50+ Cities
          </p>
        </div>
      </div>

      {/* ── Right — Numbered form ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[#FFF8F0] dark:bg-[#1E1840] px-8 py-12 overflow-y-auto">

        {/* Mobile logo */}
        <div className="lg:hidden mb-10">
          <Logo size="md" theme="auto" href={PATH.home} />
        </div>

        <div className="w-full max-w-md animate-fade-in-up">

          {/* Header */}
          <div className="mb-10">
            <p className="text-[10px] font-semibold text-gold uppercase tracking-[0.35em] mb-3">
              Get Started Free
            </p>
            <h1 className="text-3xl font-bold text-dark dark:text-white">Create your account</h1>
            <p className="mt-2 text-sm text-zinc-400 dark:text-silver/65">Free forever. No credit card required.</p>
          </div>

          {/* Error message */}
          {(localError || error) && (
            <div role="alert" className="mb-6 px-4 py-3 border border-blush/50 bg-blush/10 text-xs text-dark dark:text-white flex items-center justify-between gap-3">
              <span>{localError ?? error?.message}</span>
              <button aria-label="Dismiss error" onClick={() => { setLocalError(null); dispatch(clearError()); }} className="shrink-0 text-blush hover:text-dark dark:hover:text-white transition-colors">✕</button>
            </div>
          )}

          <Form onSubmit={handleSignup}>

            {/* ── 01 Your Identity ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl font-black text-gold/35 leading-none tabular-nums">01</span>
                <div className="flex-1 h-px bg-silver dark:bg-silver/30" />
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest">
                  Your Identity
                </span>
              </div>
              <label className="block">
                <span className="block text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest mb-1.5">
                  Full Name
                </span>
                <Input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  width="100%"
                  height={48}
                  className="focus:border-dark dark:focus:border-gold/60 focus:ring-blush/30 dark:focus:ring-gold/20"
                />
              </label>
            </div>

            {/* ── 02 Account Security ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl font-black text-gold/35 leading-none tabular-nums">02</span>
                <div className="flex-1 h-px bg-silver dark:bg-silver/30" />
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest">
                  Account Security
                </span>
              </div>
              <div className="space-y-4">
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
                    <span className="ml-2 normal-case font-normal text-zinc-400/70 dark:text-silver/40">(min. 12 characters)</span>
                  </span>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="At least 12 characters"
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
              </div>
            </div>

            {/* ── 03 Your Plan ── */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-2xl font-black text-gold/35 leading-none tabular-nums">03</span>
                <div className="flex-1 h-px bg-silver dark:bg-silver/30" />
                <span className="text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest">
                  Your Plan
                </span>
              </div>
              <div className="border border-silver dark:border-silver/30 bg-white dark:bg-[#2A1F52] p-4 space-y-3 rounded-xl">
                <Radio
                  name="plan"
                  value="free"
                  label="Standard — Free forever"
                  defaultChecked
                  onChange={() => setPlan('free')}
                />
                <Radio
                  name="plan"
                  value="premium"
                  label="Premium — Full planning suite"
                  onChange={() => setPlan('premium')}
                />
              </div>
            </div>

            <Checkbox label="I agree to the Terms of Service and Privacy Policy" />

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gold text-dark font-semibold text-sm hover:bg-gold/90 active:scale-95 transition-all duration-200 tracking-wide rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? 'Creating account…' : 'Create my account \u2746'}
            </button>

          </Form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-7">
            <div className="flex-1 h-px bg-silver dark:bg-silver/30" />
            <span className="text-gold/40 text-[10px]">◆</span>
            <div className="flex-1 h-px bg-silver dark:bg-silver/30" />
          </div>

          <p className="text-center text-sm text-zinc-400 dark:text-silver/65">
            Already have an account?{' '}
            <button
              onClick={() => router.push(PATH.auth.login)}
              className="font-semibold text-dark dark:text-gold hover:underline"
            >
              Sign in →
            </button>
          </p>

          <div className="mt-6 text-center">
            <Link href={PATH.home} className="text-xs text-silver/60 hover:text-dark dark:hover:text-white transition-colors">
              ← Back to Forever Found
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;
