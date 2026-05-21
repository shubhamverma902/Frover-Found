'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { TrashIcon, CheckIcon } from '@/components/icons';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateEvent, deleteEvent, selectEventsStatus } from '@/store/slices/eventsSlice';
import type { WeddingEvent } from '@/constants/dashboard-pages';
import { STATUS_OPTIONS } from '@/constants/events';

interface EditEventModalProps {
  event:   WeddingEvent;
  onClose: () => void;
}

const EditEventModal = ({ event, onClose }: EditEventModalProps) => {
  const dispatch = useAppDispatch();
  const status   = useAppSelector(selectEventsStatus);

  // date and time are already in YYYY-MM-DD / HH:mm — use directly in inputs
  const [form, setForm]                   = useState<Omit<WeddingEvent, '_id'>>({
    name:   event.name,
    date:   event.date,
    time:   event.time,
    venue:  event.venue,
    guests: event.guests,
    status: event.status,
    desc:   event.desc,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (k: keyof typeof form, v: string | number) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const hasChanges = JSON.stringify(form) !== JSON.stringify({
    name: event.name, date: event.date, time: event.time,
    venue: event.venue, guests: event.guests, status: event.status, desc: event.desc,
  });

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.date || !form.venue.trim()) return;
    const result = await dispatch(updateEvent({
      id: event._id!,
      payload: { ...form, guests: Number(form.guests) },
    }));
    if (updateEvent.fulfilled.match(result)) onClose();
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteEvent(event._id!));
    if (deleteEvent.fulfilled.match(result)) onClose();
  };

  const loading = status === 'loading';

  return (
    <Modal onClose={onClose} className="flex flex-col max-h-[90vh] relative">

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(228,188,98,0.12)_0%,transparent_70%)]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(223,179,174,0.08)_0%,transparent_70%)]" />
        <span className="absolute top-4 right-16 text-[#E4BC62]/6 text-[7rem] font-black leading-none select-none">◆</span>
      </div>

      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-[#E4BC62]/15">
        <div>
          <p className="text-[10px] font-bold text-[#E4BC62] uppercase tracking-[0.4em] mb-0.5">Planning</p>
          <h2 className="text-base font-bold text-white">Edit Event</h2>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-[10px] font-semibold text-[#DFB3AE] border border-[#DFB3AE]/30 px-2 py-0.5 uppercase tracking-widest">
              Unsaved
            </span>
          )}
          <Button variant="close" onClick={onClose}>✕</Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col min-h-0 flex-1">

        <div className="overflow-y-auto flex-1 min-h-0 px-6 pt-5 pb-2 space-y-4">

          <div className="flex items-center gap-2.5 px-3 py-2 bg-[#E4BC62]/8 border border-[#E4BC62]/20 w-fit">
            <span className="text-[#E4BC62] text-[10px]">◆</span>
            <span className="text-[11px] font-semibold text-[#E4BC62] truncate max-w-[260px]">{event.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
            <span className="text-[#E4BC62]/30 text-[10px] tracking-[0.4em]">◆ ◆ ◆</span>
            <div className="flex-1 h-px bg-[#E4BC62]/15" />
          </div>

          <div>
            <FieldLabel>Event Name <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Mehendi Ceremony"
              value={form.name} onChange={e => set('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Date <span className="text-[#DFB3AE]">*</span></FieldLabel>
              <Input variant="dark" type="date" className="[color-scheme:dark]"
                value={form.date} onChange={e => set('date', e.target.value)} required />
            </div>
            <div>
              <FieldLabel>Time</FieldLabel>
              <Input variant="dark" type="time" className="[color-scheme:dark]"
                value={form.time} onChange={e => set('time', e.target.value)} />
            </div>
          </div>

          <div>
            <FieldLabel>Venue <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Leela Palace, New Delhi"
              value={form.venue} onChange={e => set('venue', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                        ? 'border-[#E4BC62]/40 bg-[#E4BC62]/8'
                        : 'border-[#DDDED9]/15 hover:border-[#DDDED9]/30'
                    }`}
                  >
                    <input type="radio" name="status" value={opt.value}
                      checked={form.status === opt.value}
                      onChange={() => set('status', opt.value)}
                      className="sr-only" />
                    <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                    <span className={`text-xs font-semibold ${form.status === opt.value ? 'text-[#E4BC62]' : 'text-[#DDDED9]/50'}`}>
                      {opt.label}
                    </span>
                    {form.status === opt.value && (
                      <CheckIcon size={10} className="ml-auto shrink-0 text-[#E4BC62]" strokeWidth={1.8} />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea rows={3}
              className="w-full px-3 py-2.5 text-sm bg-[#FDFDF8]/5 border border-[#DDDED9]/20 text-white placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/60 transition-colors resize-none"
              placeholder="Brief description of the event…"
              value={form.desc} onChange={e => set('desc', e.target.value)} />
          </div>

          {/* Danger zone */}
          <div className="border border-red-900/30 bg-red-950/20 px-4 py-3">
            <p className="text-[10px] font-bold text-red-400/70 uppercase tracking-widest mb-2">Danger Zone</p>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <p className="text-xs text-red-300/80 flex-1">Remove this event permanently?</p>
                <button type="button" onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-[11px] font-semibold border border-[#DDDED9]/20 text-[#DDDED9]/50 hover:text-white transition-colors">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} disabled={loading}
                  className="px-3 py-1.5 text-[11px] font-bold bg-red-700 text-white hover:bg-red-600 transition-colors disabled:opacity-60">
                  {loading ? '…' : 'Yes, Delete'}
                </button>
              </div>
            ) : (
              <button type="button" onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 text-xs font-semibold text-red-400/70 hover:text-red-400 transition-colors">
                <TrashIcon size={12} />
                Delete this event
              </button>
            )}
          </div>

        </div>

        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={!hasChanges || loading}>
            {loading ? 'Saving…' : 'Save Changes ✦'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};

export default EditEventModal;
