'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button } from '@/components/elements';
import { usePatchGuestRsvpMutation, useDeleteGuestMutation } from '@/store/api';
import { RSVP_META } from '@/constants/guests';
import type { Guest } from '@/types/guest';

interface GuestRsvpModalProps {
  guest:   Guest;
  onClose: () => void;
}

const RSVP_OPTIONS: Guest['rsvp'][] = ['confirmed', 'pending', 'declined'];

const GuestRsvpModal = ({ guest, onClose }: GuestRsvpModalProps) => {
  const [patchRsvp,   { isLoading: patching }] = usePatchGuestRsvpMutation();
  const [deleteGuest, { isLoading: deleting }] = useDeleteGuestMutation();
  const mutating = patching || deleting;

  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRsvp = async (rsvp: Guest['rsvp']) => {
    if (rsvp === guest.rsvp) return onClose();
    try {
      await patchRsvp({ guestId: guest._id, rsvp }).unwrap();
      onClose();
    } catch { }
  };

  const handleDelete = async () => {
    try {
      await deleteGuest(guest._id).unwrap();
      onClose();
    } catch { }
  };

  const initials = (() => {
    const p = guest.name.split(' ');
    return `${p[0]?.[0] ?? ''}${p[1]?.[0] ?? ''}`;
  })();

  return (
    <ModalShell onClose={onClose} eyebrow="Guest" title="Update RSVP" aria-label="Update RSVP status">
      <ModalShell.Body className="pb-6 space-y-5">

        <div className="flex items-center gap-4 p-4 bg-gold/8 border border-gold/20">
          <div className="w-10 h-10 rounded-full bg-gold text-dark flex items-center justify-center text-sm font-black shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{guest.name}</p>
            <p className="text-[10px] text-silver/40 mt-0.5">{guest.relation} · {guest.meal}{guest.plusOne ? ' · +1' : ''}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wide ${RSVP_META[guest.rsvp].badge}`}>
            {RSVP_META[guest.rsvp].label}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gold/15" />
          <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
          <div className="flex-1 h-px bg-gold/15" />
        </div>

        <div className="space-y-2">
          <p className="text-[10px] font-bold text-silver/40 uppercase tracking-widest mb-3">Set RSVP Status</p>
          {RSVP_OPTIONS.map(opt => {
            const meta    = RSVP_META[opt];
            const current = guest.rsvp === opt;
            return (
              <button
                key={opt}
                type="button"
                disabled={mutating}
                onClick={() => handleRsvp(opt)}
                className={`w-full flex items-center gap-3 px-4 py-3 border transition-all ${
                  current
                    ? 'border-gold/40 bg-gold/8'
                    : 'border-silver/10 hover:border-silver/25 hover:bg-silver/5'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                <span className={`text-xs font-bold flex-1 text-left ${current ? 'text-gold' : 'text-silver/50'}`}>
                  {meta.label}
                </span>
                {current && <span className="text-[10px] text-gold/60 font-semibold uppercase tracking-widest">Current</span>}
              </button>
            );
          })}
        </div>

        <div className="pt-2 border-t border-silver/10">
          {confirmDelete ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-950/30 border border-red-700/30">
              <p className="flex-1 text-xs text-red-300/80">Remove {guest.name}? This cannot be undone.</p>
              <Button variant="cancel-sm" type="button" onClick={() => setConfirmDelete(false)}>Cancel</Button>
              <Button variant="danger" type="button" onClick={handleDelete} disabled={mutating}>
                {deleting ? '…' : 'Yes, Remove'}
              </Button>
            </div>
          ) : (
            <button
              type="button"
              disabled={mutating}
              onClick={() => setConfirmDelete(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-[11px] font-bold text-red-400/70 border border-red-900/30 hover:bg-red-950/30 hover:text-red-400 transition-colors"
            >
              Remove Guest
            </button>
          )}
        </div>

      </ModalShell.Body>
    </ModalShell>
  );
};

export default GuestRsvpModal;
