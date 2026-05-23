import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { AxiosError } from 'axios';
import type { RootState } from '../store';
import type { Vendor } from '@/constants/dashboard-pages';
import {
  createVendorApi,
  updateVendorApi,
  patchVendorStatusApi,
  deleteVendorApi,
  addVendorAttachmentApi,
  removeVendorAttachmentApi,
  type VendorPayload,
} from '@/api/vendors.api';
import { api } from '../api';

type ApiErr = AxiosError<{ message?: string }>;

// ── State ─────────────────────────────────────────────────

interface VendorsState {
  mutating: boolean;
}

const initialState: VendorsState = { mutating: false };

// ── Thunks ────────────────────────────────────────────────

export const createVendor = createAsyncThunk(
  'vendors/create',
  async (payload: VendorPayload, { dispatch, rejectWithValue }) => {
    try {
      const vendor = await createVendorApi(payload);
      dispatch(api.util.invalidateTags([{ type: 'Vendor', id: 'LIST' }]));
      return vendor;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to add vendor'); }
  }
);

export const updateVendor = createAsyncThunk(
  'vendors/update',
  async ({ vendorId, payload }: { vendorId: string; payload: VendorPayload }, { dispatch, rejectWithValue }) => {
    try {
      const vendor = await updateVendorApi(vendorId, payload);
      dispatch(api.util.invalidateTags([{ type: 'Vendor', id: 'LIST' }]));
      return vendor;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update vendor'); }
  }
);

export const patchVendorStatus = createAsyncThunk(
  'vendors/patchStatus',
  async ({ vendorId, status }: { vendorId: string; status: Vendor['status'] }, { dispatch, rejectWithValue }) => {
    try {
      const vendor = await patchVendorStatusApi(vendorId, status);
      dispatch(api.util.invalidateTags([{ type: 'Vendor', id: 'LIST' }]));
      return vendor;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to update status'); }
  }
);

export const deleteVendor = createAsyncThunk(
  'vendors/delete',
  async (vendorId: string, { dispatch, rejectWithValue }) => {
    try {
      await deleteVendorApi(vendorId);
      dispatch(api.util.invalidateTags([{ type: 'Vendor', id: 'LIST' }]));
      return vendorId;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Failed to remove vendor'); }
  }
);

export const addVendorAttachment = createAsyncThunk(
  'vendors/addAttachment',
  async ({ vendorId, file }: { vendorId: string; file: File }, { dispatch, rejectWithValue }) => {
    try {
      const vendor = await addVendorAttachmentApi(vendorId, file);
      dispatch(api.util.invalidateTags([{ type: 'Vendor', id: 'LIST' }]));
      return vendor;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Upload failed'); }
  }
);

export const removeVendorAttachment = createAsyncThunk(
  'vendors/removeAttachment',
  async ({ vendorId, fileId }: { vendorId: string; fileId: string }, { dispatch, rejectWithValue }) => {
    try {
      const vendor = await removeVendorAttachmentApi(vendorId, fileId);
      dispatch(api.util.invalidateTags([{ type: 'Vendor', id: 'LIST' }]));
      return vendor;
    } catch (e) { return rejectWithValue((e as ApiErr).response?.data?.message ?? 'Delete failed'); }
  }
);

// ── Slice ─────────────────────────────────────────────────

const vendorsSlice = createSlice({
  name: 'vendors',
  initialState,
  reducers: {},
  extraReducers: builder => {
    const setMutating = (v: boolean) => (state: VendorsState) => { state.mutating = v; };
    [createVendor, updateVendor, patchVendorStatus, deleteVendor, addVendorAttachment, removeVendorAttachment]
      .forEach(thunk => {
        builder
          .addCase(thunk.pending,   setMutating(true))
          .addCase(thunk.fulfilled, setMutating(false))
          .addCase(thunk.rejected,  setMutating(false));
      });
  },
});

// ── Selectors ─────────────────────────────────────────────

export const selectVendorMutating = (state: RootState) => state.vendors.mutating;

export default vendorsSlice.reducer;
