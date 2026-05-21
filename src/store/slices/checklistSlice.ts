import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { ChecklistCategory } from '@/constants/dashboard-pages';
import {
  fetchChecklistApi,
  createTaskApi,
  toggleTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from '@/api/checklist.api';

// ── State ─────────────────────────────────────────────────

interface ChecklistState {
  categories: ChecklistCategory[];
  status:   'idle' | 'loading' | 'succeeded' | 'failed';
  mutating: boolean;
  error:    string | null;
}

const initialState: ChecklistState = {
  categories: [],
  status:   'idle',
  mutating: false,
  error:    null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchChecklist = createAsyncThunk(
  'checklist/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await fetchChecklistApi(); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load checklist'); }
  }
);

export const createTask = createAsyncThunk(
  'checklist/createTask',
  async (payload: { category: string; label: string; due: string }, { rejectWithValue }) => {
    try { return await createTaskApi(payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to create task'); }
  }
);

export const toggleTask = createAsyncThunk(
  'checklist/toggleTask',
  async (taskId: string, { rejectWithValue }) => {
    try { return await toggleTaskApi(taskId); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to toggle task'); }
  }
);

export const updateTask = createAsyncThunk(
  'checklist/updateTask',
  async (
    payload: { taskId: string; label: string; due: string; category: string; originalCategory: string },
    { rejectWithValue }
  ) => {
    try {
      const { taskId, ...rest } = payload;
      return await updateTaskApi(taskId, rest);
    }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update task'); }
  }
);

export const deleteTask = createAsyncThunk(
  'checklist/deleteTask',
  async (taskId: string, { rejectWithValue }) => {
    try { return await deleteTaskApi(taskId); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to delete task'); }
  }
);

// ── Helpers ───────────────────────────────────────────────

const replaceCategories = (state: ChecklistState, updated: ChecklistCategory[]) => {
  for (const u of updated) {
    const idx = state.categories.findIndex(c => c._id === u._id);
    if (idx !== -1) state.categories[idx] = u;
  }
};

// ── Slice ─────────────────────────────────────────────────

const checklistSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchChecklist.pending,   state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchChecklist.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.categories = payload; })
      .addCase(fetchChecklist.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload as string; });

    builder
      .addCase(createTask.pending,   state => { state.mutating = true; })
      .addCase(createTask.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategories(state, [payload]); })
      .addCase(createTask.rejected,  state => { state.mutating = false; });

    builder
      .addCase(toggleTask.fulfilled, (state, { payload }) => { replaceCategories(state, [payload]); });

    builder
      .addCase(updateTask.pending,   state => { state.mutating = true; })
      .addCase(updateTask.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategories(state, payload); })
      .addCase(updateTask.rejected,  state => { state.mutating = false; });

    builder
      .addCase(deleteTask.pending,   state => { state.mutating = true; })
      .addCase(deleteTask.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategories(state, [payload.category]); })
      .addCase(deleteTask.rejected,  state => { state.mutating = false; });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectCategories      = (state: RootState) => state.checklist.categories;
export const selectChecklistStatus = (state: RootState) => state.checklist.status;
export const selectMutating        = (state: RootState) => state.checklist.mutating;
export const selectAllTasks        = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks);
export const selectDoneCount       = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks).filter(t => t.done).length;
export const selectTotalCount      = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks).length;

export default checklistSlice.reducer;
