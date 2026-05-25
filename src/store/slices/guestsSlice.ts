import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type { RootState } from '../store';
import type { Guest } from '@/constants/dashboard-pages';
import { createGuestApi, patchGuestRsvpApi, deleteGuestApi, type CreateGuestPayload } from '@/api/guests.api';
import { api } from '../api';

type ApiErr = AxiosError<{ message?: string }>;

// ── State ─────────────────────────────────────────────────

interface GuestsState {
  mutating: boolean;
}

const initialState: GuestsState = { mutating: false };

// ── Thunks ────────────────────────────────────────────────

export const createGuest = createAsyncThunk(
  'guests/create',
  async (payload: CreateGuestPayload, { dispatch, rejectWithValue }) => {
    try {
      const guest = await createGuestApi(payload);
      dispatch(api.util.invalidateTags([{ type: 'Guest', id: 'LIST' }]));
      return guest;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to add guest'); }
  }
);

export const patchGuestRsvp = createAsyncThunk(
  'guests/patchRsvp',
  async ({ guestId, rsvp }: { guestId: string; rsvp: Guest['rsvp'] }, { dispatch, rejectWithValue }) => {
    try {
      const guest = await patchGuestRsvpApi(guestId, rsvp);
      dispatch(api.util.invalidateTags([{ type: 'Guest', id: 'LIST' }]));
      return guest;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update RSVP'); }
  }
);

export const deleteGuest = createAsyncThunk(
  'guests/delete',
  async (guestId: string, { dispatch, rejectWithValue }) => {
    try {
      await deleteGuestApi(guestId);
      dispatch(api.util.invalidateTags([{ type: 'Guest', id: 'LIST' }]));
      return guestId;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to remove guest'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const guestsSlice = createSlice({
  name: 'guests',
  initialState,
  reducers: {
    resetMutating: (state) => { state.mutating = false; },
  },
  extraReducers: builder => {
    const setMutating = (v: boolean) => (state: GuestsState) => { state.mutating = v; };
    builder
      .addCase(createGuest.pending,    setMutating(true))
      .addCase(createGuest.fulfilled,  setMutating(false))
      .addCase(createGuest.rejected,   setMutating(false))
      .addCase(patchGuestRsvp.pending,   setMutating(true))
      .addCase(patchGuestRsvp.fulfilled, setMutating(false))
      .addCase(patchGuestRsvp.rejected,  setMutating(false))
      .addCase(deleteGuest.pending,    setMutating(true))
      .addCase(deleteGuest.fulfilled,  setMutating(false))
      .addCase(deleteGuest.rejected,   setMutating(false));
  },
});

// ── Selectors ─────────────────────────────────────────────

export const { resetMutating: resetGuestMutating } = guestsSlice.actions;

export const selectGuestMutating = (state: RootState) => state.guests.mutating;

export default guestsSlice.reducer;
