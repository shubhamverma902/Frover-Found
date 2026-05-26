'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel, CheckRow, OptionPill } from '@/components/elements';
import { useUpdateGuestMutation, useDeleteGuestMutation } from '@/store/api';
import type { Guest } from '@/types/guest';

interface EditGuestModalProps {
  guest:      Guest;
  onClose:    () => void;
  onDeleted?: () => void;
}

const MEAL_OPTIONS: Guest['meal'][] = ['Veg', 'Non-veg', 'Jain'];
const RSVP_OPTIONS: { value: Guest['rsvp']; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending',   label: 'Pending'   },
  { value: 'declined',  label: 'Declined'  },
];

const EditGuestModal = ({ guest, onClose, onDeleted }: EditGuestModalProps) => {
  const [updateGuest, { isLoading: saving }]   = useUpdateGuestMutation();
  const [deleteGuest, { isLoading: deleting }] = useDeleteGuestMutation();
  const mutating = saving || deleting;

  const [name,          setName]          = useState(guest.name);
  const [nameError,     setNameError]     = useState('');
  const [relation,      setRelation]      = useState(guest.relation ?? '');
  const [phone,         setPhone]         = useState(guest.phone    ?? '');
  const [rsvp,          setRsvp]          = useState<Guest['rsvp']>(guest.rsvp);
  const [meal,          setMeal]          = useState<Guest['meal']>(guest.meal);
  const [plusOne,       setPlusOne]       = useState(guest.plusOne  ?? false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Required'); return; }
    try {
      await updateGuest({
        guestId: guest._id,
        payload: { name: name.trim(), relation, phone, rsvp, meal, plusOne },
      }).unwrap();
      onClose();
    } catch { }
  };

  const handleDelete = async () => {
    try {
      await deleteGuest(guest._id).unwrap();
      (onDeleted ?? onClose)();
    } catch { }
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Guests" title="Edit Guest" aria-label="Edit guest">
      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div>
            <FieldLabel>Name <span className="text-blush">*</span></FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. Anjali Sharma"
              value={name}
              maxLength={100}
              onChange={e => {
                const v = e.target.value;
                setName(v);
                if (nameError) setNameError(v.trim() ? '' : 'Required');
              }}
              onBlur={() => { if (!name.trim()) setNameError('Required'); }}
              error={!!nameError}
            />
            {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
          </div>

          <div>
            <FieldLabel>Relation <span className="text-silver/30 normal-case tracking-normal font-normal">(optional)</span></FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. Sister, Friend, Colleague"
              value={relation}
              maxLength={100}
              onChange={e => setRelation(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Phone <span className="text-silver/30 normal-case tracking-normal font-normal">(optional)</span></FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              maxLength={30}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>RSVP Status</FieldLabel>
            <div className="flex gap-2">
              {RSVP_OPTIONS.map(opt => (
                <OptionPill key={opt.value} active={rsvp === opt.value} onClick={() => setRsvp(opt.value)} className="flex-1 px-3 py-2 text-[11px] font-bold">
                  {opt.label}
                </OptionPill>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Meal Preference</FieldLabel>
            <div className="flex gap-2">
              {MEAL_OPTIONS.map(opt => (
                <OptionPill key={opt} active={meal === opt} onClick={() => setMeal(opt)} className="flex-1 px-3 py-2 text-[11px] font-bold">
                  {opt}
                </OptionPill>
              ))}
            </div>
          </div>

          <CheckRow label="Bringing a +1?" checked={plusOne} onChange={() => setPlusOne(p => !p)} />

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
              <Button variant="danger" type="button" disabled={mutating} onClick={() => setConfirmDelete(true)}>
                Remove Guest
              </Button>
            )}
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || mutating}>
            {saving ? 'Saving…' : 'Save Changes ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default EditGuestModal;
