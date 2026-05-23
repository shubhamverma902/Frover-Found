'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button, Input, FieldLabel } from '@/components/elements';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { createEvent, selectEventsMutating } from '@/store/slices/eventsSlice';
import type { WeddingEvent } from '@/constants/dashboard-pages';

type FormData = Omit<WeddingEvent, '_id'>;

const EMPTY: FormData = {
  name: '', date: '', time: '', venue: '', guests: 0, status: 'pending', desc: '',
};

interface AddEventModalProps {
  onClose: () => void;
}

const AddEventModal = ({ onClose }: AddEventModalProps) => {
  const dispatch = useAppDispatch();
  const mutating = useAppSelector(selectEventsMutating);
  const [form,   setForm]   = useState<FormData>({ ...EMPTY });
  const [errors, setErrors] = useState<{ name?: string; date?: string; venue?: string }>({});

  const setErr = (k: keyof typeof errors, msg: string | undefined) =>
    setErrors(prev => ({ ...prev, [k]: msg }));

  const set = (k: keyof FormData, v: string | number) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (k === 'name')  setErr('name',  String(v).trim() ? undefined : 'Required');
    if (k === 'date')  setErr('date',  v ? undefined : 'Required');
    if (k === 'venue') setErr('venue', String(v).trim() ? undefined : 'Required');
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const nameErr  = !form.name.trim()  ? 'Required' : '';
    const dateErr  = !form.date         ? 'Required' : '';
    const venueErr = !form.venue.trim() ? 'Required' : '';
    if (nameErr || dateErr || venueErr) {
      setErrors({ name: nameErr || undefined, date: dateErr || undefined, venue: venueErr || undefined });
      return;
    }
    const result = await dispatch(createEvent({ ...form, guests: Number(form.guests) }));
    if (createEvent.fulfilled.match(result)) onClose();
  };

  const loading = mutating;

  return (
    <Modal onClose={onClose} aria-label="Add new event" className="flex flex-col max-h-[90svh] relative">

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
          <h2 className="text-base font-bold text-white">Add New Event</h2>
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

          <div>
            <FieldLabel>Event Name <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Mehendi Ceremony"
              value={form.name} onChange={e => set('name', e.target.value)}
              onBlur={() => { if (!form.name.trim()) setErr('name', 'Required'); }}
              error={!!errors.name} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <FieldLabel>Date <span className="text-[#DFB3AE]">*</span></FieldLabel>
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
            <FieldLabel>Venue <span className="text-[#DFB3AE]">*</span></FieldLabel>
            <Input variant="dark" placeholder="e.g. Leela Palace, New Delhi"
              value={form.venue} onChange={e => set('venue', e.target.value)}
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
              <select
                className="w-full h-10 px-3 text-sm bg-[#FDFDF8]/5 border border-[#DDDED9]/20 text-white focus:outline-none focus:border-[#E4BC62]/60 transition-colors cursor-pointer"
                value={form.status}
                onChange={e => set('status', e.target.value as WeddingEvent['status'])}
              >
                <option value="pending"   className="bg-[#23292E]">Pending</option>
                <option value="planning"  className="bg-[#23292E]">Planning</option>
                <option value="confirmed" className="bg-[#23292E]">Confirmed</option>
              </select>
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea rows={3}
              className="w-full px-3 py-2.5 text-sm bg-[#FDFDF8]/5 border border-[#DDDED9]/20 text-white placeholder:text-[#DDDED9]/30 focus:outline-none focus:border-[#E4BC62]/60 transition-colors resize-none"
              placeholder="Brief description of the event…"
              value={form.desc} onChange={e => set('desc', e.target.value)} />
          </div>

        </div>

        <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-[#E4BC62]/10">
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Add Event ✦'}
          </Button>
        </div>

      </form>
    </Modal>
  );
};

export default AddEventModal;
