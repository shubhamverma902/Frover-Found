'use client';

import { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import {
  useGetCollaboratorsQuery,
  useInviteCollaboratorMutation,
  useRemoveCollaboratorMutation,
} from '@/store/api';
import type { CollaboratorInviteResult } from '@/store/api';

const ROLE_LABELS: Record<string, { label: string; desc: string; color: string }> = {
  planner: { label: 'Planner', desc: 'Can add, edit, and delete everything except account settings', color: 'text-[#E4BC62] border-[#E4BC62]/30' },
  viewer:  { label: 'Viewer',  desc: 'Read-only — can view everything but cannot make any changes',  color: 'text-zinc-400 dark:text-[#DDDED9]/60 border-zinc-300 dark:border-[#DDDED9]/20' },
};

export const CollaboratorsSection = () => {
  const { data, isLoading }                                   = useGetCollaboratorsQuery();
  const [inviteCollaborator, { isLoading: inviting }]         = useInviteCollaboratorMutation();
  const [removeCollaborator, { isLoading: removing }]         = useRemoveCollaboratorMutation();

  const [email,        setEmail]        = useState('');
  const [role,         setRole]         = useState<'planner' | 'viewer'>('planner');
  const [freshInvite,  setFreshInvite]  = useState<CollaboratorInviteResult | null>(null);
  const [error,        setError]        = useState<string | null>(null);
  const [copied,       setCopied]       = useState(false);
  const [confirmId,    setConfirmId]    = useState<string | null>(null);

  if (isLoading) return null;

  const collaborators = data?.collaborators ?? [];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const result = await inviteCollaborator({ email, role }).unwrap();
      setFreshInvite(result);
      setEmail('');
    } catch (err: any) {
      setError(err?.data?.message ?? 'Could not create invite. Please try again.');
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeCollaborator(id).unwrap();
      setConfirmId(null);
    } catch {}
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SettingsSection icon="👥" title="Family & Planners">
      {/* Existing collaborators */}
      {collaborators.length > 0 && (
        <div className="space-y-2 mb-6">
          {collaborators.map(c => {
            const meta = ROLE_LABELS[c.role];
            return (
              <div key={c._id} className="flex items-center gap-3 px-4 py-3 border border-zinc-200 dark:border-[#2a2f33] bg-zinc-50 dark:bg-[#23292E]/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-[#23292E] dark:text-white truncate">
                      {c.accepted ? c.name || c.email : c.email}
                    </span>
                    <span className={`text-[10px] font-bold border px-1.5 py-0.5 uppercase tracking-widest ${meta.color}`}>
                      {meta.label}
                    </span>
                    {!c.accepted && (
                      <span className="text-[10px] text-zinc-400 dark:text-[#DDDED9]/40 border border-zinc-200 dark:border-[#DDDED9]/15 px-1.5 py-0.5 uppercase tracking-widest">
                        Pending
                      </span>
                    )}
                  </div>
                  {c.accepted && c.email && (
                    <p className="text-xs text-zinc-400 dark:text-[#DDDED9]/40 truncate mt-0.5">{c.email}</p>
                  )}
                </div>

                {confirmId === c._id ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setConfirmId(null)}
                      className="px-2.5 py-1 text-[11px] border border-zinc-300 dark:border-[#DDDED9]/20 text-zinc-500 dark:text-[#DDDED9]/50 hover:text-[#23292E] dark:hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleRemove(c._id)}
                      disabled={removing}
                      className="px-2.5 py-1 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmId(c._id)}
                    className="shrink-0 text-[11px] text-zinc-400 dark:text-[#DDDED9]/40 hover:text-[#DFB3AE] transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Fresh invite URL */}
      {freshInvite ? (
        <div className="space-y-3">
          <p className="text-xs text-zinc-500 dark:text-[#DDDED9]/60">
            Share this link with <span className="text-[#E4BC62] font-medium">{freshInvite.email}</span> ({ROLE_LABELS[freshInvite.role].label}). Expires in 48 hours.
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
            className="text-[11px] text-zinc-400 dark:text-[#DDDED9]/40 hover:text-zinc-600 dark:hover:text-[#DDDED9]/70 transition-colors"
          >
            Invite someone else
          </button>
        </div>
      ) : (
        /* Invite form */
        <div className="space-y-4">
          <p className="text-xs text-zinc-500 dark:text-[#DDDED9]/60 leading-relaxed">
            Give family members or wedding planners access. Choose their role carefully — Planners can make changes, Viewers can only look.
          </p>
          {error && <p role="alert" className="text-xs text-red-500">{error}</p>}

          {/* Role picker */}
          <div className="grid grid-cols-2 gap-2">
            {(['planner', 'viewer'] as const).map(r => {
              const meta = ROLE_LABELS[r];
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`text-left px-4 py-3 border transition-all ${
                    role === r
                      ? 'border-[#E4BC62]/50 bg-[#E4BC62]/8'
                      : 'border-zinc-200 dark:border-[#2a2f33] hover:border-zinc-300 dark:hover:border-[#DDDED9]/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold border px-1.5 py-0.5 uppercase tracking-widest ${meta.color}`}>
                      {meta.label}
                    </span>
                    {role === r && <span className="text-[#E4BC62] text-xs">✓</span>}
                  </div>
                  <p className="text-[11px] text-zinc-400 dark:text-[#DDDED9]/50 leading-snug">{meta.desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleInvite} className="flex items-center gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="family@email.com"
              className="flex-1 bg-white dark:bg-[#23292E] border border-zinc-300 dark:border-[#DDDED9]/20 focus:border-[#E4BC62]/50 px-3 py-2.5 text-sm text-[#23292E] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-[#DDDED9]/30 outline-none transition-colors"
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
