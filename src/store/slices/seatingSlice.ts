import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { SeatingTable, Guest } from '@/constants/dashboard-pages';
import { fetchTablesApi, createTableApi, updateTableApi, deleteTableApi, assignGuestApi } from '@/api/seating.api';
import { fetchGuestsApi } from '@/api/guests.api';

interface SeatingState {
  tables:   SeatingTable[];
  guests:   Guest[];          // all guests, fetched once for assignment purposes
  status:   'idle' | 'loading' | 'succeeded' | 'failed';
  mutating: boolean;
  error:    string | null;
}

const initialState: SeatingState = {
  tables:   [],
  guests:   [],
  status:   'idle',
  mutating: false,
  error:    null,
};

export const fetchSeating = createAsyncThunk(
  'seating/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const [tables, guestsResult] = await Promise.all([
        fetchTablesApi(),
        fetchGuestsApi(1, 9999),
      ]);
      return { tables, guests: guestsResult.guests };
    } catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load seating'); }
  }
);

export const createTable = createAsyncThunk(
  'seating/createTable',
  async (payload: { name: string; capacity: number; shape: SeatingTable['shape'] }, { rejectWithValue }) => {
    try { return await createTableApi(payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to create table'); }
  }
);

export const updateTable = createAsyncThunk(
  'seating/updateTable',
  async ({ id, ...payload }: { id: string; name: string; capacity: number; shape: SeatingTable['shape'] }, { rejectWithValue }) => {
    try { return await updateTableApi(id, payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update table'); }
  }
);

export const deleteTable = createAsyncThunk(
  'seating/deleteTable',
  async (id: string, { rejectWithValue }) => {
    try { await deleteTableApi(id); return id; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to delete table'); }
  }
);

export const assignGuest = createAsyncThunk(
  'seating/assignGuest',
  async ({ guestId, tableId }: { guestId: string; tableId: string | null }, { rejectWithValue }) => {
    try { return await assignGuestApi(guestId, tableId); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to assign guest'); }
  }
);

const seatingSlice = createSlice({
  name: 'seating',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchSeating.pending,   state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchSeating.fulfilled, (state, { payload }) => {
        state.status  = 'succeeded';
        state.tables  = payload.tables;
        state.guests  = payload.guests;
      })
      .addCase(fetchSeating.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload as string; });

    builder
      .addCase(createTable.pending,   state => { state.mutating = true; })
      .addCase(createTable.fulfilled, (state, { payload }) => { state.mutating = false; state.tables.push(payload); })
      .addCase(createTable.rejected,  state => { state.mutating = false; });

    builder
      .addCase(updateTable.pending,   state => { state.mutating = true; })
      .addCase(updateTable.fulfilled, (state, { payload }) => {
        state.mutating = false;
        const i = state.tables.findIndex(t => t._id === payload._id);
        if (i !== -1) state.tables[i] = payload;
      })
      .addCase(updateTable.rejected,  state => { state.mutating = false; });

    builder
      .addCase(deleteTable.pending,   state => { state.mutating = true; })
      .addCase(deleteTable.fulfilled, (state, { payload: id }) => {
        state.mutating = false;
        state.tables   = state.tables.filter(t => t._id !== id);
      })
      .addCase(deleteTable.rejected,  state => { state.mutating = false; });

    builder
      .addCase(assignGuest.fulfilled, (state, { payload }) => { state.tables = payload; });
  },
});

export const selectSeatingTables  = (state: RootState) => state.seating.tables;
export const selectSeatingGuests  = (state: RootState) => state.seating.guests;
export const selectSeatingStatus  = (state: RootState) => state.seating.status;
export const selectSeatingMutating = (state: RootState) => state.seating.mutating;

export const selectAssignedGuestIds = (state: RootState): Set<string> =>
  new Set(state.seating.tables.flatMap(t => t.guestIds));

export const selectUnassignedGuests = (state: RootState): Guest[] => {
  const assigned = selectAssignedGuestIds(state);
  return state.seating.guests.filter(g => !assigned.has(g._id));
};

export default seatingSlice.reducer;
