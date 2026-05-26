'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar, AppHeader } from '@/components/layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutUser, selectUser } from '@/store/slices/authSlice';
import {
  fetchOnboarding,
  selectWeddingProfile,
  selectOnboardingCompleted,
  selectOnboardingStatus,
} from '@/store/slices/onboardingSlice';
import { markAllRead } from '@/store/slices/notificationsSlice';
import { useGetNotificationsQuery } from '@/store/api';
import { PATH } from '@/constants/path';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router   = useRouter();
  const dispatch = useAppDispatch();

  const user             = useAppSelector(selectUser);
  const profile          = useAppSelector(selectWeddingProfile);
  const onboardingDone   = useAppSelector(selectOnboardingCompleted);
  const onboardingStatus = useAppSelector(selectOnboardingStatus);

  const { data: notifData, isLoading: notifLoading } = useGetNotificationsQuery(undefined, { pollingInterval: 60_000 });
  const notifications = notifData?.notifications ?? [];
  const unreadCount   = notifData?.unreadCount ?? 0;

  useEffect(() => {
    if (user && !profile && onboardingStatus === 'idle') {
      dispatch(fetchOnboarding());
    }
  }, [user, profile, onboardingStatus, dispatch]);

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push(PATH.home);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllRead());
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-background dark:bg-[#0f1214]">
        <Sidebar
          open={sidebarOpen}
          user={user}
          profile={profile}
          onboardingDone={onboardingDone}
        />

        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            profile={profile}
            notifications={notifications}
            unreadCount={unreadCount}
            notifLoading={notifLoading}
            onLogout={handleLogout}
            onMarkAllRead={handleMarkAllRead}
          />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
