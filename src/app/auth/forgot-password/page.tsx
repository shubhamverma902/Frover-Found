'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Logo } from '@/components/layout';
import { PATH } from '@/constants/path';
import { Form, Input } from '@/components/elements';
import { LOGIN_PANEL_IMAGE } from '@/constants/auth';
import { forgotPasswordApi } from '@/api/auth.api';
import type { ForgotPasswordResult } from '@/api/auth.api';

const ForgotPasswordPage = () => {
  const [email,   setEmail]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [result,  setResult]  = useState<ForgotPasswordResult | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await forgotPasswordApi({ email });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      <Image
        src={LOGIN_PANEL_IMAGE.src}
        alt={LOGIN_PANEL_IMAGE.alt}
        fill
        sizes="100vw"
        style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
        priority
        className="scale-105"
      />
      <div className="absolute inset-0 bg-[#23292E]/78" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#E4BC62]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-[#DFB3AE]/6 blur-3xl pointer-events-none" />

      <div className="absolute top-6 left-8 z-20">
        <Logo size="md" theme="light" href={PATH.home} />
      </div>
      <div className="absolute top-7 right-8 z-20">
        <Link href={PATH.home} className="text-xs text-white/40 hover:text-white transition-colors duration-200">
          ← Back to Forever Found
        </Link>
      </div>

      <div className="relative z-10 w-full max-w-md px-5 py-8 animate-fade-in-up">
        <div className="bg-[#FDFDF8] border border-[#E4BC62]/50 shadow-2xl shadow-black/70 p-1">
          <div className="border border-[#E4BC62]/20 px-8 py-10">

            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-[#E4BC62]/40" />
              <span className="text-[#E4BC62] text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
              <div className="flex-1 h-px bg-[#E4BC62]/40" />
            </div>

            {result ? (
              <div className="text-center animate-fade-in-up">
                <div className="w-14 h-14 rounded-full bg-[#E4BC62]/10 border border-[#E4BC62]/30 flex items-center justify-center mx-auto mb-5">
                  <span className="text-[#E4BC62] text-2xl">✉</span>
                </div>
                <h1 className="text-2xl font-bold text-[#23292E] mb-2">Reset Link Ready</h1>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6">
                  Your password reset link has been generated. Use it within 1 hour.
                </p>

                <div className="bg-[#F5F5F0] border border-[#DDDED9] px-4 py-3 text-left mb-6">
                  <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Reset Link
                  </p>
                  <a
                    href={result.resetUrl}
                    className="text-xs text-[#23292E] break-all hover:text-[#E4BC62] transition-colors font-mono leading-relaxed"
                  >
                    {result.resetUrl}
                  </a>
                  <p className="text-[10px] text-zinc-300 mt-2">
                    Expires at {new Date(result.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <p className="text-xs text-zinc-300 italic mb-6">
                  Note: Once email delivery is configured, this link will be sent to your inbox automatically.
                </p>

                <Link
                  href={PATH.auth.login}
                  className="text-sm font-semibold text-[#23292E] hover:underline"
                >
                  ← Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <p className="text-[10px] font-semibold text-zinc-400 tracking-[0.35em] uppercase mb-3">
                    Account Recovery
                  </p>
                  <h1 className="text-3xl font-bold text-[#23292E] leading-tight">Forgot Password?</h1>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
                    Enter your email and we&rsquo;ll generate a secure reset link.
                  </p>
                </div>

                {error && (
                  <div role="alert" className="mb-5 px-4 py-3 border border-[#DFB3AE]/50 bg-[#DFB3AE]/10 text-xs text-[#23292E] flex items-center justify-between gap-3">
                    <span>{error}</span>
                    <button
                      aria-label="Dismiss error"
                      onClick={() => setError(null)}
                      className="shrink-0 text-[#DFB3AE] hover:text-[#23292E] transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                )}

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

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#23292E] text-white font-semibold text-sm hover:bg-[#23292E]/85 active:scale-95 transition-all duration-200 tracking-wide disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {loading ? 'Generating…' : 'Send Reset Link ✦'}
                  </button>
                </Form>

                <div className="flex items-center gap-3 my-6">
                  <div className="flex-1 h-px bg-[#E4BC62]/25" />
                  <span className="text-[#E4BC62]/40 text-[10px]">◆</span>
                  <div className="flex-1 h-px bg-[#E4BC62]/25" />
                </div>

                <p className="text-center text-sm text-zinc-400">
                  Remember your password?{' '}
                  <Link href={PATH.auth.login} className="font-semibold text-[#23292E] hover:underline">
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
  );
};

export default ForgotPasswordPage;
