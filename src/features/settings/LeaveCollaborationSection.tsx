'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import { useLeaveCollaborationMutation } from '@/store/api';
import { SettingsSection } from './SettingsSection';
import { PATH } from '@/constants/path';

export const LeaveCollaborationSection = () => {
  const dispatch                              = useAppDispatch();
  const router                                = useRouter();
  const [leaveCollaboration, { isLoading }]   = useLeaveCollaborationMutation();
  const [confirming, setConfirming]           = useState(false);
  const [error,      setError]                = useState<string | null>(null);

  const handleLeave = async () => {
    setError(null);
    try {
      await leaveCollaboration().unwrap();
      dispatch(logoutUser());
      router.replace(PATH.auth.login);
    } catch (err: any) {
      setError(err?.data?.message ?? 'Could not leave the wedding plan. Please try again.');
      setConfirming(false);
    }
  };

  return (
    <SettingsSection icon="🚪" title="Wedding Plan Access">
      <p className="text-xs text-zinc-500 dark:text-[#DDDED9]/60 leading-relaxed mb-4">
        You are a collaborator on this wedding plan. Leaving will immediately revoke your access and you will be signed out. You can only rejoin if the owner sends you a new invite.
      </p>

      {error && <p role="alert" className="text-xs text-red-500 mb-4">{error}</p>}

      {confirming ? (
        <div className="flex items-center gap-3">
          <p className="text-xs text-zinc-500 dark:text-[#DDDED9]/60 flex-1">
            Are you sure? This cannot be undone.
          </p>
          <button
            onClick={() => setConfirming(false)}
            className="px-3 py-1.5 text-[11px] border border-zinc-300 dark:border-[#DDDED9]/20 text-zinc-500 dark:text-[#DDDED9]/50 hover:text-[#23292E] dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleLeave}
            disabled={isLoading}
            className="px-4 py-1.5 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Leaving…' : 'Leave Plan'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="px-4 py-2 text-xs font-semibold border border-red-700/40 text-red-500 hover:border-red-600 hover:text-red-400 transition-all"
        >
          Leave Wedding Plan
        </button>
      )}
    </SettingsSection>
  );
};
