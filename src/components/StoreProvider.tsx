'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { restoreAuth } from '@/store/slices/authSlice';

const AuthRestorer = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    store.dispatch(restoreAuth());
  }, []);

  return <>{children}</>;
};

const StoreProvider = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>
    <AuthRestorer>{children}</AuthRestorer>
  </Provider>
);

export default StoreProvider;
