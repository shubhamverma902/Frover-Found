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

  // Don't render anything until the initial token check is complete
  if (!hydrated) return null;

  // Token check done — not authenticated, redirect in progress
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
