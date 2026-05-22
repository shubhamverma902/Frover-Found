import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { WeddingEvent } from '@/constants/dashboard-pages';
import {
  fetchEventsApi,
  createEventApi,
  updateEventApi,
  patchEventStatusApi,
  deleteEventApi,
  addEventAttachmentApi,
  removeEventAttachmentApi,
} from '@/api/events.api';

// ── State ────────────────────────────────────────────────────

interface EventsState {
  items:          WeddingEvent[];
  status:         'idle' | 'loading' | 'succeeded' | 'failed';
  error:          string | null;
  _statusRollback: { id: string; status: WeddingEvent['status'] } | null;
  _deletedEvent:   { event: WeddingEvent; index: number } | null;
}

const initialState: EventsState = {
  items:           [],
  status:          'idle',
  error:           null,
  _statusRollback: null,
  _deletedEvent:   null,
};

// ── Thunks ───────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async (_, { rejectWithValue, signal }) => {
    try { return await fetchEventsApi(signal); }
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

export const addEventAttachment = createAsyncThunk(
  'events/addAttachment',
  async ({ eventId, file }: { eventId: string; file: File }, { rejectWithValue }) => {
    try { return await addEventAttachmentApi(eventId, file); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Upload failed'); }
  }
);

export const removeEventAttachment = createAsyncThunk(
  'events/removeAttachment',
  async ({ eventId, fileId }: { eventId: string; fileId: string }, { rejectWithValue }) => {
    try { return await removeEventAttachmentApi(eventId, fileId); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Delete failed'); }
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
      .addCase(fetchEvents.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed'; state.error = action.payload as string;
      });

    // create — needs server _id, stays pessimistic
    builder
      .addCase(createEvent.fulfilled, (state, { payload }) => { state.items.push(payload); });

    // update — modal closes on submit so optimistic adds no visible benefit
    builder
      .addCase(updateEvent.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(e => e._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      });

    // patch status — optimistic: apply immediately, restore on failure
    builder
      .addCase(patchEventStatus.pending, (state, { meta }) => {
        const { id, status } = meta.arg;
        const event = state.items.find(e => e._id === id);
        if (event) {
          state._statusRollback = { id, status: event.status };
          event.status = status;
        }
      })
      .addCase(patchEventStatus.fulfilled, (state, { payload }) => {
        state._statusRollback = null;
        const idx = state.items.findIndex(e => e._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(patchEventStatus.rejected, state => {
        if (state._statusRollback) {
          const { id, status } = state._statusRollback;
          const event = state.items.find(e => e._id === id);
          if (event) event.status = status;
          state._statusRollback = null;
        }
      });

    // delete — optimistic: remove immediately, restore at original index on failure
    builder
      .addCase(deleteEvent.pending, (state, { meta }) => {
        const idx = state.items.findIndex(e => e._id === meta.arg);
        if (idx !== -1) {
          state._deletedEvent = { event: current(state.items[idx]), index: idx };
          state.items.splice(idx, 1);
        }
      })
      .addCase(deleteEvent.fulfilled, state => { state._deletedEvent = null; })
      .addCase(deleteEvent.rejected, state => {
        if (state._deletedEvent) {
          state.items.splice(state._deletedEvent.index, 0, state._deletedEvent.event);
          state._deletedEvent = null;
        }
      });

    // attachments — must wait for server (need real URL); sync on fulfilled
    builder
      .addCase(addEventAttachment.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(e => e._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
      })
      .addCase(removeEventAttachment.fulfilled, (state, { payload }) => {
        const idx = state.items.findIndex(e => e._id === payload._id);
        if (idx !== -1) state.items[idx] = payload;
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
