'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createVendor, selectVendorMutating } from '@/store/slices/vendorsSlice';
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
  const dispatch = useAppDispatch();
  const mutating = useAppSelector(selectVendorMutating);

  const [name,     setName]     = useState('');
  const [category, setCategory] = useState(CATEGORY_ICONS[0].label);
  const [icon,     setIcon]     = useState(CATEGORY_ICONS[0].icon);
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
    if (!name.trim()) return;
    const result = await dispatch(createVendor({ icon, category, name: name.trim(), contact, location, status, rating, notes }));
    if (createVendor.fulfilled.match(result)) onClose();
  };

  return (
    <Modal onClose={onClose} className="flex flex-col max-h-[90vh]">
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Vendors</p>
          <h2 className="text-base font-bold text-white">Add Vendor</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">
        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
            <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
          </div>

          {/* Name */}
          <div>
            <FieldLabel>Vendor Name <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Floral Dreams by Sunita" value={name} onChange={e => setName(e.target.value)} required />
          </div>

          {/* Category */}
          <div>
            <FieldLabel>Category <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORY_ICONS.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => handleCategoryChange(opt.label)}
                  className={`flex items-center gap-2 px-3 py-2 border text-xs font-semibold transition-colors ${
                    category === opt.label
                      ? 'border-[#E4BC62]/50 bg-[#E4BC62]/10 text-[#E4BC62]'
                      : 'border-[#DDDED9]/15 text-[#DDDED9]/40 hover:border-[#DDDED9]/30'
                  }`}
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contact & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Contact</FieldLabel>
              <Input variant="dark" placeholder="+91 98765 43210" value={contact} onChange={e => setContact(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <Input variant="dark" placeholder="e.g. New Delhi" value={location} onChange={e => setLocation(e.target.value)} />
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
                      ? 'border-[#E4BC62]/50 bg-[#E4BC62]/10 text-[#E4BC62]'
                      : 'border-[#DDDED9]/15 text-[#DDDED9]/40 hover:border-[#DDDED9]/30'
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
                  className={`text-xl transition-transform hover:scale-110 ${n <= rating ? 'text-[#E4BC62]' : 'text-[#DDDED9]/20'}`}
                >
                  ★
                </button>
              ))}
              <span className="ml-1 text-xs text-[#DDDED9]/40 self-center">{rating}.0</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <FieldLabel>Notes <span className="text-[#DDDED9]/30 normal-case tracking-normal font-normal">(optional)</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Spoke with Sunita, price negotiable" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
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
