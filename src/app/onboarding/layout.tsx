'use client';

import ProtectedRoute from '@/components/ProtectedRoute';

const OnboardingLayout = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>{children}</ProtectedRoute>
);

export default OnboardingLayout;
