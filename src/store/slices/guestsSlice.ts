import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Guest } from '@/constants/dashboard-pages';
import {
  fetchGuestsApi,
  createGuestApi,
  patchGuestRsvpApi,
  deleteGuestApi,
  type CreateGuestPayload,
} from '@/api/guests.api';

// ── State ─────────────────────────────────────────────────

interface GuestsState {
  items:      Guest[];
  total:      number;
  page:       number;
  totalPages: number;
  status:     'idle' | 'loading' | 'succeeded' | 'failed';
  mutating:   boolean;
  error:      string | null;
  _rsvpRollback:    { guestId: string; rsvp: Guest['rsvp'] } | null;
  _deletedGuest:    { guest: Guest; index: number } | null;
}

const initialState: GuestsState = {
  items:      [],
  total:      0,
  page:       1,
  totalPages: 1,
  status:     'idle',
  mutating:   false,
  error:      null,
  _rsvpRollback:    null,
  _deletedGuest:    null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchGuests = createAsyncThunk(
  'guests/fetchAll',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue, signal }) => {
    try { return await fetchGuestsApi(page, limit, signal); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load guests'); }
  }
);

export const createGuest = createAsyncThunk(
  'guests/create',
  async (payload: CreateGuestPayload, { rejectWithValue }) => {
    try { return await createGuestApi(payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to add guest'); }
  }
);

export const patchGuestRsvp = createAsyncThunk(
  'guests/patchRsvp',
  async ({ guestId, rsvp }: { guestId: string; rsvp: Guest['rsvp'] }, { rejectWithValue }) => {
    try { return await patchGuestRsvpApi(guestId, rsvp); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update RSVP'); }
  }
);

export const deleteGuest = createAsyncThunk(
  'guests/delete',
  async (guestId: string, { rejectWithValue }) => {
    try { await deleteGuestApi(guestId); return guestId; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to remove guest'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchGuests.pending,   state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchGuests.fulfilled, (state, { payload }) => {
        state.status     = 'succeeded';
        state.items      = payload.guests;
        state.total      = payload.total;
        state.page       = payload.page;
        state.totalPages = payload.totalPages;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed'; state.error = action.payload as string;
      });

    builder
      .addCase(createGuest.pending,   state => { state.mutating = true; })
      .addCase(createGuest.fulfilled, state => { state.mutating = false; })
      .addCase(createGuest.rejected,  state => { state.mutating = false; });

    builder
      // Optimistic RSVP: apply immediately, store old value, restore on failure
      .addCase(patchGuestRsvp.pending, (state, { meta }) => {
        const { guestId, rsvp } = meta.arg;
        const guest = state.items.find(g => g._id === guestId);
        if (guest) {
          state._rsvpRollback = { guestId, rsvp: guest.rsvp };
          guest.rsvp = rsvp;
        }
      })
      .addCase(patchGuestRsvp.fulfilled, (state, { payload }) => {
        state._rsvpRollback = null;
        const idx = state.items.findIndex(g => g._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(patchGuestRsvp.rejected, state => {
        if (state._rsvpRollback) {
          const { guestId, rsvp } = state._rsvpRollback;
          const guest = state.items.find(g => g._id === guestId);
          if (guest) guest.rsvp = rsvp;
          state._rsvpRollback = null;
        }
      });

    builder
      // Optimistic delete: remove immediately, restore at original index on failure
      .addCase(deleteGuest.pending, (state, { meta }) => {
        state.mutating = true;
        const idx = state.items.findIndex(g => g._id === meta.arg);
        if (idx !== -1) {
          state._deletedGuest = { guest: current(state.items[idx]), index: idx };
          state.items.splice(idx, 1);
          state.total = Math.max(0, state.total - 1);
        }
      })
      .addCase(deleteGuest.fulfilled, state => {
        state.mutating      = false;
        state._deletedGuest = null;
      })
      .addCase(deleteGuest.rejected, state => {
        state.mutating = false;
        if (state._deletedGuest) {
          state.items.splice(state._deletedGuest.index, 0, state._deletedGuest.guest);
          state.total         += 1;
          state._deletedGuest  = null;
        }
      });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectGuests      = (state: RootState) => state.guests.items;
export const selectGuestTotal  = (state: RootState) => state.guests.total;
export const selectGuestPage   = (state: RootState) => state.guests.page;
export const selectTotalPages  = (state: RootState) => state.guests.totalPages;
export const selectGuestStatus = (state: RootState) => state.guests.status;
export const selectGuestMutating = (state: RootState) => state.guests.mutating;
export const selectConfirmed   = (state: RootState) => state.guests.items.filter(g => g.rsvp === 'confirmed').length;
export const selectPending     = (state: RootState) => state.guests.items.filter(g => g.rsvp === 'pending').length;
export const selectDeclined    = (state: RootState) => state.guests.items.filter(g => g.rsvp === 'declined').length;

export default guestsSlice.reducer;
