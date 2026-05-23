'use client';

import { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { SettingsField } from './SettingsField';
import { SettingsSaveBtn } from './SettingsSaveBtn';

interface ProfileData {
  name: string;
  partnerName: string;
  email: string;
  phone: string;
}

interface Props {
  profile: ProfileData | null;
  saving: string | null;
  showSaved: boolean;
  onSave: (data: ProfileData) => void;
}

export const ProfileSection = ({ profile, saving, showSaved, onSave }: Props) => {
  const [name,        setName]        = useState('');
  const [partnerName, setPartnerName] = useState('');
  const [email,       setEmail]       = useState('');
  const [phone,       setPhone]       = useState('');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setPartnerName(profile.partnerName);
      setEmail(profile.email);
      setPhone(profile.phone);
    }
  }, [profile]);

  return (
    <SettingsSection icon="👤" title="Your Profile">
      <form onSubmit={e => { e.preventDefault(); onSave({ name, partnerName, email, phone }); }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SettingsField label="Full Name"     value={name}        onChange={setName}        disabled={saving === 'profile'} />
          <SettingsField label="Partner Name"  value={partnerName} onChange={setPartnerName} disabled={saving === 'profile'} />
          <SettingsField label="Email Address" value={email}       onChange={setEmail}       type="email" disabled={saving === 'profile'} />
          <SettingsField label="Phone Number"  value={phone}       onChange={setPhone}       type="tel"   disabled={saving === 'profile'} />
        </div>
        <div className="flex items-center gap-3">
          <SettingsSaveBtn saving={saving === 'profile'} label="Save Profile" />
          {showSaved && <span role="status" className="text-[11px] font-semibold text-[#E4BC62] animate-fade-in-up">✓ Saved</span>}
        </div>
      </form>
    </SettingsSection>
  );
};
