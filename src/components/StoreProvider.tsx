'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { restoreAuth, logout } from '@/store/slices/authSlice';

const AuthRestorer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    store.dispatch(restoreAuth());

    // Fired by the axios interceptor when a token refresh fails mid-session.
    // We dispatch the sync `logout` action (not logoutUser) because the cookie
    // has already been invalidated server-side at this point.
    const handleForceLogout = () => store.dispatch(logout());
    window.addEventListener('auth:logout', handleForceLogout);
    return () => window.removeEventListener('auth:logout', handleForceLogout);
  }, []);

  return <>{children}</>;
};

const StoreProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <AuthRestorer>{children}</AuthRestorer>
  </Provider>
);

export default StoreProvider;
