'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { AttachmentsPanel } from '@/components/ui';
import { Button, Input, FieldLabel, OptionPill } from '@/components/elements';
import {
  useUpdateVendorMutation,
  useDeleteVendorMutation,
  useAddVendorAttachmentMutation,
  useRemoveVendorAttachmentMutation,
} from '@/store/api';
import type { Vendor } from '@/types/vendor';
import type { Attachment } from '@/types/attachment';

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
  const [updateVendor,          { isLoading: saving }]       = useUpdateVendorMutation();
  const [deleteVendor,          { isLoading: deleting }]     = useDeleteVendorMutation();
  const [addVendorAttachment,   { isLoading: uploadingFile }] = useAddVendorAttachmentMutation();
  const [removeVendorAttachment, { isLoading: removingFile }] = useRemoveVendorAttachmentMutation();
  const uploading = uploadingFile || removingFile;

  const [name,          setName]          = useState(vendor.name);
  const [nameError,     setNameError]     = useState('');
  const [category,      setCategory]      = useState(vendor.category);
  const [icon,          setIcon]          = useState(vendor.icon);
  const [contact,       setContact]       = useState(vendor.contact);
  const [location,      setLocation]      = useState(vendor.location);
  const [status,        setStatus]        = useState<Vendor['status']>(vendor.status);
  const [rating,        setRating]        = useState(vendor.rating);
  const [notes,         setNotes]         = useState(vendor.notes);
  const [attachments,   setAttachments]   = useState<Attachment[]>(vendor.attachments ?? []);
  const [uploadError,   setUploadError]   = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleCategoryChange = (label: string) => {
    setCategory(label);
    setIcon(CATEGORY_ICONS.find(c => c.label === label)?.icon ?? '🏢');
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name.trim()) { setNameError('Required'); return; }
    try {
      await updateVendor({ vendorId: vendor._id, payload: { icon, category, name: name.trim(), contact, location, status, rating, notes } }).unwrap();
      onClose();
    } catch { }
  };

  const handleDelete = async () => {
    try {
      await deleteVendor(vendor._id).unwrap();
      onClose();
    } catch { }
  };

  const handleUpload = async (files: File[]) => {
    setUploadError('');
    try {
      for (const file of files) {
        const updated = await addVendorAttachment({ vendorId: vendor._id, file }).unwrap();
        setAttachments(updated.attachments ?? []);
      }
    } catch {
      setUploadError('Upload failed');
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    setUploadError('');
    try {
      const updated = await removeVendorAttachment({ vendorId: vendor._id, fileId }).unwrap();
      setAttachments(updated.attachments ?? []);
    } catch {
      setUploadError('Remove failed');
    }
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Vendors" title="Edit Vendor" aria-label="Edit vendor">
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
                <OptionPill key={opt.label} active={category === opt.label} onClick={() => handleCategoryChange(opt.label)} className="flex items-center gap-2 px-3 py-2 text-xs font-semibold">
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </OptionPill>
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
                <OptionPill key={opt} active={status === opt} onClick={() => setStatus(opt)} className="flex-1 px-3 py-2 text-[11px] font-bold capitalize">
                  {opt}
                </OptionPill>
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

          <div className="pt-1 border-t border-silver/10">
            <AttachmentsPanel
              attachments={attachments}
              uploading={uploading}
              uploadError={uploadError}
              onUpload={handleUpload}
              onDelete={handleDeleteAttachment}
            />
          </div>

          <div className="border border-red-900/30 bg-red-950/20 px-4 py-3">
            <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-2">Danger Zone</p>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-red-300/80 flex-1">Remove this vendor permanently?</p>
                <Button variant="cancel-sm" type="button" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button variant="danger" type="button" onClick={handleDelete} disabled={deleting}>
                  {deleting ? '…' : 'Yes, Delete'}
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="text-xs font-semibold text-red-400/70 hover:text-red-400 transition-colors">
                Delete this vendor
              </button>
            )}
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={saving || uploading}>
            {saving ? 'Saving…' : 'Save Changes ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default EditVendorModal;
