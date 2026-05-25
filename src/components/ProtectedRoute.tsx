'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectHydrated } from '@/store/slices/authSlice';
import { PATH } from '@/constants/path';

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: Props) => {
  const router          = useRouter();
  const hydrated        = useAppSelector(selectHydrated);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace(PATH.auth.login);
    }
  }, [hydrated, isAuthenticated, router]);

  if (!hydrated) return (
    <div className="min-h-screen bg-[#FDFDF8] dark:bg-[#1A1F23] flex items-center justify-center">
      <div className="w-7 h-7 border-2 border-[#E4BC62]/30 border-t-[#E4BC62] rounded-full animate-spin" />
    </div>
  );

  // Token check done — not authenticated, redirect in progress
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
