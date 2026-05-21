import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { BudgetCategory } from '@/constants/dashboard-pages';
import {
  fetchBudgetApi,
  updateTotalApi,
  updateAllocatedApi,
  addExpenseApi,
  deleteExpenseApi,
} from '@/api/budget.api';

// ── State ─────────────────────────────────────────────────

interface BudgetState {
  total:      number;
  categories: BudgetCategory[];
  status:   'idle' | 'loading' | 'succeeded' | 'failed';
  mutating: boolean;
  error:    string | null;
}

const initialState: BudgetState = {
  total:      0,
  categories: [],
  status:   'idle',
  mutating: false,
  error:    null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchBudget = createAsyncThunk(
  'budget/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await fetchBudgetApi(); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load budget'); }
  }
);

export const updateTotal = createAsyncThunk(
  'budget/updateTotal',
  async (total: number, { rejectWithValue }) => {
    try { return await updateTotalApi(total); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update total'); }
  }
);

export const updateAllocated = createAsyncThunk(
  'budget/updateAllocated',
  async ({ categoryId, allocated }: { categoryId: string; allocated: number }, { rejectWithValue }) => {
    try { return await updateAllocatedApi(categoryId, allocated); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update allocation'); }
  }
);

export const addExpense = createAsyncThunk(
  'budget/addExpense',
  async ({ categoryId, amount, note }: { categoryId: string; amount: number; note: string }, { rejectWithValue }) => {
    try { return await addExpenseApi(categoryId, { amount, note }); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to add expense'); }
  }
);

export const deleteExpense = createAsyncThunk(
  'budget/deleteExpense',
  async ({ categoryId, expenseId }: { categoryId: string; expenseId: string }, { rejectWithValue }) => {
    try { return await deleteExpenseApi(categoryId, expenseId); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to delete expense'); }
  }
);

// ── Helper ────────────────────────────────────────────────

const replaceCategory = (state: BudgetState, updated: BudgetCategory) => {
  const idx = state.categories.findIndex(c => c._id === updated._id);
  if (idx !== -1) state.categories[idx] = updated;
};

// ── Slice ─────────────────────────────────────────────────

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchBudget.pending,   state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchBudget.fulfilled, (state, { payload }) => {
        state.status     = 'succeeded';
        state.total      = payload.total;
        state.categories = payload.categories;
      })
      .addCase(fetchBudget.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload as string; });

    builder
      .addCase(updateTotal.pending,   state => { state.mutating = true; })
      .addCase(updateTotal.fulfilled, (state, { payload }) => { state.mutating = false; state.total = payload; })
      .addCase(updateTotal.rejected,  state => { state.mutating = false; });

    builder
      .addCase(updateAllocated.pending,   state => { state.mutating = true; })
      .addCase(updateAllocated.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategory(state, payload); })
      .addCase(updateAllocated.rejected,  state => { state.mutating = false; });

    builder
      .addCase(addExpense.pending,   state => { state.mutating = true; })
      .addCase(addExpense.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategory(state, payload); })
      .addCase(addExpense.rejected,  state => { state.mutating = false; });

    builder
      .addCase(deleteExpense.pending,   state => { state.mutating = true; })
      .addCase(deleteExpense.fulfilled, (state, { payload }) => { state.mutating = false; replaceCategory(state, payload); })
      .addCase(deleteExpense.rejected,  state => { state.mutating = false; });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectBudgetTotal      = (state: RootState) => state.budget.total;
export const selectBudgetCategories = (state: RootState) => state.budget.categories;
export const selectBudgetStatus     = (state: RootState) => state.budget.status;
export const selectBudgetMutating   = (state: RootState) => state.budget.mutating;
export const selectBudgetSpent      = (state: RootState) => state.budget.categories.reduce((s, c) => s + c.spent, 0);
export const selectBudgetRemaining  = (state: RootState) => state.budget.total - state.budget.categories.reduce((s, c) => s + c.spent, 0);

export default budgetSlice.reducer;
