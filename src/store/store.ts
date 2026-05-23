import { configureStore } from '@reduxjs/toolkit';
import { api }            from './api';
import authReducer        from './slices/authSlice';
import onboardingReducer  from './slices/onboardingSlice';
import guestsReducer      from './slices/guestsSlice';
import vendorsReducer     from './slices/vendorsSlice';
import eventsReducer      from './slices/eventsSlice';
import checklistReducer   from './slices/checklistSlice';
import budgetReducer      from './slices/budgetSlice';
import seatingReducer     from './slices/seatingSlice';
import settingsReducer    from './slices/settingsSlice';

export const store = configureStore({
  reducer: {
    auth:       authReducer,
    onboarding: onboardingReducer,
    guests:     guestsReducer,
    vendors:    vendorsReducer,
    events:     eventsReducer,
    checklist:  checklistReducer,
    budget:     budgetReducer,
    seating:    seatingReducer,
    settings:   settingsReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: getDefault =>
    getDefault().concat(api.middleware),
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
