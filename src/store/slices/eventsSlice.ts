import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { WeddingEvent } from '@/constants/dashboard-pages';
import {
  fetchEventsApi,
  createEventApi,
  updateEventApi,
  patchEventStatusApi,
  deleteEventApi,
} from '@/api/events.api';

// ── State ────────────────────────────────────────────────────

interface EventsState {
  items:  WeddingEvent[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error:  string | null;
}

const initialState: EventsState = {
  items:  [],
  status: 'idle',
  error:  null,
};

// ── Thunks ───────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await fetchEventsApi(); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load events'); }
  }
);

export const createEvent = createAsyncThunk(
  'events/create',
  async (payload: Omit<WeddingEvent, '_id'>, { rejectWithValue }) => {
    try { return await createEventApi(payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to create event'); }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, payload }: { id: string; payload: Omit<WeddingEvent, '_id'> }, { rejectWithValue }) => {
    try { return await updateEventApi(id, payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update event'); }
  }
);

export const patchEventStatus = createAsyncThunk(
  'events/patchStatus',
  async ({ id, status }: { id: string; status: WeddingEvent['status'] }, { rejectWithValue }) => {
    try { return await patchEventStatusApi(id, status); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update status'); }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: string, { rejectWithValue }) => {
    try { await deleteEventApi(id); return id; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to delete event'); }
  }
);

// ── Slice ────────────────────────────────────────────────────

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: builder => {
    // fetch
    builder
      .addCase(fetchEvents.pending,    state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchEvents.fulfilled,  (state, { payload }) => { state.status = 'succeeded'; state.items = payload; })
      .addCase(fetchEvents.rejected,   (state, { payload }) => { state.status = 'failed'; state.error = payload as string; });

    // create
    builder
      .addCase(createEvent.fulfilled, (state, { payload }) => { state.items.push(payload); });

    // update
    builder
      .addCase(updateEvent.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(e => e._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      });

    // patch status
    builder
      .addCase(patchEventStatus.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(e => e._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      });

    // delete
    builder
      .addCase(deleteEvent.fulfilled, (state, { payload: id }) => {
        state.items = state.items.filter(e => e._id !== id);
      });
  },
});

// ── Selectors ────────────────────────────────────────────────

export const selectEvents         = (state: RootState) => state.events.items;
export const selectEventsStatus   = (state: RootState) => state.events.status;
export const selectEventsError    = (state: RootState) => state.events.error;
export const selectConfirmedCount = (state: RootState) =>
  state.events.items.filter(e => e.status === 'confirmed').length;

export default eventsSlice.reducer;
