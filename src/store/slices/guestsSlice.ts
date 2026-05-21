import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
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
  status:   'idle' | 'loading' | 'succeeded' | 'failed';
  mutating: boolean;
  error:    string | null;
}

const initialState: GuestsState = {
  items:      [],
  total:      0,
  page:       1,
  totalPages: 1,
  status:   'idle',
  mutating: false,
  error:    null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchGuests = createAsyncThunk(
  'guests/fetchAll',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue }) => {
    try { return await fetchGuestsApi(page, limit); }
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
      .addCase(fetchGuests.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload as string; });

    builder
      .addCase(createGuest.pending,   state => { state.mutating = true; })
      .addCase(createGuest.fulfilled, state => { state.mutating = false; })
      .addCase(createGuest.rejected,  state => { state.mutating = false; });

    builder
      .addCase(patchGuestRsvp.pending,   state => { state.mutating = true; })
      .addCase(patchGuestRsvp.fulfilled, (state, { payload }) => {
        state.mutating = false;
        const idx = state.items.findIndex(g => g._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(patchGuestRsvp.rejected,  state => { state.mutating = false; });

    builder
      .addCase(deleteGuest.pending,   state => { state.mutating = true; })
      .addCase(deleteGuest.fulfilled, (state, { payload }) => {
        state.mutating = false;
        state.items    = state.items.filter(g => g._id !== payload);
        state.total    = Math.max(0, state.total - 1);
      })
      .addCase(deleteGuest.rejected,  state => { state.mutating = false; });
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
