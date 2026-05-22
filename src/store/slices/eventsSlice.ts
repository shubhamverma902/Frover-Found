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
  items:           WeddingEvent[];
  total:           number;
  page:            number;
  totalPages:      number;
  confirmedCount:  number;
  planningCount:   number;
  pendingCount:    number;
  status:          'idle' | 'loading' | 'succeeded' | 'failed';
  error:           string | null;
  _statusRollback: { id: string; status: WeddingEvent['status'] } | null;
  _deletedEvent:   { event: WeddingEvent; index: number } | null;
}

const initialState: EventsState = {
  items:           [],
  total:           0,
  page:            1,
  totalPages:      1,
  confirmedCount:  0,
  planningCount:   0,
  pendingCount:    0,
  status:          'idle',
  error:           null,
  _statusRollback: null,
  _deletedEvent:   null,
};

// ── Thunks ───────────────────────────────────────────────────

export const fetchEvents = createAsyncThunk(
  'events/fetchAll',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue, signal }) => {
    try { return await fetchEventsApi(page, limit, signal); }
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
      .addCase(fetchEvents.pending,   state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchEvents.fulfilled, (state, { payload }) => {
        state.status         = 'succeeded';
        state.items          = payload.events;
        state.total          = payload.total;
        state.page           = payload.page;
        state.totalPages     = payload.totalPages;
        state.confirmedCount = payload.confirmed;
        state.planningCount  = payload.planning;
        state.pendingCount   = payload.pending;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed'; state.error = action.payload as string;
      });

    // create — needs server _id, stays pessimistic
    builder
      .addCase(createEvent.fulfilled, (state, { payload }) => {
        state.items.push(payload);
        state.total += 1;
        if (payload.status === 'confirmed') state.confirmedCount += 1;
        else if (payload.status === 'planning') state.planningCount += 1;
        else state.pendingCount += 1;
      });

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
          const oldStatus = event.status;
          state._statusRollback = { id, status: oldStatus };
          // Update aggregate counts optimistically
          if (oldStatus === 'confirmed') state.confirmedCount = Math.max(0, state.confirmedCount - 1);
          if (oldStatus === 'planning')  state.planningCount  = Math.max(0, state.planningCount  - 1);
          if (oldStatus === 'pending')   state.pendingCount   = Math.max(0, state.pendingCount   - 1);
          if (status === 'confirmed')    state.confirmedCount += 1;
          if (status === 'planning')     state.planningCount  += 1;
          if (status === 'pending')      state.pendingCount   += 1;
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
          const { id, status: oldStatus } = state._statusRollback;
          const event = state.items.find(e => e._id === id);
          if (event) {
            // Reverse the optimistic count changes
            if (event.status === 'confirmed') state.confirmedCount = Math.max(0, state.confirmedCount - 1);
            if (event.status === 'planning')  state.planningCount  = Math.max(0, state.planningCount  - 1);
            if (event.status === 'pending')   state.pendingCount   = Math.max(0, state.pendingCount   - 1);
            if (oldStatus === 'confirmed')    state.confirmedCount += 1;
            if (oldStatus === 'planning')     state.planningCount  += 1;
            if (oldStatus === 'pending')      state.pendingCount   += 1;
            event.status = oldStatus;
          }
          state._statusRollback = null;
        }
      });

    // delete — optimistic: remove immediately, restore at original index on failure
    builder
      .addCase(deleteEvent.pending, (state, { meta }) => {
        const idx = state.items.findIndex(e => e._id === meta.arg);
        if (idx !== -1) {
          const event = current(state.items[idx]);
          state._deletedEvent = { event, index: idx };
          state.items.splice(idx, 1);
          state.total = Math.max(0, state.total - 1);
          if (event.status === 'confirmed') state.confirmedCount = Math.max(0, state.confirmedCount - 1);
          if (event.status === 'planning')  state.planningCount  = Math.max(0, state.planningCount  - 1);
          if (event.status === 'pending')   state.pendingCount   = Math.max(0, state.pendingCount   - 1);
        }
      })
      .addCase(deleteEvent.fulfilled, state => { state._deletedEvent = null; })
      .addCase(deleteEvent.rejected, state => {
        if (state._deletedEvent) {
          const { event, index } = state._deletedEvent;
          state.items.splice(index, 0, event);
          state.total += 1;
          if (event.status === 'confirmed') state.confirmedCount += 1;
          if (event.status === 'planning')  state.planningCount  += 1;
          if (event.status === 'pending')   state.pendingCount   += 1;
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
export const selectEventTotal     = (state: RootState) => state.events.total;
export const selectEventPage      = (state: RootState) => state.events.page;
export const selectEventTotalPages = (state: RootState) => state.events.totalPages;
export const selectEventsStatus   = (state: RootState) => state.events.status;
export const selectEventsError    = (state: RootState) => state.events.error;
export const selectConfirmedCount = (state: RootState) => state.events.confirmedCount;
export const selectPlanningCount  = (state: RootState) => state.events.planningCount;
export const selectPendingCount   = (state: RootState) => state.events.pendingCount;

export default eventsSlice.reducer;
