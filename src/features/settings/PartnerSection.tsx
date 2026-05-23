'use client';

import { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import {
  useGetPartnerQuery,
  useInvitePartnerMutation,
  useRemovePartnerMutation,
} from '@/store/api';
import type { InviteResult } from '@/api/settings.api';

export const PartnerSection = () => {
  const { data, isLoading }                         = useGetPartnerQuery();
  const [invitePartner, { isLoading: inviting }]    = useInvitePartnerMutation();
  const [removePartner, { isLoading: removing }]    = useRemovePartnerMutation();

  const [email,         setEmail]         = useState('');
  const [freshInvite,   setFreshInvite]   = useState<InviteResult | null>(null);
  const [error,         setError]         = useState<string | null>(null);
  const [copied,        setCopied]        = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (isLoading) return null;

  const linked  = data?.linked  ?? null;
  const pending = data?.pending ?? null;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await invitePartner({ email }).unwrap();
      setFreshInvite(result);
      setEmail('');
    } catch (err: any) {
      setError(err?.data?.message ?? 'Could not create invite. Please try again.');
    }
  };

  const handleRemove = async () => {
    try {
      const result = await removePartner().unwrap();
      localStorage.setItem('auth_token', result.token);
      setConfirmRemove(false);
      setFreshInvite(null);
    } catch {}
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = async () => {
    if (!pending?.email) return;
    setError(null);
    try {
      const result = await invitePartner({ email: pending.email }).unwrap();
      setFreshInvite(result);
    } catch (err: any) {
      setError(err?.data?.message ?? 'Could not resend invite.');
    }
  };

  return (
    <SettingsSection icon="♡" title="Partner">
      {linked ? (
        /* ── Linked state ── */
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 border border-[#E4BC62]/20 bg-[#E4BC62]/5">
            <div className="w-10 h-10 bg-[#23292E] border border-[#E4BC62]/20 flex items-center justify-center text-lg shrink-0">
              ♡
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#23292E] dark:text-white truncate">{linked.name}</p>
              <p className="text-xs text-[#DDDED9]/60 truncate">{linked.email}</p>
              {linked.linkedAt && (
                <p className="text-[10px] text-[#DDDED9]/40 mt-0.5">
                  Linked {new Date(linked.linkedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
            <span className="shrink-0 text-[10px] font-bold text-[#E4BC62] border border-[#E4BC62]/30 px-2 py-0.5 uppercase tracking-widest">
              Linked
            </span>
          </div>

          {confirmRemove ? (
            <div className="flex items-center gap-3 p-3 bg-red-950/20 border border-red-700/30">
              <p className="text-xs text-red-300/80 flex-1">Remove partner? Both accounts will be unlinked.</p>
              <button
                onClick={() => setConfirmRemove(false)}
                className="px-3 py-1.5 text-[11px] border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="px-3 py-1.5 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {removing ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRemove(true)}
              className="text-xs text-[#DFB3AE] hover:text-white border border-[#DFB3AE]/30 hover:border-[#DFB3AE] px-4 py-2 transition-all"
            >
              Remove Partner
            </button>
          )}
        </div>
      ) : pending && !freshInvite ? (
        /* ── Pending invite (previous session, no URL available) ── */
        <div className="space-y-4">
          <div className="p-4 border border-[#E4BC62]/20 bg-[#E4BC62]/5">
            <p className="text-xs text-[#DDDED9]/70 mb-1">
              Invite pending for <span className="text-[#E4BC62] font-medium">{pending.email}</span>
            </p>
            <p className="text-[10px] text-[#DDDED9]/40">
              Expires {new Date(pending.expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleResend}
            disabled={inviting}
            className="text-xs font-semibold text-[#E4BC62] border border-[#E4BC62]/30 hover:border-[#E4BC62] px-4 py-2 transition-all disabled:opacity-50"
          >
            {inviting ? 'Generating…' : 'Get New Invite Link'}
          </button>
        </div>
      ) : freshInvite ? (
        /* ── Fresh invite URL ── */
        <div className="space-y-4">
          <p className="text-xs text-[#DDDED9]/60">
            Share this link with <span className="text-[#E4BC62] font-medium">{freshInvite.email}</span>. It expires in 48 hours.
          </p>
          <div className="flex items-center gap-2 p-3 border border-[#E4BC62]/20 bg-[#23292E]">
            <p className="text-[11px] text-[#DDDED9]/70 flex-1 truncate font-mono">{freshInvite.inviteUrl}</p>
            <button
              onClick={() => handleCopy(freshInvite.inviteUrl)}
              className="shrink-0 text-[11px] font-semibold px-3 py-1.5 border border-[#E4BC62]/30 text-[#E4BC62] hover:border-[#E4BC62] transition-all"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setFreshInvite(null)}
            className="text-[11px] text-[#DDDED9]/40 hover:text-[#DDDED9]/70 transition-colors"
          >
            Send another invite
          </button>
        </div>
      ) : (
        /* ── No partner, no pending ── */
        <div className="space-y-4">
          <p className="text-xs text-[#DDDED9]/60 leading-relaxed">
            Invite your partner to link accounts. Once linked, you both see and edit the same wedding plan.
          </p>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <form onSubmit={handleInvite} className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="partner@email.com"
              className="flex-1 bg-[#23292E] border border-[#DDDED9]/20 focus:border-[#E4BC62]/50 px-3 py-2.5 text-sm text-white placeholder:text-[#DDDED9]/30 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={inviting}
              className="shrink-0 px-5 py-2.5 text-xs font-semibold bg-[#E4BC62] text-[#23292E] hover:bg-[#E4BC62]/90 disabled:opacity-50 transition-all"
            >
              {inviting ? 'Sending…' : 'Send Invite'}
            </button>
          </form>
        </div>
      )}
    </SettingsSection>
  );
};
