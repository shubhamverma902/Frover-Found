import { createSlice } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type { RootState } from '../store';
import type { ChecklistCategory } from '@/constants/dashboard-pages';
import { createTaskApi, toggleTaskApi, updateTaskApi, deleteTaskApi } from '@/api/checklist.api';
import { api } from '../api';
import { createAppAsyncThunk } from '../thunk';

type ApiErr = AxiosError<{ message?: string }>;

// ── State ─────────────────────────────────────────────────

interface ChecklistState {
  categories:  ChecklistCategory[];
  mutating:    boolean;
  togglingIds: string[];
}

const initialState: ChecklistState = { categories: [], mutating: false, togglingIds: [] };

// ── Thunks ────────────────────────────────────────────────

export const createTask = createAppAsyncThunk(
  'checklist/createTask',
  async (payload: { category: string; label: string; due: string }, { dispatch, rejectWithValue }) => {
    try {
      const result = await createTaskApi(payload);
      dispatch(api.util.invalidateTags(['Checklist']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to create task'); }
  }
);

export const toggleTask = createAppAsyncThunk(
  'checklist/toggleTask',
  async (taskId: string, { dispatch, rejectWithValue }) => {
    const patch = dispatch(api.util.updateQueryData('getChecklist', undefined, draft => {
      for (const cat of draft) {
        const task = cat.tasks.find(t => t._id === taskId);
        if (task) { task.done = !task.done; break; }
      }
    }));
    try {
      const result = await toggleTaskApi(taskId);
      dispatch(api.util.invalidateTags(['Checklist']));
      return result;
    } catch (e) {
      patch.undo();
      return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to toggle task');
    }
  },
  {
    // Drop the dispatch entirely if this task already has a request in-flight.
    // `condition` runs before `pending` is dispatched, so `togglingIds` still
    // reflects the previous click's state — no double-entry window.
    condition: (taskId, { getState }) =>
      !(getState() as RootState).checklist.togglingIds.includes(taskId),
    // Don't pollute the rejected log with condition-failed noise.
    dispatchConditionRejection: false,
  }
);

export const updateTask = createAppAsyncThunk(
  'checklist/updateTask',
  async (
    payload: { taskId: string; label: string; due: string; category: string; originalCategory: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const { taskId, ...rest } = payload;
      const result = await updateTaskApi(taskId, rest);
      dispatch(api.util.invalidateTags(['Checklist']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update task'); }
  }
);

export const deleteTask = createAppAsyncThunk(
  'checklist/deleteTask',
  async (taskId: string, { dispatch, rejectWithValue }) => {
    try {
      const result = await deleteTaskApi(taskId);
      dispatch(api.util.invalidateTags(['Checklist']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to delete task'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const checklistSlice = createSlice({
  name: 'checklist',
  initialState,
  reducers: {
    resetMutating: (state) => { state.mutating = false; },
  },
  extraReducers: builder => {
    const setMutating = (v: boolean) => (state: ChecklistState) => { state.mutating = v; };
    [createTask, updateTask, deleteTask].forEach(thunk => {
      builder
        .addCase(thunk.pending,   setMutating(true))
        .addCase(thunk.fulfilled, setMutating(false))
        .addCase(thunk.rejected,  setMutating(false));
    });

    builder
      .addCase(toggleTask.pending,   (state, { meta }) => { state.togglingIds.push(meta.arg); })
      .addCase(toggleTask.fulfilled,  (state, { meta }) => { state.togglingIds = state.togglingIds.filter(id => id !== meta.arg); })
      .addCase(toggleTask.rejected,   (state, { meta }) => { state.togglingIds = state.togglingIds.filter(id => id !== meta.arg); });

    builder.addMatcher(
      api.endpoints.getChecklist.matchFulfilled,
      (state, { payload }) => { state.categories = payload; }
    );
  },
});

// ── Selectors ─────────────────────────────────────────────

export const { resetMutating: resetChecklistMutating } = checklistSlice.actions;

export const selectCategories  = (state: RootState) => state.checklist.categories;
export const selectMutating    = (state: RootState) => state.checklist.mutating;
export const selectTogglingIds = (state: RootState) => state.checklist.togglingIds;
export const selectAllTasks   = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks);
export const selectDoneCount  = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks).filter(t => t.done).length;
export const selectTotalCount = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks).length;

export default checklistSlice.reducer;
