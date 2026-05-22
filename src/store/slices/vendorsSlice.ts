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
  items:          Vendor[];
  status:         'idle' | 'loading' | 'succeeded' | 'failed';
  mutating:       boolean;
  error:          string | null;
  _statusRollback: { vendorId: string; status: Vendor['status'] } | null;
  _deletedVendor:  { vendor: Vendor; index: number } | null;
}

const initialState: VendorsState = {
  items:           [],
  status:          'idle',
  mutating:        false,
  error:           null,
  _statusRollback: null,
  _deletedVendor:  null,
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
      // Optimistic status: apply immediately, store old value, restore on failure
      .addCase(patchVendorStatus.pending, (state, { meta }) => {
        const { vendorId, status } = meta.arg;
        const vendor = state.items.find(v => v._id === vendorId);
        if (vendor) {
          state._statusRollback = { vendorId, status: vendor.status };
          vendor.status = status;
        }
      })
      .addCase(patchVendorStatus.fulfilled, (state, { payload }) => {
        state._statusRollback = null;
        replaceVendor(state, payload);
      })
      .addCase(patchVendorStatus.rejected, state => {
        if (state._statusRollback) {
          const { vendorId, status } = state._statusRollback;
          const vendor = state.items.find(v => v._id === vendorId);
          if (vendor) vendor.status = status;
          state._statusRollback = null;
        }
      });

    builder
      // Optimistic delete: remove immediately, restore at original index on failure
      .addCase(deleteVendor.pending, (state, { meta }) => {
        state.mutating = true;
        const idx = state.items.findIndex(v => v._id === meta.arg);
        if (idx !== -1) {
          state._deletedVendor = { vendor: current(state.items[idx]), index: idx };
          state.items.splice(idx, 1);
        }
      })
      .addCase(deleteVendor.fulfilled, state => {
        state.mutating       = false;
        state._deletedVendor = null;
      })
      .addCase(deleteVendor.rejected, state => {
        state.mutating = false;
        if (state._deletedVendor) {
          state.items.splice(state._deletedVendor.index, 0, state._deletedVendor.vendor);
          state._deletedVendor = null;
        }
      });

    builder
      .addCase(addVendorAttachment.fulfilled,    (state, { payload }) => { replaceVendor(state, payload); })
      .addCase(removeVendorAttachment.fulfilled, (state, { payload }) => { replaceVendor(state, payload); });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectVendors      = (state: RootState) => state.vendors.items;
export const selectVendorStatus = (state: RootState) => state.vendors.status;
export const selectVendorMutating = (state: RootState) => state.vendors.mutating;
export const selectBookedCount  = (state: RootState) => state.vendors.items.filter(v => v.status === 'booked').length;
export const selectShortlisted  = (state: RootState) => state.vendors.items.filter(v => v.status === 'shortlisted').length;

export default vendorsSlice.reducer;
