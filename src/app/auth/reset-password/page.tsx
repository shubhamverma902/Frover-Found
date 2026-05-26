'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Logo } from '@/components/layout';
import { PATH } from '@/constants/path';
import { Form, Input } from '@/components/elements';
import { EyeIcon, EyeOffIcon } from '@/components/icons';
import { LOGIN_PANEL_IMAGE } from '@/constants/auth';
import { resetPasswordApi } from '@/api/auth.api';

// Separated so useSearchParams() is inside a Suspense boundary (Next.js requirement)
const ResetPasswordForm = () => {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get('token') ?? '';

  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword,    setShowPassword]    = useState(false);
  const [showConfirm,     setShowConfirm]     = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState<string | null>(null);
  const [success,         setSuccess]         = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!token)                          return setError('Reset token is missing. Please request a new link.');
    if (password !== confirmPassword)    return setError('Passwords do not match.');
    if (password.length < 12)           return setError('Password must be at least 12 characters.');

    setLoading(true);
    setError(null);
    try {
      await resetPasswordApi({ token, password });
      setSuccess(true);
      setTimeout(() => router.push(PATH.auth.login), 2500);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">

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

      <div className="absolute top-6 left-8 z-20">
        <Logo size="md" theme="light" href={PATH.home} />
      </div>
      <div className="absolute top-7 right-8 z-20">
        <Link href={PATH.home} className="text-xs text-white/40 hover:text-white transition-colors duration-200">
          ← Back to Forever Found
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="bg-[#FFF8F0] dark:bg-[#1E1840] border border-gold/50 shadow-2xl shadow-black/70 p-1 rounded-2xl">
          <div className="border border-gold/20 dark:border-gold/15 px-8 py-10 rounded-xl">

            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-gold/40" />
              <span className="text-gold text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
              <div className="flex-1 h-px bg-gold/40" />
            </div>

            {success ? (
              <div className="text-center animate-fade-in-up">
                <div className="w-14 h-14 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto mb-5">
                  <span className="text-gold text-2xl">✓</span>
                </div>
                <h1 className="text-2xl font-bold text-dark dark:text-white mb-2">Password Reset</h1>
                <p className="text-sm text-zinc-400 dark:text-silver/65 leading-relaxed mb-1">
                  Your password has been updated successfully.
                </p>
                <p className="text-xs text-silver dark:text-silver/65">
                  Redirecting you to Sign In…
                </p>
              </div>
            ) : !token ? (
              <div className="text-center">
                <h1 className="text-2xl font-bold text-dark dark:text-white mb-3">Invalid Link</h1>
                <p className="text-sm text-zinc-400 dark:text-silver/65 leading-relaxed mb-6">
                  This reset link is missing or malformed. Please request a new one.
                </p>
                <Link
                  href={PATH.auth.forgotPassword}
                  className="text-sm font-semibold text-dark dark:text-gold hover:underline"
                >
                  Request a new reset link →
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <p className="text-[10px] font-semibold text-zinc-400 dark:text-silver/65 tracking-[0.35em] uppercase mb-3">
                    Account Recovery
                  </p>
                  <h1 className="text-3xl font-bold text-dark dark:text-white leading-tight">Set New Password</h1>
                  <p className="mt-2 text-sm text-zinc-400 dark:text-silver/65 leading-relaxed">
                    Choose a strong password for your account.
                  </p>
                </div>

                {error && (
                  <div role="alert" className="mb-5 px-4 py-3 border border-blush/50 bg-blush/10 text-xs text-dark dark:text-white flex items-center justify-between gap-3">
                    <span>{error}</span>
                    <button
                      aria-label="Dismiss error"
                      onClick={() => setError(null)}
                      className="shrink-0 text-blush hover:text-dark dark:hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <Form onSubmit={handleSubmit}>
                  <label className="block">
                    <span className="block text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest mb-1.5">
                      New Password
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

                  <label className="block">
                    <span className="block text-[10px] font-semibold text-zinc-400 dark:text-silver/65 uppercase tracking-widest mb-1.5">
                      Confirm Password
                    </span>
                    <div className="relative">
                      <Input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                        width="100%"
                        height={48}
                        className="focus:border-dark dark:focus:border-gold/60 focus:ring-blush/30 dark:focus:ring-gold/20 pr-11"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-silver/60 hover:text-dark dark:hover:text-white transition-colors"
                        aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      >
                        {showConfirm ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </label>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-gold text-dark font-semibold text-sm hover:bg-gold/90 active:scale-95 transition-all duration-200 tracking-wide rounded-xl disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {loading ? 'Updating…' : 'Reset Password ✦'}
                  </button>
                </Form>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-gold/25" />
                  <span className="text-gold/40 text-[10px]">◆</span>
                  <div className="flex-1 h-px bg-gold/25" />
                </div>

                <p className="text-center text-sm text-zinc-400 dark:text-silver/65">
                  Remember your password?{' '}
                  <Link href={PATH.auth.login} className="font-semibold text-dark dark:text-gold hover:underline">
                    Sign in →
                  </Link>
                </p>
              </>
            )}

          </div>
        </div>

        <p className="mt-5 text-center text-[10px] text-white/25 tracking-[0.3em] uppercase">
          Forever Found &nbsp;·&nbsp; Weddings Across India
        </p>
      </div>
      </div>
    </div>
  );
};

const ResetPasswordPage = () => (
  <Suspense fallback={<div className="min-h-screen bg-dark" />}>
    <ResetPasswordForm />
  </Suspense>
);

export default ResetPasswordPage;
