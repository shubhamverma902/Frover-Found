'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Logo } from '@/components/layout';
import { PATH } from '@/constants/path';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated, selectHydrated, restoreAuth } from '@/store/slices/authSlice';
import { useAcceptInviteMutation, useAcceptCollaboratorInviteMutation } from '@/store/api';
import { setAccessToken } from '@/api/tokenStore';

type Outcome = 'idle' | 'success' | 'error';

const AcceptInvitePage = () => {
  const router       = useRouter();
  const params       = useSearchParams();
  const token        = params.get('token') ?? '';
  const isCollab     = params.get('type') === 'collab';

  const dispatch        = useAppDispatch();
  const hydrated        = useAppSelector(selectHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [acceptPartner, { isLoading: acceptingPartner }] = useAcceptInviteMutation();
  const [acceptCollab,  { isLoading: acceptingCollab }]  = useAcceptCollaboratorInviteMutation();
  const accepting = isCollab ? acceptingCollab : acceptingPartner;

  const [outcome, setOutcome] = useState<Outcome>('idle');
  const [errMsg,  setErrMsg]  = useState('');

  // Derive the visual stage — no setState inside effects
  const stage =
    outcome === 'success'           ? 'success'
    : outcome === 'error'           ? 'error'
    : !hydrated                     ? 'loading'
    : !token                        ? 'error'
    : !isAuthenticated              ? 'unauthenticated'
    :                                 'confirm';

  // Side-effect only: save token to sessionStorage so login/signup can redirect back
  useEffect(() => {
    if (hydrated && !isAuthenticated && token) {
      sessionStorage.setItem('pendingInviteToken', token);
    }
  }, [hydrated, isAuthenticated, token]);

  const handleAccept = async () => {
    try {
      const result = isCollab
        ? await acceptCollab({ token }).unwrap()
        : await acceptPartner({ token }).unwrap();
      setAccessToken(result.token);
      // Refresh Redux auth state so onboardingCompleted + collaboratorRole are current
      await dispatch(restoreAuth());
      setOutcome('success');
    } catch (err: any) {
      setErrMsg(err?.data?.message ?? 'Failed to accept invite. The link may have expired.');
      setOutcome('error');
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#23292E]">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-[#E4BC62]/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#DFB3AE]/5 blur-3xl pointer-events-none" />

      <div className="absolute top-6 left-8 z-20">
        <Logo size="md" theme="light" href={PATH.home} />
      </div>

      <div className="relative z-10 w-full max-w-md px-5 py-8 animate-fade-in-up">
        <div className="bg-[#FDFDF8] border border-[#E4BC62]/50 shadow-2xl shadow-black/70 p-1">
          <div className="border border-[#E4BC62]/20 px-8 py-10 text-center">

            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-px bg-[#E4BC62]/40" />
              <span className="text-[#E4BC62] text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
              <div className="flex-1 h-px bg-[#E4BC62]/40" />
            </div>

            {stage === 'loading' && (
              <p className="text-sm text-zinc-400">Checking invite…</p>
            )}

            {stage === 'unauthenticated' && (
              <>
                <div className="text-4xl mb-4">♡</div>
                <h1 className="text-2xl font-bold text-[#23292E] mb-2">You've been invited!</h1>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Log in (or create an account) to accept the invite and join the wedding plan.
                </p>
                <Link
                  href={PATH.auth.login}
                  className="block w-full h-12 bg-[#23292E] text-white font-semibold text-sm hover:bg-[#23292E]/85 transition-all leading-[3rem]"
                >
                  Log In to Accept ✦
                </Link>
                <p className="mt-4 text-xs text-zinc-400">
                  No account yet?{' '}
                  <Link href={PATH.auth.signup} className="font-semibold text-[#23292E] hover:underline">
                    Sign up →
                  </Link>
                </p>
              </>
            )}

            {stage === 'confirm' && (
              <>
                <div className="text-4xl mb-4">{isCollab ? '👥' : '♡'}</div>
                <h1 className="text-2xl font-bold text-[#23292E] mb-2">
                  {isCollab ? 'Collaborator Invite' : 'Partner Invite'}
                </h1>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  {isCollab
                    ? 'Accept this invite to access the wedding plan. Your role will determine what you can see and change.'
                    : "Accept this invite to link your account. You'll both share the same wedding plan, guest list, budget, and checklist."}
                </p>
                <button
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full h-12 bg-[#23292E] text-white font-semibold text-sm hover:bg-[#23292E]/85 disabled:opacity-60 transition-all mb-3"
                >
                  {accepting ? 'Linking…' : 'Accept & Link Accounts ✦'}
                </button>
                <Link href={PATH.dashboard.base} className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors">
                  Cancel — go to my dashboard
                </Link>
              </>
            )}

            {stage === 'success' && (
              <>
                <div className="text-4xl mb-4">✓</div>
                <h1 className="text-2xl font-bold text-[#23292E] mb-2">Linked!</h1>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  Your accounts are now linked. You're planning together.
                </p>
                <Link
                  href={PATH.dashboard.base}
                  className="block w-full h-12 bg-[#E4BC62] text-[#23292E] font-semibold text-sm hover:bg-[#E4BC62]/90 transition-all leading-[3rem]"
                >
                  Go to Dashboard ✦
                </Link>
              </>
            )}

            {stage === 'error' && (
              <>
                <div className="text-4xl mb-4">✕</div>
                <h1 className="text-2xl font-bold text-[#23292E] mb-2">Invite Invalid</h1>
                <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                  {errMsg || 'No invite token found in this link.'}
                </p>
                <Link
                  href={PATH.dashboard.settings}
                  className="block w-full h-12 bg-[#23292E] text-white font-semibold text-sm hover:bg-[#23292E]/85 transition-all leading-[3rem]"
                >
                  Back to Settings
                </Link>
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

export default AcceptInvitePage;
