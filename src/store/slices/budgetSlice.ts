import { createSlice } from '@reduxjs/toolkit';
import { createAppAsyncThunk } from '../thunk';
import type { AxiosError } from 'axios';
import type { RootState } from '../store';
import type { BudgetCategory } from '@/constants/dashboard-pages';
import {
  updateTotalApi,
  updateAllocatedApi,
  addExpenseApi,
  deleteExpenseApi,
} from '@/api/budget.api';
import { api } from '../api';

type ApiErr = AxiosError<{ message?: string }>;

// ── State ─────────────────────────────────────────────────

interface BudgetState {
  total:      number;
  categories: BudgetCategory[];
  mutating:   boolean;
}

const initialState: BudgetState = { total: 0, categories: [], mutating: false };

// ── Thunks ────────────────────────────────────────────────

export const updateTotal = createAppAsyncThunk(
  'budget/updateTotal',
  async (total: number, { dispatch, rejectWithValue }) => {
    const patch = dispatch(api.util.updateQueryData('getBudget', undefined, draft => {
      draft.total = total;
    }));
    let ok = false;
    try {
      const result = await updateTotalApi(total);
      ok = true;
      dispatch(api.util.invalidateTags(['Budget']));
      return result;
    } catch (e) {
      return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update total');
    } finally {
      if (!ok) patch.undo();
    }
  }
);

export const updateAllocated = createAppAsyncThunk(
  'budget/updateAllocated',
  async ({ categoryId, allocated }: { categoryId: string; allocated: number }, { dispatch, rejectWithValue }) => {
    const patch = dispatch(api.util.updateQueryData('getBudget', undefined, draft => {
      const cat = draft.categories.find(c => c._id === categoryId);
      if (cat) cat.allocated = allocated;
    }));
    let ok = false;
    try {
      const result = await updateAllocatedApi(categoryId, allocated);
      ok = true;
      dispatch(api.util.invalidateTags(['Budget']));
      return result;
    } catch (e) {
      return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update allocation');
    } finally {
      if (!ok) patch.undo();
    }
  }
);

export const addExpense = createAppAsyncThunk(
  'budget/addExpense',
  async ({ categoryId, amount, note }: { categoryId: string; amount: number; note: string }, { dispatch, rejectWithValue }) => {
    try {
      const result = await addExpenseApi(categoryId, { amount, note });
      dispatch(api.util.invalidateTags(['Budget']));
      return result;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to add expense'); }
  }
);

export const deleteExpense = createAppAsyncThunk(
  'budget/deleteExpense',
  async ({ categoryId, expenseId }: { categoryId: string; expenseId: string }, { dispatch, rejectWithValue }) => {
    const patch = dispatch(api.util.updateQueryData('getBudget', undefined, draft => {
      const cat = draft.categories.find(c => c._id === categoryId);
      if (cat) {
        const idx = cat.expenses.findIndex(e => e._id === expenseId);
        if (idx !== -1) cat.expenses.splice(idx, 1);
        // cat.spent is intentionally left unchanged — the server owns that
        // aggregate. invalidateTags below will refetch the authoritative value.
      }
    }));
    let ok = false;
    try {
      const result = await deleteExpenseApi(categoryId, expenseId);
      ok = true;
      dispatch(api.util.invalidateTags(['Budget']));
      return result;
    } catch (e) {
      return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to delete expense');
    } finally {
      if (!ok) patch.undo();
    }
  }
);

// ── Slice ─────────────────────────────────────────────────

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    resetMutating: (state) => { state.mutating = false; },
  },
  extraReducers: builder => {
    const setMutating = (v: boolean) => (state: BudgetState) => { state.mutating = v; };
    [updateTotal, updateAllocated, addExpense, deleteExpense].forEach(thunk => {
      builder
        .addCase(thunk.pending,   setMutating(true))
        .addCase(thunk.fulfilled, setMutating(false))
        .addCase(thunk.rejected,  setMutating(false));
    });

    builder.addMatcher(
      api.endpoints.getBudget.matchFulfilled,
      (state, { payload }) => {
        state.total      = payload.total;
        state.categories = payload.categories;
      }
    );
  },
});

// ── Selectors ─────────────────────────────────────────────

export const { resetMutating: resetBudgetMutating } = budgetSlice.actions;

export const selectBudgetTotal      = (state: RootState) => state.budget.total;
export const selectBudgetCategories = (state: RootState) => state.budget.categories;
export const selectBudgetMutating   = (state: RootState) => state.budget.mutating;
export const selectBudgetSpent      = (state: RootState) => state.budget.categories.reduce((s, c) => s + c.spent, 0);
export const selectBudgetRemaining  = (state: RootState) => state.budget.total - state.budget.categories.reduce((s, c) => s + c.spent, 0);

export default budgetSlice.reducer;
