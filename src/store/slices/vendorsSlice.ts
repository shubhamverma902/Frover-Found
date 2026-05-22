import { createAsyncThunk, createSlice, current } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { Vendor } from '@/constants/dashboard-pages';
import {
  fetchVendorsApi,
  createVendorApi,
  updateVendorApi,
  patchVendorStatusApi,
  deleteVendorApi,
  addVendorAttachmentApi,
  removeVendorAttachmentApi,
  type VendorPayload,
} from '@/api/vendors.api';

// ── State ─────────────────────────────────────────────────

interface VendorsState {
  items:           Vendor[];
  total:           number;
  page:            number;
  totalPages:      number;
  booked:          number;
  shortlisted:     number;
  status:          'idle' | 'loading' | 'succeeded' | 'failed';
  mutating:        boolean;
  error:           string | null;
  _statusRollback: { vendorId: string; status: Vendor['status'] } | null;
  _deletedVendor:  { vendor: Vendor; index: number } | null;
}

const initialState: VendorsState = {
  items:           [],
  total:           0,
  page:            1,
  totalPages:      1,
  booked:          0,
  shortlisted:     0,
  status:          'idle',
  mutating:        false,
  error:           null,
  _statusRollback: null,
  _deletedVendor:  null,
};

// ── Thunks ────────────────────────────────────────────────

export const fetchVendors = createAsyncThunk(
  'vendors/fetchAll',
  async ({ page, limit }: { page: number; limit: number }, { rejectWithValue, signal }) => {
    try { return await fetchVendorsApi(page, limit, signal); }
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

export const addVendorAttachment = createAsyncThunk(
  'vendors/addAttachment',
  async ({ vendorId, file }: { vendorId: string; file: File }, { rejectWithValue }) => {
    try { return await addVendorAttachmentApi(vendorId, file); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Upload failed'); }
  }
);

export const removeVendorAttachment = createAsyncThunk(
  'vendors/removeAttachment',
  async ({ vendorId, fileId }: { vendorId: string; fileId: string }, { rejectWithValue }) => {
    try { return await removeVendorAttachmentApi(vendorId, fileId); }
    catch (e: any) { return rejectWithValue(e.response?.data?.message ?? 'Delete failed'); }
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
      .addCase(fetchVendors.fulfilled, (state, { payload }) => {
        state.status      = 'succeeded';
        state.items       = payload.vendors;
        state.total       = payload.total;
        state.page        = payload.page;
        state.totalPages  = payload.totalPages;
        state.booked      = payload.booked;
        state.shortlisted = payload.shortlisted;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        if (action.meta.aborted) { state.status = 'idle'; return; }
        state.status = 'failed'; state.error = action.payload as string;
      });

    builder
      .addCase(createVendor.pending,   state => { state.mutating = true; })
      .addCase(createVendor.fulfilled, (state, { payload }) => {
        state.mutating = false;
        state.items.push(payload);
        state.total += 1;
      })
      .addCase(createVendor.rejected,  state => { state.mutating = false; });

    builder
      .addCase(updateVendor.pending,   state => { state.mutating = true; })
      .addCase(updateVendor.fulfilled, (state, { payload }) => { state.mutating = false; replaceVendor(state, payload); })
      .addCase(updateVendor.rejected,  state => { state.mutating = false; });

    builder
      // Optimistic status: apply immediately, store old value, restore on failure
      .addCase(patchVendorStatus.pending, (state, { meta }) => {
        const { vendorId, status } = meta.arg;
        const vendor = state.items.find(v => v._id === vendorId);
        if (vendor) {
          const oldStatus = vendor.status;
          state._statusRollback = { vendorId, status: oldStatus };
          // Update aggregate counts optimistically
          if (oldStatus === 'booked')      state.booked      = Math.max(0, state.booked - 1);
          if (oldStatus === 'shortlisted') state.shortlisted = Math.max(0, state.shortlisted - 1);
          if (status === 'booked')         state.booked      += 1;
          if (status === 'shortlisted')    state.shortlisted += 1;
          vendor.status = status;
        }
      })
      .addCase(patchVendorStatus.fulfilled, (state, { payload }) => {
        state._statusRollback = null;
        replaceVendor(state, payload);
      })
      .addCase(patchVendorStatus.rejected, state => {
        if (state._statusRollback) {
          const { vendorId, status: oldStatus } = state._statusRollback;
          const vendor = state.items.find(v => v._id === vendorId);
          if (vendor) {
            // Reverse the optimistic count changes
            if (vendor.status === 'booked')      state.booked      = Math.max(0, state.booked - 1);
            if (vendor.status === 'shortlisted') state.shortlisted = Math.max(0, state.shortlisted - 1);
            if (oldStatus === 'booked')          state.booked      += 1;
            if (oldStatus === 'shortlisted')     state.shortlisted += 1;
            vendor.status = oldStatus;
          }
          state._statusRollback = null;
        }
      });

    builder
      // Optimistic delete: remove immediately, restore at original index on failure
      .addCase(deleteVendor.pending, (state, { meta }) => {
        state.mutating = true;
        const idx = state.items.findIndex(v => v._id === meta.arg);
        if (idx !== -1) {
          const vendor = current(state.items[idx]);
          state._deletedVendor = { vendor, index: idx };
          state.items.splice(idx, 1);
          state.total = Math.max(0, state.total - 1);
          if (vendor.status === 'booked')      state.booked      = Math.max(0, state.booked - 1);
          if (vendor.status === 'shortlisted') state.shortlisted = Math.max(0, state.shortlisted - 1);
        }
      })
      .addCase(deleteVendor.fulfilled, state => {
        state.mutating       = false;
        state._deletedVendor = null;
      })
      .addCase(deleteVendor.rejected, state => {
        state.mutating = false;
        if (state._deletedVendor) {
          const { vendor, index } = state._deletedVendor;
          state.items.splice(index, 0, vendor);
          state.total += 1;
          if (vendor.status === 'booked')      state.booked      += 1;
          if (vendor.status === 'shortlisted') state.shortlisted += 1;
          state._deletedVendor = null;
        }
      });

    builder
      .addCase(addVendorAttachment.fulfilled,    (state, { payload }) => { replaceVendor(state, payload); })
      .addCase(removeVendorAttachment.fulfilled, (state, { payload }) => { replaceVendor(state, payload); });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectVendors          = (state: RootState) => state.vendors.items;
export const selectVendorTotal      = (state: RootState) => state.vendors.total;
export const selectVendorPage       = (state: RootState) => state.vendors.page;
export const selectVendorTotalPages = (state: RootState) => state.vendors.totalPages;
export const selectVendorStatus     = (state: RootState) => state.vendors.status;
export const selectVendorMutating   = (state: RootState) => state.vendors.mutating;
export const selectBookedCount      = (state: RootState) => state.vendors.booked;
export const selectShortlisted      = (state: RootState) => state.vendors.shortlisted;

export default vendorsSlice.reducer;
