import { configureStore } from '@reduxjs/toolkit';
import authReducer        from './slices/authSlice';
import onboardingReducer  from './slices/onboardingSlice';
import eventsReducer      from './slices/eventsSlice';
import checklistReducer   from './slices/checklistSlice';
import budgetReducer      from './slices/budgetSlice';
import guestsReducer      from './slices/guestsSlice';
import vendorsReducer     from './slices/vendorsSlice';
import settingsReducer    from './slices/settingsSlice';
import dashboardReducer      from './slices/dashboardSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    auth:        authReducer,
    onboarding:  onboardingReducer,
    events:      eventsReducer,
    checklist:   checklistReducer,
    budget:      budgetReducer,
    guests:      guestsReducer,
    vendors:     vendorsReducer,
    settings:    settingsReducer,
    dashboard:     dashboardReducer,
    notifications: notificationsReducer,
  },
});

export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
