import axiosInstance from './axiosInstance';
import type { Vendor } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';
import { parseResponse } from './parse';
import { VendorsDataSchema, VendorSchema } from './schemas';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface VendorsData {
  vendors:     Vendor[];
  total:       number;      // filtered count (for pagination)
  page:        number;
  totalPages:  number;
  grandTotal:  number;      // unfiltered total (for summary strip)
  booked:      number;
  shortlisted: number;
}

export interface VendorPayload {
  icon:     string;
  category: string;
  name:     string;
  contact:  string;
  location: string;
  status:   Vendor['status'];
  rating:   number;
  notes:    string;
}

export const fetchVendorsApi = async (page = 1, limit = 10, signal?: AbortSignal): Promise<VendorsData> => {
  const { data } = await axiosInstance.get<ApiResponse<VendorsData>>(API.vendors.base, {
    params: { page, limit },
    signal,
  });
  return parseResponse(VendorsDataSchema, data.data, 'fetchVendorsApi');
};

export const createVendorApi = async (payload: VendorPayload): Promise<Vendor> => {
  const { data } = await axiosInstance.post<ApiResponse<{ vendor: Vendor }>>(API.vendors.base, payload);
  return parseResponse(VendorSchema, data.data.vendor, 'createVendorApi');
};

export const updateVendorApi = async (vendorId: string, payload: VendorPayload): Promise<Vendor> => {
  const { data } = await axiosInstance.put<ApiResponse<{ vendor: Vendor }>>(API.vendors.byId(vendorId), payload);
  return parseResponse(VendorSchema, data.data.vendor, 'updateVendorApi');
};

export const patchVendorStatusApi = async (vendorId: string, status: Vendor['status']): Promise<Vendor> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ vendor: Vendor }>>(
    API.vendors.status(vendorId), { status }
  );
  return parseResponse(VendorSchema, data.data.vendor, 'patchVendorStatusApi');
};

export const deleteVendorApi = async (vendorId: string): Promise<void> => {
  await axiosInstance.delete(API.vendors.byId(vendorId));
};

export const addVendorAttachmentApi = async (vendorId: string, file: File): Promise<Vendor> => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<ApiResponse<{ vendor: Vendor }>>(
    API.vendors.attachments(vendorId), form
  );
  return parseResponse(VendorSchema, data.data.vendor, 'addVendorAttachmentApi');
};

export const removeVendorAttachmentApi = async (vendorId: string, fileId: string): Promise<Vendor> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ vendor: Vendor }>>(
    API.vendors.attachment(vendorId, fileId)
  );
  return parseResponse(VendorSchema, data.data.vendor, 'removeVendorAttachmentApi');
};
