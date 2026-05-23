'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/elements';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { patchGuestRsvp, deleteGuest, selectGuestMutating } from '@/store/slices/guestsSlice';
import { RSVP_META } from '@/constants/guests';
import type { Guest } from '@/constants/dashboard-pages';

interface GuestRsvpModalProps {
  guest:   Guest;
  onClose: () => void;
}

const RSVP_OPTIONS: Guest['rsvp'][] = ['confirmed', 'pending', 'declined'];

const GuestRsvpModal = ({ guest, onClose }: GuestRsvpModalProps) => {
  const dispatch       = useAppDispatch();
  const mutating       = useAppSelector(selectGuestMutating);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleRsvp = async (rsvp: Guest['rsvp']) => {
    if (rsvp === guest.rsvp) return onClose();
    const result = await dispatch(patchGuestRsvp({ guestId: guest._id, rsvp }));
    if (patchGuestRsvp.fulfilled.match(result)) onClose();
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteGuest(guest._id));
    if (deleteGuest.fulfilled.match(result)) onClose();
  };

  const initials = (() => {
    const p = guest.name.split(' ');
    return `${p[0]?.[0] ?? ''}${p[1]?.[0] ?? ''}`;
  })();

  return (
    <Modal onClose={onClose} aria-label="Update RSVP status" className="flex flex-col max-h-[90svh]">

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Guest</p>
          <h2 className="text-base font-bold text-white">Update RSVP</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-6 space-y-5">

        {/* Guest identity */}
        <div className="flex items-center gap-4 p-4 bg-[#E4BC62]/8 border border-[#E4BC62]/20">
          <div className="w-10 h-10 rounded-full bg-[#E4BC62] text-[#23292E] flex items-center justify-center text-sm font-black shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{guest.name}</p>
            <p className="text-[10px] text-[#DDDED9]/40 mt-0.5">{guest.relation} · {guest.meal}{guest.plusOne ? ' · +1' : ''}</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 border uppercase tracking-wide ${RSVP_META[guest.rsvp].badge}`}>
            {RSVP_META[guest.rsvp].label}
          </span>
        </div>

        {/* Ornament */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E4BC62]/15" />
          <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
          <div className="flex-1 h-px bg-[#E4BC62]/15" />
        </div>

        {/* RSVP options */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-[#DDDED9]/40 uppercase tracking-widest mb-3">Set RSVP Status</p>
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
                    ? 'border-[#E4BC62]/40 bg-[#E4BC62]/8'
                    : 'border-[#DDDED9]/10 hover:border-[#DDDED9]/25 hover:bg-[#DDDED9]/5'
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${meta.dot}`} />
                <span className={`text-xs font-bold flex-1 text-left ${current ? 'text-[#E4BC62]' : 'text-[#DDDED9]/50'}`}>
                  {meta.label}
                </span>
                {current && <span className="text-[10px] text-[#E4BC62]/60 font-semibold uppercase tracking-widest">Current</span>}
              </button>
            );
          })}
        </div>

        {/* Danger zone */}
        <div className="pt-2 border-t border-[#DDDED9]/10">
          {confirmDelete ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-950/30 border border-red-700/30">
              <p className="flex-1 text-xs text-red-300/80">Remove {guest.name}? This cannot be undone.</p>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 text-[11px] font-semibold border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={mutating}
                className="px-2.5 py-1 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {mutating ? '…' : 'Yes, Remove'}
              </button>
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

      </div>
    </Modal>
  );
};

export default GuestRsvpModal;
