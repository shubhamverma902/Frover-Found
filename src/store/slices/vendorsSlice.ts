import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Vendor } from '@/constants/dashboard-pages';
import {
  fetchVendorsApi,
  createVendorApi,
  updateVendorApi,
  patchVendorStatusApi,
  deleteVendorApi,
  type VendorPayload,
} from '@/api/vendors.api';

// ── State ─────────────────────────────────────────────────

interface VendorsState {
  items:    Vendor[];
  status:   'idle' | 'loading' | 'succeeded' | 'failed';
  mutating: boolean;
  error:    string | null;
}

const initialState: VendorsState = {
  items:    [],
  status:   'idle',
  mutating: false,
  error:    null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchVendors = createAsyncThunk(
  'vendors/fetchAll',
  async (_, { rejectWithValue }) => {
    try { return await fetchVendorsApi(); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to load vendors'); }
  }
);

export const createVendor = createAsyncThunk(
  'vendors/create',
  async (payload: VendorPayload, { rejectWithValue }) => {
    try { return await createVendorApi(payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to add vendor'); }
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/update',
  async ({ vendorId, payload }: { vendorId: string; payload: VendorPayload }, { rejectWithValue }) => {
    try { return await updateVendorApi(vendorId, payload); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update vendor'); }
  }
);

export const patchVendorStatus = createAsyncThunk(
  'vendors/patchStatus',
  async ({ vendorId, status }: { vendorId: string; status: Vendor['status'] }, { rejectWithValue }) => {
    try { return await patchVendorStatusApi(vendorId, status); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to update status'); }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/delete',
  async (vendorId: string, { rejectWithValue }) => {
    try { await deleteVendorApi(vendorId); return vendorId; }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Failed to remove vendor'); }
  }
);

// ── Helper ────────────────────────────────────────────────

const replaceVendor = (state: VendorsState, updated: Vendor) => {
  const idx = state.items.findIndex(v => v._id === updated._id);
  if (idx !== -1) state.items[idx] = updated;
};

// ── Slice ─────────────────────────────────────────────────

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchVendors.pending,   state => { state.status = 'loading'; state.error = null; })
      .addCase(fetchVendors.fulfilled, (state, { payload }) => { state.status = 'succeeded'; state.items = payload; })
      .addCase(fetchVendors.rejected,  (state, { payload }) => { state.status = 'failed'; state.error = payload as string; });

    builder
      .addCase(createVendor.pending,   state => { state.mutating = true; })
      .addCase(createVendor.fulfilled, (state, { payload }) => { state.mutating = false; state.items.push(payload); })
      .addCase(createVendor.rejected,  state => { state.mutating = false; });

    builder
      .addCase(updateVendor.pending,   state => { state.mutating = true; })
      .addCase(updateVendor.fulfilled, (state, { payload }) => { state.mutating = false; replaceVendor(state, payload); })
      .addCase(updateVendor.rejected,  state => { state.mutating = false; });

    builder
      .addCase(patchVendorStatus.pending,   state => { state.mutating = true; })
      .addCase(patchVendorStatus.fulfilled, (state, { payload }) => { state.mutating = false; replaceVendor(state, payload); })
      .addCase(patchVendorStatus.rejected,  state => { state.mutating = false; });

    builder
      .addCase(deleteVendor.pending,   state => { state.mutating = true; })
      .addCase(deleteVendor.fulfilled, (state, { payload }) => { state.mutating = false; state.items = state.items.filter(v => v._id !== payload); })
      .addCase(deleteVendor.rejected,  state => { state.mutating = false; });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectVendors      = (state: RootState) => state.vendors.items;
export const selectVendorStatus = (state: RootState) => state.vendors.status;
export const selectVendorMutating = (state: RootState) => state.vendors.mutating;
export const selectBookedCount  = (state: RootState) => state.vendors.items.filter(v => v.status === 'booked').length;
export const selectShortlisted  = (state: RootState) => state.vendors.items.filter(v => v.status === 'shortlisted').length;

export default vendorsSlice.reducer;
