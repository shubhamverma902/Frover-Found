'use client';

import { useState } from 'react';
import { Sidebar, AppHeader } from '@/components/layout';
import ProtectedRoute from '@/components/ProtectedRoute';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-[#FDFDF8] dark:bg-[#0f1214]">
        <Sidebar open={sidebarOpen} />

        {/* Overlay click to close on mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
