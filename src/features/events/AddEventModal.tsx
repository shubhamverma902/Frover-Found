'use client';

import { useState } from 'react';
import { ModalShell } from '@/components/ui';
import { Button, Input, FieldLabel } from '@/components/elements';
import { useCreateEventMutation } from '@/store/api';
import type { WeddingEvent } from '@/types/event';

type FormData = Omit<WeddingEvent, '_id'>;

const EMPTY: FormData = {
  name: '', date: '', time: '', venue: '', guests: 0, status: 'pending', desc: '',
};

interface AddEventModalProps {
  onClose: () => void;
}

const AddEventModal = ({ onClose }: AddEventModalProps) => {
  const [createEvent, { isLoading: loading }] = useCreateEventMutation();
  const [form,   setForm]   = useState<FormData>({ ...EMPTY });
  const [errors, setErrors] = useState<{ name?: string; date?: string; venue?: string }>({});

  const setErr = (k: keyof typeof errors, msg: string | undefined) =>
    setErrors(prev => ({ ...prev, [k]: msg }));

  const set = (k: keyof FormData, v: string | number) => {
    setForm(prev => ({ ...prev, [k]: v }));
    if (k === 'name'  && errors.name  !== undefined) setErr('name',  !String(v).trim() ? 'Required' : undefined);
    if (k === 'date'  && errors.date  !== undefined) setErr('date',  v ? undefined : 'Required');
    if (k === 'venue' && errors.venue !== undefined) setErr('venue', !String(v).trim() ? 'Required' : undefined);
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
    try {
      await createEvent({ ...form, guests: Number(form.guests) }).unwrap();
      onClose();
    } catch { }
  };

  return (
    <ModalShell onClose={onClose} eyebrow="Planning" title="Add New Event" aria-label="Add new event">

      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[radial-gradient(circle,rgba(205,180,219,0.12)_0%,transparent_70%)]" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-[radial-gradient(circle,rgba(216,167,177,0.08)_0%,transparent_70%)]" />
        <span className="absolute top-4 right-16 text-gold/6 text-[7rem] font-black leading-none select-none">◆</span>
      </div>

      <ModalShell.Form onSubmit={handleSubmit}>
        <ModalShell.Body>

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
              <select
                className="w-full h-10 px-3 text-sm bg-background/5 border border-silver/20 text-white focus:outline-none focus:border-gold/60 transition-colors cursor-pointer"
                value={form.status}
                onChange={e => set('status', e.target.value as WeddingEvent['status'])}
              >
                <option value="pending"   className="bg-dark">Pending</option>
                <option value="planning"  className="bg-dark">Planning</option>
                <option value="confirmed" className="bg-dark">Confirmed</option>
              </select>
            </div>
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea rows={3}
              className="w-full px-3 py-2.5 text-sm bg-background/5 border border-silver/20 text-white placeholder:text-silver/30 focus:outline-none focus:border-gold/60 transition-colors resize-none"
              placeholder="Brief description of the event…"
              value={form.desc} maxLength={2000} onChange={e => set('desc', e.target.value)} />
          </div>

        </ModalShell.Body>
        <ModalShell.Footer>
          <Button variant="cancel" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="gold" type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Add Event ✦'}
          </Button>
        </ModalShell.Footer>
      </ModalShell.Form>
    </ModalShell>
  );
};

export default AddEventModal;
