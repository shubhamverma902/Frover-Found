import { createSlice } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../thunk';
import type { AxiosError } from 'axios';
import type { RootState } from '../store';
import type { SeatingTable } from '@/constants/dashboard-pages';
import { createTableApi, updateTableApi, deleteTableApi, assignGuestApi } from '@/api/seating.api';
import { api } from '../api';

type ApiErr = AxiosError<{ message?: string }>;

// ── State ─────────────────────────────────────────────────

interface SeatingState {
  mutating: boolean;
}

const initialState: SeatingState = { mutating: false };

// ── Thunks ────────────────────────────────────────────────

export const createTable = createAppAsyncThunk(
  'seating/createTable',
  async (payload: { name: string; capacity: number; shape: SeatingTable['shape'] }, { dispatch, rejectWithValue }) => {
    try {
      const result = await createTableApi(payload);
      dispatch(api.util.invalidateTags(['Seating']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to create table'); }
  }
);

export const updateTable = createAppAsyncThunk(
  'seating/updateTable',
  async ({ id, ...payload }: { id: string; name: string; capacity: number; shape: SeatingTable['shape'] }, { dispatch, rejectWithValue }) => {
    try {
      const result = await updateTableApi(id, payload);
      dispatch(api.util.invalidateTags(['Seating']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update table'); }
  }
);

export const deleteTable = createAppAsyncThunk(
  'seating/deleteTable',
  async (id: string, { dispatch, rejectWithValue }) => {
    const patch = dispatch(api.util.updateQueryData('getSeating', undefined, draft => {
      const idx = draft.tables.findIndex(t => t._id === id);
      if (idx !== -1) draft.tables.splice(idx, 1);
    }));
    try {
      await deleteTableApi(id);
      dispatch(api.util.invalidateTags(['Seating']));
      return id;
    } catch (e) {
      patch.undo();
      return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to delete table');
    }
  }
);

export const assignGuest = createAppAsyncThunk(
  'seating/assignGuest',
  async ({ guestId, tableId }: { guestId: string; tableId: string | null }, { dispatch, rejectWithValue }) => {
    const patch = dispatch(api.util.updateQueryData('getSeating', undefined, draft => {
      for (const table of draft.tables) {
        const i = table.guestIds.indexOf(guestId);
        if (i !== -1) table.guestIds.splice(i, 1);
      }
      if (tableId) {
        const target = draft.tables.find(t => t._id === tableId);
        if (target && !target.guestIds.includes(guestId)) target.guestIds.push(guestId);
      }
    }));
    try {
      const result = await assignGuestApi(guestId, tableId);
      dispatch(api.util.invalidateTags(['Seating']));
      return result;
    } catch (e) {
      patch.undo();
      return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to assign guest');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────

const seatingSlice = createSlice({
  name: 'seating',
  initialState,
  reducers: {},
  extraReducers: builder => {
    const setMutating = (v: boolean) => (state: SeatingState) => { state.mutating = v; };
    [createTable, updateTable, deleteTable, assignGuest].forEach(thunk => {
      builder
        .addCase(thunk.pending,   setMutating(true))
        .addCase(thunk.fulfilled, setMutating(false))
        .addCase(thunk.rejected,  setMutating(false));
    });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectSeatingMutating = (state: RootState) => state.seating.mutating;

export default seatingSlice.reducer;
