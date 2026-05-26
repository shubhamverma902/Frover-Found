'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { TrashIcon, CheckIcon } from '@/components/icons';
import { AttachmentsPanel } from '@/components/ui';
import {
  useUpdateEventMutation,
  useDeleteEventMutation,
  useAddEventAttachmentMutation,
  useRemoveEventAttachmentMutation,
} from '@/store/api';
import type { WeddingEvent } from '@/types/event';
import type { Attachment } from '@/types/attachment';
import { STATUS_OPTIONS } from '@/constants/events';

interface EditEventModalProps {
  event:   WeddingEvent;
  onClose: () => void;
}

const EditEventModal = ({ event, onClose }: EditEventModalProps) => {
  const [updateEvent,           { isLoading: saving }]       = useUpdateEventMutation();
  const [deleteEvent,           { isLoading: deleting }]     = useDeleteEventMutation();
  const [addEventAttachment,    { isLoading: uploadingFile }] = useAddEventAttachmentMutation();
  const [removeEventAttachment, { isLoading: removingFile }] = useRemoveEventAttachmentMutation();
  const uploading = uploadingFile || removingFile;

  const [form, setForm] = useState<Omit<WeddingEvent, '_id'>>({
    name:   event.name,
    date:   event.date,
    time:   event.time,
    venue:  event.venue,
    guests: event.guests,
    status: event.status,
    desc:   event.desc,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [errors,        setErrors]        = useState<{ name?: string; date?: string; venue?: string }>({});
  const [attachments,   setAttachments]   = useState<Attachment[]>(event.attachments ?? []);
  const [uploadError,   setUploadError]   = useState('');

  const initialAttachmentIds = (event.attachments ?? []).map(a => a._id).join(',');

  const setErr = (k: keyof typeof errors, msg: string | undefined) =>
    setErrors(prev => ({ ...prev, [k]: msg }));

  const set = (k: keyof typeof form, v: string | number) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (k === 'name'  && errors.name  !== undefined) setErr('name',  !String(v).trim() ? 'Required' : undefined);
    if (k === 'date'  && errors.date  !== undefined) setErr('date',  v ? undefined : 'Required');
    if (k === 'venue' && errors.venue !== undefined) setErr('venue', !String(v).trim() ? 'Required' : undefined);
  };

  const formChanged = JSON.stringify(form) !== JSON.stringify({
    name: event.name, date: event.date, time: event.time,
    venue: event.venue, guests: event.guests, status: event.status, desc: event.desc,
  });
  const attachmentsChanged = attachments.map(a => a._id).join(',') !== initialAttachmentIds;
  const hasChanges = formChanged || attachmentsChanged;

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const nameErr  = !form.name.trim()  ? 'Required' : '';
    const dateErr  = !form.date         ? 'Required' : '';
    const venueErr = !form.venue.trim() ? 'Required' : '';
    if (nameErr || dateErr || venueErr) {
      setErrors({ name: nameErr || undefined, date: dateErr || undefined, venue: venueErr || undefined });
      return;
    }
    if (!formChanged) { onClose(); return; }
    try {
      await updateEvent({ id: event._id!, payload: { ...form, guests: Number(form.guests) } }).unwrap();
      onClose();
    } catch { }
  };

  const handleDelete = async () => {
    try {
      await deleteEvent(event._id!).unwrap();
      onClose();
    } catch { }
  };

  const handleUpload = async (files: File[]) => {
    setUploadError('');
    try {
      for (const file of files) {
        const updated = await addEventAttachment({ eventId: event._id!, file }).unwrap();
        setAttachments(updated.attachments ?? []);
      }
    } catch {
      setUploadError('Upload failed');
    }
  };

  const handleDeleteAttachment = async (fileId: string) => {
    setUploadError('');
    try {
      const updated = await removeEventAttachment({ eventId: event._id!, fileId }).unwrap();
      setAttachments(updated.attachments ?? []);
    } catch {
      setUploadError('Remove failed');
    }
  };

  const unsavedBadge = hasChanges && (
    <span className="text-[10px] font-semibold text-blush border border-blush/30 px-2 py-0.5 uppercase tracking-widest">
      Unsaved
    </span>
  );

  return (
    <ModalShell
      onClose={onClose}
      eyebrow="Planning"
      title="Edit Event"
      aria-label="Edit event"
      headerSlot={unsavedBadge}
    >

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(205,180,219,0.12)_0%,transparent_70%)]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(216,167,177,0.08)_0%,transparent_70%)]" />
        <span className="absolute top-4 right-16 text-gold/6 text-[7rem] font-black leading-none select-none">◆</span>
      </div>

      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

          <div className="flex items-center gap-2.5 px-3 py-2 bg-gold/8 border border-gold/20 w-fit">
            <span className="text-gold text-[10px]">◆</span>
            <span className="text-[11px] font-semibold text-gold truncate max-w-[260px]">{event.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gold/15" />
            <span className="text-gold/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-gold/15" />
          </div>

          <div>
            <FieldLabel>Event Name <span className="text-blush">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Mehendi Ceremony"
              value={form.name} maxLength={100} onChange={e => set('name', e.target.value)}
              onBlur={() => { if (!form.name.trim()) setErr('name', 'Required'); }}
              error={!!errors.name} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Date <span className="text-blush">*</span></FieldLabel>
              <Input variant="dark" type="date" className="[color-scheme:dark]"
                value={form.date} onChange={e => set('date', e.target.value)}
                onBlur={() => { if (!form.date) setErr('date', 'Required'); }}
                error={!!errors.date} />
              {errors.date && <p className="text-xs text-red-400 mt-1">{errors.date}</p>}
            </div>
            <div>
              <FieldLabel>Time</FieldLabel>
              <Input variant="dark" type="time" className="[color-scheme:dark]"
                value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <div>
            <FieldLabel>Venue <span className="text-blush">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Leela Palace, New Delhi"
              value={form.venue} maxLength={200} onChange={e => set('venue', e.target.value)}
              onBlur={() => { if (!form.venue.trim()) setErr('venue', 'Required'); }}
              error={!!errors.venue} />
            {errors.venue && <p className="text-xs text-red-400 mt-1">{errors.venue}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Expected Guests</FieldLabel>
              <Input variant="dark" type="number" min={0} placeholder="0"
                value={form.guests || ''} onChange={e => set('guests', e.target.value)} />
            </div>
            <div>
              <FieldLabel>Status</FieldLabel>
              <div className="flex flex-col gap-1.5 pt-0.5">
                {STATUS_OPTIONS.map(opt => (
                  <label key={opt.value}
                    className={`flex items-center gap-2.5 px-3 py-2 border cursor-pointer transition-colors ${
                      form.status === opt.value
                        ? 'border-gold/40 bg-gold/8'
                        : 'border-silver/15 hover:border-silver/30'
                    }`}
                  >
                    <input type="radio" name="status" value={opt.value}
                      checked={form.status === opt.value}
                      onChange={() => set('status', opt.value)}
                      className="sr-only" />
                    <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                    <span className={`text-xs font-semibold ${form.status === opt.value ? 'text-gold' : 'text-silver/50'}`}>
                      {opt.label}
                    </span>
                    {form.status === opt.value && (
                      <CheckIcon size={10} className="ml-auto shrink-0 text-gold" strokeWidth={1.8} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea rows={3}
              className="w-full px-3 py-2.5 text-sm bg-background/5 border border-silver/20 text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/60 transition-colors resize-none"
              placeholder="Brief description of the event…"
              value={form.desc} maxLength={2000} onChange={e => set('desc', e.target.value)} />
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
                <p className="text-xs text-red-300/80 flex-1">Remove this event permanently?</p>
                <Button variant="cancel-sm" type="button" onClick={() => setConfirmDelete(false)}>Cancel</Button>
                <Button variant="danger" type="button" onClick={handleDelete} disabled={deleting}>
                  {deleting ? '…' : 'Yes, Delete'}
                </Button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-xs font-semibold text-red-400/70 hover:text-red-400 transition-colors">
                <TrashIcon size={12} />
                Delete this event
              </button>
            )}
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!hasChanges || saving || uploading}>
            {saving ? 'Saving…' : 'Save Changes ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default EditEventModal;
