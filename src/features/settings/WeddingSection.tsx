'use client';

import { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsField } from './SettingsField';
import { SettingsSaveBtn } from './SettingsSaveBtn';

interface WeddingData {
  weddingDate: string;
  venue: string;
  city: string;
  guestCount: number;
}

interface Props {
  wedding: WeddingData | null;
  saving: string | null;
  showSaved: boolean;
  onSave: (data: { weddingDate: string; venue: string; city: string; guestCount: number }) => void;
}

export const WeddingSection = ({ wedding, saving, showSaved, onSave }: Props) => {
  const [weddingDate, setWeddingDate] = useState('');
  const [venue,       setVenue]       = useState('');
  const [city,        setCity]        = useState('');
  const [guestCount,  setGuestCount]  = useState('');

  useEffect(() => {
    if (wedding) {
      setWeddingDate(wedding.weddingDate);
      setVenue(wedding.venue);
      setCity(wedding.city);
      setGuestCount(String(wedding.guestCount));
    }
  }, [wedding]);

  return (
    <SettingsSection icon="💍" title="Wedding Details">
      {wedding ? (
        <form onSubmit={e => { e.preventDefault(); onSave({ weddingDate, venue, city, guestCount: Number(guestCount) }); }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SettingsField label="Wedding Date"    value={weddingDate} onChange={setWeddingDate} type="date"   disabled={saving === 'wedding'} />
            <SettingsField label="Venue"           value={venue}       onChange={setVenue}                     disabled={saving === 'wedding'} maxLength={200} />
            <SettingsField label="City"            value={city}        onChange={setCity}                      disabled={saving === 'wedding'} maxLength={100} />
            <SettingsField label="Expected Guests" value={guestCount}  onChange={setGuestCount}  type="number" disabled={saving === 'wedding'} />
          </div>
          <div className="flex items-center gap-3">
            <SettingsSaveBtn saving={saving === 'wedding'} label="Save Details" />
            {showSaved && <span role="status" className="text-[11px] font-semibold text-gold animate-fade-in-up">✓ Saved</span>}
          </div>
        </form>
      ) : (
        <p className="text-sm text-silver/40">Complete onboarding first to manage wedding details.</p>
      )}
    </SettingsSection>
  );
};
