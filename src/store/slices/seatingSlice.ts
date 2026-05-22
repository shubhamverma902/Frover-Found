import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { SeatingTable, Guest } from '@/constants/dashboard-pages';
import { fetchTablesApi, createTableApi, updateTableApi, deleteTableApi, assignGuestApi } from '@/api/seating.api';
import { fetchGuestsApi } from '@/api/guests.api';

interface SeatingState {
  tables:          SeatingTable[];
  guests:          Guest[];
  status:          'idle' | 'loading' | 'succeeded' | 'failed';
  mutating:        boolean;
  error:           string | null;
  _tablesSnapshot: SeatingTable[] | null; // rollback for assignGuest
  _deletedTable:   { table: SeatingTable; index: number } | null;
}

const initialState: SeatingState = {
  tables:          [],
  guests:          [],
  status:          'idle',
  mutating:        false,
  error:           null,
  _tablesSnapshot: null,
  _deletedTable:   null,
};

export const fetchSeating = createAsyncThunk(
  'seating/fetchAll',
  async (_, { rejectWithValue, signal }) => {
    try {
      const [tables, guestsResult] = await Promise.all([
        fetchTablesApi(signal),
        fetchGuestsApi(1, 9999, signal),
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
      .addCase(fetchSeating.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed'; state.error = action.payload as string;
      });

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
      // Optimistic delete: remove immediately, restore on failure
      .addCase(deleteTable.pending, (state, { meta }) => {
        state.mutating = true;
        const idx = state.tables.findIndex(t => t._id === meta.arg);
        if (idx !== -1) {
          state._deletedTable = { table: current(state.tables[idx]), index: idx };
          state.tables.splice(idx, 1);
        }
      })
      .addCase(deleteTable.fulfilled, state => {
        state.mutating      = false;
        state._deletedTable = null;
      })
      .addCase(deleteTable.rejected, state => {
        state.mutating = false;
        if (state._deletedTable) {
          state.tables.splice(state._deletedTable.index, 0, state._deletedTable.table);
          state._deletedTable = null;
        }
      });

    builder
      // Optimistic drag-and-drop: move guest locally, sync with server truth on success
      .addCase(assignGuest.pending, (state, { meta }) => {
        const { guestId, tableId } = meta.arg;
        state._tablesSnapshot = current(state.tables);
        // Remove from every table first (mirrors the backend's $pull)
        for (const table of state.tables) {
          const i = table.guestIds.indexOf(guestId);
          if (i !== -1) table.guestIds.splice(i, 1);
        }
        // Place into the target table
        if (tableId) {
          const target = state.tables.find(t => t._id === tableId);
          if (target && !target.guestIds.includes(guestId)) target.guestIds.push(guestId);
        }
      })
      .addCase(assignGuest.fulfilled, (state, { payload }) => {
        state._tablesSnapshot = null;
        state.tables = payload;
      })
      .addCase(assignGuest.rejected, state => {
        if (state._tablesSnapshot) {
          state.tables          = state._tablesSnapshot;
          state._tablesSnapshot = null;
        }
      });
  },
});

export const selectSeatingTables   = (state: RootState) => state.seating.tables;
export const selectSeatingGuests   = (state: RootState) => state.seating.guests;
export const selectSeatingStatus   = (state: RootState) => state.seating.status;
export const selectSeatingMutating = (state: RootState) => state.seating.mutating;

export const selectAssignedGuestIds = (state: RootState): Set<string> =>
  new Set(state.seating.tables.flatMap(t => t.guestIds));

export const selectUnassignedGuests = (state: RootState): Guest[] => {
  const assigned = selectAssignedGuestIds(state);
  return state.seating.guests.filter(g => !assigned.has(g._id));
};

export default seatingSlice.reducer;
