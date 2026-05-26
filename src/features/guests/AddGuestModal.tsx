'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { useCreateGuestMutation } from '@/store/api';
import type { Guest } from '@/types/guest';

interface AddGuestModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const MEAL_OPTIONS: Guest['meal'][] = ['Veg', 'Non-veg', 'Jain'];
const RSVP_OPTIONS: { value: Guest['rsvp']; label: string }[] = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'pending',   label: 'Pending'   },
  { value: 'declined',  label: 'Declined'  },
];

const AddGuestModal = ({ onClose, onSuccess }: AddGuestModalProps) => {
  const [createGuest, { isLoading: mutating }] = useCreateGuestMutation();

  const [name,      setName]      = useState('');
  const [nameError, setNameError] = useState('');
  const [relation,  setRelation]  = useState('');
  const [phone,     setPhone]     = useState('');
  const [rsvp,      setRsvp]      = useState<Guest['rsvp']>('pending');
  const [meal,      setMeal]      = useState<Guest['meal']>('Veg');
  const [plusOne,   setPlusOne]   = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Required'); return; }
    try {
      await createGuest({ name: name.trim(), relation, phone, rsvp, meal, plusOne }).unwrap();
      (onSuccess ?? onClose)();
    } catch { }
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Guests" title="Add Guest" aria-label="Add guest">
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
              value={name} maxLength={100}
              onChange={e => { const v = e.target.value; setName(v); if (nameError) setNameError(v.trim() ? '' : 'Required'); }}
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
              value={relation} maxLength={100}
              onChange={e => setRelation(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>Phone <span className="text-silver/30 normal-case tracking-normal font-normal">(optional)</span></FieldLabel>
            <Input
              variant="dark"
              placeholder="e.g. +91 98765 43210"
              value={phone} maxLength={30}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div>
            <FieldLabel>RSVP Status</FieldLabel>
            <div className="flex gap-2">
              {RSVP_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setRsvp(opt.value)}
                  className={`flex-1 px-3 py-2 text-[11px] font-bold border transition-colors ${
                    rsvp === opt.value
                      ? 'border-gold/50 bg-gold/10 text-gold'
                      : 'border-silver/15 text-silver/40 hover:border-silver/30'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel>Meal Preference</FieldLabel>
            <div className="flex gap-2">
              {MEAL_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setMeal(opt)}
                  className={`flex-1 px-3 py-2 text-[11px] font-bold border transition-colors ${
                    meal === opt
                      ? 'border-gold/50 bg-gold/10 text-gold'
                      : 'border-silver/15 text-silver/40 hover:border-silver/30'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setPlusOne(p => !p)}
              className={`w-full flex items-center justify-between px-4 py-3 border transition-colors ${
                plusOne
                  ? 'border-gold/40 bg-gold/8 text-gold'
                  : 'border-silver/15 text-silver/40 hover:border-silver/30'
              }`}
            >
              <span className="text-xs font-semibold">Bringing a +1?</span>
              <span className={`w-5 h-5 border flex items-center justify-center text-[11px] font-bold transition-colors ${
                plusOne ? 'border-gold/50 bg-gold/15 text-gold' : 'border-silver/20'
              }`}>
                {plusOne ? '✓' : ''}
              </span>
            </button>
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || mutating}>
            {mutating ? 'Adding…' : 'Add Guest ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default AddGuestModal;
