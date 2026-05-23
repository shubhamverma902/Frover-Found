import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type { RootState } from '../store';
import type { WeddingEvent } from '@/constants/dashboard-pages';
import {
  createEventApi,
  updateEventApi,
  patchEventStatusApi,
  deleteEventApi,
  addEventAttachmentApi,
  removeEventAttachmentApi,
} from '@/api/events.api';
import { api } from '../api';

type ApiErr = AxiosError<{ message?: string }>;

// ── State ─────────────────────────────────────────────────

interface EventsState {
  mutating: boolean;
}

const initialState: EventsState = { mutating: false };

// ── Thunks ────────────────────────────────────────────────

export const createEvent = createAsyncThunk(
  'events/create',
  async (payload: Omit<WeddingEvent, '_id'>, { dispatch, rejectWithValue }) => {
    try {
      const event = await createEventApi(payload);
      dispatch(api.util.invalidateTags([{ type: 'Event', id: 'LIST' }]));
      return event;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to create event'); }
  }
);

export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, payload }: { id: string; payload: Omit<WeddingEvent, '_id'> }, { dispatch, rejectWithValue }) => {
    try {
      const event = await updateEventApi(id, payload);
      dispatch(api.util.invalidateTags([{ type: 'Event', id: 'LIST' }]));
      return event;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update event'); }
  }
);

export const patchEventStatus = createAsyncThunk(
  'events/patchStatus',
  async ({ id, status }: { id: string; status: WeddingEvent['status'] }, { dispatch, rejectWithValue }) => {
    try {
      const event = await patchEventStatusApi(id, status);
      dispatch(api.util.invalidateTags([{ type: 'Event', id: 'LIST' }]));
      return event;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update status'); }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      await deleteEventApi(id);
      dispatch(api.util.invalidateTags([{ type: 'Event', id: 'LIST' }]));
      return id;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to delete event'); }
  }
);

export const addEventAttachment = createAsyncThunk(
  'events/addAttachment',
  async ({ eventId, file }: { eventId: string; file: File }, { dispatch, rejectWithValue }) => {
    try {
      const event = await addEventAttachmentApi(eventId, file);
      dispatch(api.util.invalidateTags([{ type: 'Event', id: 'LIST' }]));
      return event;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Upload failed'); }
  }
);

export const removeEventAttachment = createAsyncThunk(
  'events/removeAttachment',
  async ({ eventId, fileId }: { eventId: string; fileId: string }, { dispatch, rejectWithValue }) => {
    try {
      const event = await removeEventAttachmentApi(eventId, fileId);
      dispatch(api.util.invalidateTags([{ type: 'Event', id: 'LIST' }]));
      return event;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Delete failed'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {},
  extraReducers: builder => {
    const setMutating = (v: boolean) => (state: EventsState) => { state.mutating = v; };
    [createEvent, updateEvent, patchEventStatus, deleteEvent, addEventAttachment, removeEventAttachment]
      .forEach(thunk => {
        builder
          .addCase(thunk.pending,   setMutating(true))
          .addCase(thunk.fulfilled, setMutating(false))
          .addCase(thunk.rejected,  setMutating(false));
      });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectEventsMutating = (state: RootState) => state.events.mutating;

export default eventsSlice.reducer;
