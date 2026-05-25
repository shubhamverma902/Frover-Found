import { configureStore } from '@reduxjs/toolkit';
import { api }            from './api';
import authReducer        from './slices/authSlice';
import onboardingReducer  from './slices/onboardingSlice';
import checklistReducer   from './slices/checklistSlice';
import settingsReducer    from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    onboarding: onboardingReducer,
    checklist:  checklistReducer,
    settings:   settingsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefault =>
    getDefault().concat(api.middleware),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
