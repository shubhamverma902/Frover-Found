'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/path';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  saveProfile,
  saveWedding,
  saveNotifications,
  removeAccount,
  toggleNotification,
  selectSettingsSaving,
  selectNotifications,
} from '@/store/slices/settingsSlice';
import { logoutUser, selectCollaboratorRole } from '@/store/slices/authSlice';
import { useGetSettingsQuery } from '@/store/api';
import {
  SettingsHeader,
  SettingsSkeleton,
  ProfileSection,
  WeddingSection,
  NotificationsSection,
  PartnerSection,
  CollaboratorsSection,
  ShareWeddingSection,
  LeaveCollaborationSection,
  PlanBillingSection,
  DangerZone,
  GdprSection,
} from '@/features/settings';
import { exportMyDataApi } from '@/api/settings.api';

const SettingsPage = () => {
  const dispatch      = useAppDispatch();
  const router        = useRouter();
  const saving            = useAppSelector(selectSettingsSaving);
  const notifications     = useAppSelector(selectNotifications);
  const collaboratorRole  = useAppSelector(selectCollaboratorRole);
  const isCollaborator    = !!collaboratorRole;

  const { data, isLoading } = useGetSettingsQuery();
  const profile = data?.profile ?? null;
  const wedding = data?.wedding ?? null;

  const [saved, setSaved] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

  const flash = (key: string) => {
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setSaved(key);
    flashTimer.current = setTimeout(() => setSaved(null), 2500);
  };

  const handleSaveProfile = async (d: { name: string; partnerName: string; email: string; phone: string }) => {
    const result = await dispatch(saveProfile(d));
    if (saveProfile.fulfilled.match(result)) flash('profile');
  };

  const handleSaveWedding = async (d: { weddingDate: string; venue: string; city: string; guestCount: number }) => {
    const result = await dispatch(saveWedding(d));
    if (saveWedding.fulfilled.match(result)) flash('wedding');
  };

  const handleToggle = (key: string) => {
    dispatch(toggleNotification(key));
    const updated = notifications.map(n => n.key === key ? { ...n, on: !n.on } : n);
    dispatch(saveNotifications(Object.fromEntries(updated.map(n => [n.key, n.on]))));
  };

  const handleDeleteAccount = async () => {
    const result = await dispatch(removeAccount());
    if (removeAccount.fulfilled.match(result)) { dispatch(logoutUser()); router.replace(PATH.auth.login); }
  };

  const handleSignOut = () => { dispatch(logoutUser()); router.replace(PATH.auth.login); };

  return (
    <div className="p-6 lg:p-8 space-y-6 page-sections">
      <SettingsHeader />
      {isLoading ? <SettingsSkeleton /> : (
        <>
          <ProfileSection     profile={profile}       saving={saving} showSaved={saved === 'profile'} onSave={handleSaveProfile} />
          <WeddingSection     wedding={wedding}        saving={saving} showSaved={saved === 'wedding'} onSave={handleSaveWedding} />
          {!isCollaborator && <ShareWeddingSection />}
          <NotificationsSection notifications={notifications} onToggle={handleToggle} />
          {!isCollaborator && <PartnerSection />}
          {!isCollaborator && <CollaboratorsSection />}
          {isCollaborator && <LeaveCollaborationSection />}
          <PlanBillingSection />
          <GdprSection        onExport={exportMyDataApi} />
          <DangerZone         onSignOut={handleSignOut} onDeleteAccount={handleDeleteAccount} />
        </>
      )}
    </div>
  );
};

export default SettingsPage;
