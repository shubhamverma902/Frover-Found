import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
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
  status:     'idle' | 'loading' | 'succeeded' | 'failed';
  mutating:   boolean;
  error:      string | null;
  _snapshot:  ChecklistCategory[] | null; // rollback store for optimistic deletes
}

const initialState: ChecklistState = {
  categories: [],
  status:     'idle',
  mutating:   false,
  error:      null,
  _snapshot:  null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchChecklist = createAsyncThunk(
  'checklist/fetchAll',
  async (_, { rejectWithValue, signal }) => {
    try { return await fetchChecklistApi(signal); }
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
      .addCase(fetchChecklist.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed'; state.error = action.payload as string;
      });

    builder
      .addCase(createTask.pending,   state => { state.mutating = true; })
      .addCase(createTask.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategories(state, [payload]); })
      .addCase(createTask.rejected,  state => { state.mutating = false; });

    builder
      // Optimistic toggle: flip immediately, reverse on failure, sync on success
      .addCase(toggleTask.pending, (state, { meta }) => {
        for (const cat of state.categories) {
          const task = cat.tasks.find(t => t._id === meta.arg);
          if (task) { task.done = !task.done; break; }
        }
      })
      .addCase(toggleTask.fulfilled, (state, { payload }) => { replaceCategories(state, [payload]); })
      .addCase(toggleTask.rejected, (state, { meta }) => {
        for (const cat of state.categories) {
          const task = cat.tasks.find(t => t._id === meta.arg);
          if (task) { task.done = !task.done; break; }
        }
      });

    builder
      .addCase(updateTask.pending,   state => { state.mutating = true; })
      .addCase(updateTask.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategories(state, payload); })
      .addCase(updateTask.rejected,  state => { state.mutating = false; });

    builder
      // Optimistic delete: remove immediately, restore from snapshot on failure
      .addCase(deleteTask.pending, (state, { meta }) => {
        state.mutating  = true;
        state._snapshot = current(state.categories);
        for (const cat of state.categories) {
          const idx = cat.tasks.findIndex(t => t._id === meta.arg);
          if (idx !== -1) { cat.tasks.splice(idx, 1); break; }
        }
      })
      .addCase(deleteTask.fulfilled, (state, { payload }) => {
        state.mutating  = false;
        state._snapshot = null;
        replaceCategories(state, [payload.category]);
      })
      .addCase(deleteTask.rejected, state => {
        state.mutating = false;
        if (state._snapshot) { state.categories = state._snapshot; state._snapshot = null; }
      });
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
