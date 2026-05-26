'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { useCreateVendorMutation } from '@/store/api';
import type { Vendor } from '@/types/vendor';

const CATEGORY_ICONS: { label: string; icon: string }[] = [
  { label: 'Decoration',    icon: '🌸' },
  { label: 'Photography',   icon: '📸' },
  { label: 'Videography',   icon: '🎬' },
  { label: 'Entertainment', icon: '🎶' },
  { label: 'Catering',      icon: '🍽️' },
  { label: 'Beauty',        icon: '💄' },
  { label: 'Transport',     icon: '🚗' },
  { label: 'Venue',         icon: '🏛️' },
  { label: 'Invitations',   icon: '✉️' },
  { label: 'Other',         icon: '🏢' },
];

const STATUS_OPTIONS: Vendor['status'][] = ['pending', 'shortlisted', 'booked'];

interface AddVendorModalProps { onClose: () => void; }

const AddVendorModal = ({ onClose }: AddVendorModalProps) => {
  const [createVendor, { isLoading: mutating }] = useCreateVendorMutation();

  const [name,      setName]      = useState('');
  const [nameError, setNameError] = useState('');
  const [category,  setCategory]  = useState(CATEGORY_ICONS[0].label);
  const [icon,      setIcon]      = useState(CATEGORY_ICONS[0].icon);
  const [contact,   setContact]   = useState('');
  const [location,  setLocation]  = useState('');
  const [status,    setStatus]    = useState<Vendor['status']>('pending');
  const [rating,    setRating]    = useState(3);
  const [notes,     setNotes]     = useState('');

  const handleCategoryChange = (label: string) => {
    setCategory(label);
    setIcon(CATEGORY_ICONS.find(c => c.label === label)?.icon ?? '🏢');
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Required'); return; }
    try {
      await createVendor({ icon, category, name: name.trim(), contact, location, status, rating, notes }).unwrap();
      onClose();
    } catch { }
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Vendors" title="Add Vendor" aria-label="Add vendor">
      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div>
            <FieldLabel>Vendor Name <span className="text-blush">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Floral Dreams by Sunita"
              value={name} maxLength={100}
              onChange={e => { const v = e.target.value; setName(v); if (nameError) setNameError(v.trim() ? '' : 'Required'); }}
              onBlur={() => { if (!name.trim()) setNameError('Required'); }}
              error={!!nameError} />
            {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
          </div>

          <div>
            <FieldLabel>Category <span className="text-blush">*</span></FieldLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORY_ICONS.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleCategoryChange(opt.label)}
                  className={`flex items-center gap-2 px-3 py-2 border text-xs font-semibold transition-colors ${
                    category === opt.label
                      ? 'border-gold/50 bg-gold/10 text-gold'
                      : 'border-silver/15 text-silver/40 hover:border-silver/30'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Contact</FieldLabel>
              <Input variant="dark" placeholder="+91 98765 43210" value={contact} maxLength={200} onChange={e => setContact(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <Input variant="dark" placeholder="e.g. New Delhi" value={location} maxLength={200} onChange={e => setLocation(e.target.value)} />
            </div>
          </div>

          <div>
            <FieldLabel>Status</FieldLabel>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  className={`flex-1 px-3 py-2 text-[11px] font-bold border capitalize transition-colors ${
                    status === opt
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
            <FieldLabel>Rating</FieldLabel>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-xl transition-transform hover:scale-110 ${n <= rating ? 'text-gold' : 'text-silver/20'}`}
                >
                  ★
                </button>
              ))}
              <span className="ml-1 text-xs text-silver/40 self-center">{rating}.0</span>
            </div>
          </div>

          <div>
            <FieldLabel>Notes <span className="text-silver/30 normal-case tracking-normal font-normal">(optional)</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Spoke with Sunita, price negotiable" value={notes} maxLength={2000} onChange={e => setNotes(e.target.value)} />
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || mutating}>
            {mutating ? 'Adding…' : 'Add Vendor ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default AddVendorModal;
