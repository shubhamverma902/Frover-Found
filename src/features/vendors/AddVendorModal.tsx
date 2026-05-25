'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { useCreateVendorMutation } from '@/store/api';
import type { Vendor } from '@/constants/dashboard-pages';

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
  const [contact,  setContact]  = useState('');
  const [location, setLocation] = useState('');
  const [status,   setStatus]   = useState<Vendor['status']>('pending');
  const [rating,   setRating]   = useState(3);
  const [notes,    setNotes]    = useState('');

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
    <Modal onClose={onClose} aria-label="Add vendor" className="flex flex-col max-h-[90svh]">
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gold/15">
        <div>
          <p className="text-[10px] font-bold text-gold uppercase tracking-[0.4em] mb-0.5">Vendors</p>
          <h2 className="text-base font-bold text-white">Add Vendor</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          {/* Name */}
          <div>
            <FieldLabel>Vendor Name <span className="text-blush">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Floral Dreams by Sunita"
              value={name} maxLength={100}
              onChange={e => { const v = e.target.value; setName(v); if (nameError) setNameError(v.trim() ? '' : 'Required'); }}
              onBlur={() => { if (!name.trim()) setNameError('Required'); }}
              error={!!nameError} />
            {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
          </div>

          {/* Category */}
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

          {/* Contact & Location */}
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

          {/* Status */}
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

          {/* Rating */}
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

          {/* Notes */}
          <div>
            <FieldLabel>Notes <span className="text-silver/30 normal-case tracking-normal font-normal">(optional)</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Spoke with Sunita, price negotiable" value={notes} maxLength={2000} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gold/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || mutating}>
            {mutating ? 'Adding…' : 'Add Vendor ✦'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVendorModal;
