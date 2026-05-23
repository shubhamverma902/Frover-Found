'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { AttachmentsPanel } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { useAppDispatch } from '@/store/hooks';
import {
  updateVendor,
  deleteVendor,
  addVendorAttachment,
  removeVendorAttachment,
} from '@/store/slices/vendorsSlice';
import type { Vendor, Attachment } from '@/constants/dashboard-pages';

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

interface EditVendorModalProps {
  vendor:  Vendor;
  onClose: () => void;
}

const EditVendorModal = ({ vendor, onClose }: EditVendorModalProps) => {
  const dispatch = useAppDispatch();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [name,      setName]      = useState(vendor.name);
  const [nameError, setNameError] = useState('');
  const [category,  setCategory]  = useState(vendor.category);
  const [icon,      setIcon]      = useState(vendor.icon);
  const [contact,   setContact]   = useState(vendor.contact);
  const [location,  setLocation]  = useState(vendor.location);
  const [status,    setStatus]    = useState<Vendor['status']>(vendor.status);
  const [rating,    setRating]    = useState(vendor.rating);
  const [notes,     setNotes]     = useState(vendor.notes ?? '');

  // Attachment state — tracked locally so panel updates without prop drilling
  const [attachments,  setAttachments]  = useState<Attachment[]>(vendor.attachments ?? []);
  const [uploading,    setUploading]    = useState(false);
  const [uploadError,  setUploadError]  = useState('');
  const [saving,       setSaving]       = useState(false);

  const handleCategoryChange = (label: string) => {
    setCategory(label);
    setIcon(CATEGORY_ICONS.find(c => c.label === label)?.icon ?? vendor.icon);
  };

  const handleSave = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Required'); return; }
    setSaving(true);
    try {
      const result = await dispatch(updateVendor({
        vendorId: vendor._id,
        payload: { icon, category, name: name.trim(), contact, location, status, rating, notes },
      }));
      if (updateVendor.fulfilled.match(result)) onClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteVendor(vendor._id));
    if (deleteVendor.fulfilled.match(result)) onClose();
  };

  const handleUpload = async (files: File[]) => {
    setUploading(true);
    setUploadError('');
    try {
      for (const file of files) {
        const result = await dispatch(addVendorAttachment({ vendorId: vendor._id, file }));
        if (addVendorAttachment.fulfilled.match(result)) {
          setAttachments(result.payload.attachments ?? []);
        } else {
          setUploadError(typeof result.payload === 'string' ? result.payload : 'Upload failed');
        }
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    setUploading(true);
    setUploadError('');
    try {
      const result = await dispatch(removeVendorAttachment({ vendorId: vendor._id, fileId }));
      if (removeVendorAttachment.fulfilled.match(result)) {
        setAttachments(result.payload.attachments ?? []);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal onClose={onClose} aria-label="Edit vendor" className="flex flex-col max-h-[90svh]">
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Vendors</p>
          <h2 className="text-base font-bold text-white">Edit Vendor</h2>
        </div>
        <Button variant="close" onClick={onClose}>✕</Button>
      </div>

      <form onSubmit={handleSave} className="flex flex-col min-h-0 flex-1">
        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
            <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
          </div>

          {/* Name */}
          <div>
            <FieldLabel>Vendor Name <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input variant="dark"
              value={name}
              onChange={e => { const v = e.target.value; setName(v); if (nameError) setNameError(v.trim() ? '' : 'Required'); }}
              onBlur={() => { if (!name.trim()) setNameError('Required'); }}
              error={!!nameError} />
            {nameError && <p className="text-xs text-red-400 mt-1">{nameError}</p>}
          </div>

          {/* Category */}
          <div>
            <FieldLabel>Category</FieldLabel>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Contact</FieldLabel>
              <Input variant="dark" value={contact} onChange={e => setContact(e.target.value)} />
            </div>
            <div>
              <FieldLabel>Location</FieldLabel>
              <Input variant="dark" value={location} onChange={e => setLocation(e.target.value)} />
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
            <Input variant="dark" placeholder="Any notes about this vendor…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Attachments */}
          <div className="pt-1 border-t border-[#DDDED9]/10">
            <AttachmentsPanel
              attachments={attachments}
              uploading={uploading}
              uploadError={uploadError}
              onUpload={handleUpload}
              onDelete={handleDeleteAttachment}
            />
          </div>

          {/* Delete */}
          <div className="pt-2 border-t border-[#DDDED9]/10">
            {confirmDelete ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-950/30 border border-red-700/30">
                <p className="flex-1 text-xs text-red-300/80">Remove this vendor permanently?</p>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 text-[11px] font-semibold border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} disabled={saving}
                  className="px-2.5 py-1 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60">
                  {saving ? '…' : 'Delete'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="w-full flex items-center justify-center px-4 py-2.5 text-[11px] font-bold text-red-400/70 border border-red-900/30 hover:bg-red-950/30 hover:text-red-400 transition-colors">
                Remove Vendor
              </button>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!name.trim() || saving || uploading}>
            {saving ? 'Saving…' : 'Save Changes ✦'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditVendorModal;
