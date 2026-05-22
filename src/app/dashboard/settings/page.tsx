'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/path';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchSettings,
  saveProfile,
  saveWedding,
  saveNotifications,
  removeAccount,
  toggleNotification,
  selectSettingsStatus,
  selectSettingsSaving,
  selectSettingsProfile,
  selectSettingsWedding,
  selectNotifications,
} from '@/store/slices/settingsSlice';
import { logoutUser } from '@/store/slices/authSlice';
import {
  SettingsHeader,
  SettingsSkeleton,
  ProfileSection,
  WeddingSection,
  NotificationsSection,
  PlanBillingSection,
  DangerZone,
} from '@/features/settings';

const SettingsPage = () => {
  const dispatch      = useAppDispatch();
  const router        = useRouter();
  const status        = useAppSelector(selectSettingsStatus);
  const saving        = useAppSelector(selectSettingsSaving);
  const profile       = useAppSelector(selectSettingsProfile);
  const wedding       = useAppSelector(selectSettingsWedding);
  const notifications = useAppSelector(selectNotifications);

  const [saved, setSaved] = useState<string | null>(null);
  const loading = status === 'idle' || status === 'loading';

  useEffect(() => {
    if (status !== 'idle') return;
    const thunk = dispatch(fetchSettings());
    return () => thunk.abort();
  }, [dispatch, status]);

  const flash = (key: string) => { setSaved(key); setTimeout(() => setSaved(null), 2500); };

  const handleSaveProfile = async (data: { name: string; partnerName: string; email: string; phone: string }) => {
    const result = await dispatch(saveProfile(data));
    if (saveProfile.fulfilled.match(result)) flash('profile');
  };

  const handleSaveWedding = async (data: { weddingDate: string; venue: string; city: string; guestCount: number }) => {
    const result = await dispatch(saveWedding(data));
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
      {loading ? <SettingsSkeleton /> : (
        <>
          <ProfileSection     profile={profile}       saving={saving} showSaved={saved === 'profile'} onSave={handleSaveProfile} />
          <WeddingSection     wedding={wedding}        saving={saving} showSaved={saved === 'wedding'} onSave={handleSaveWedding} />
          <NotificationsSection notifications={notifications} onToggle={handleToggle} />
          <PlanBillingSection />
          <DangerZone         onSignOut={handleSignOut} onDeleteAccount={handleDeleteAccount} />
        </>
      )}
    </div>
  );
};

export default SettingsPage;
