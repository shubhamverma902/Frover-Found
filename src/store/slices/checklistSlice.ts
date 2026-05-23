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
  categories: ChecklistCategory[];
  mutating:   boolean;
}

const initialState: ChecklistState = { categories: [], mutating: false };

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
  reducers: {},
  extraReducers: builder => {
    const setMutating = (v: boolean) => (state: ChecklistState) => { state.mutating = v; };
    [createTask, updateTask, deleteTask].forEach(thunk => {
      builder
        .addCase(thunk.pending,   setMutating(true))
        .addCase(thunk.fulfilled, setMutating(false))
        .addCase(thunk.rejected,  setMutating(false));
    });

    builder.addMatcher(
      api.endpoints.getChecklist.matchFulfilled,
      (state, { payload }) => { state.categories = payload; }
    );
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectCategories = (state: RootState) => state.checklist.categories;
export const selectMutating   = (state: RootState) => state.checklist.mutating;
export const selectAllTasks   = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks);
export const selectDoneCount  = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks).filter(t => t.done).length;
export const selectTotalCount = (state: RootState) => state.checklist.categories.flatMap(c => c.tasks).length;

export default checklistSlice.reducer;
