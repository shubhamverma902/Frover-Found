import axiosInstance from './axiosInstance';
import type { Vendor } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

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

export const fetchVendorsApi = async (signal?: AbortSignal): Promise<Vendor[]> => {
  const { data } = await axiosInstance.get<ApiResponse<{ vendors: Vendor[] }>>(API.vendors.base, { signal });
  return data.data.vendors;
};

export const createVendorApi = async (payload: VendorPayload): Promise<Vendor> => {
  const { data } = await axiosInstance.post<ApiResponse<{ vendor: Vendor }>>(API.vendors.base, payload);
  return data.data.vendor;
};

export const updateVendorApi = async (vendorId: string, payload: VendorPayload): Promise<Vendor> => {
  const { data } = await axiosInstance.put<ApiResponse<{ vendor: Vendor }>>(API.vendors.byId(vendorId), payload);
  return data.data.vendor;
};

export const patchVendorStatusApi = async (vendorId: string, status: Vendor['status']): Promise<Vendor> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ vendor: Vendor }>>(
    API.vendors.status(vendorId), { status }
  );
  return data.data.vendor;
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
  return data.data.vendor;
};

export const removeVendorAttachmentApi = async (vendorId: string, fileId: string): Promise<Vendor> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ vendor: Vendor }>>(
    API.vendors.attachment(vendorId, fileId)
  );
  return data.data.vendor;
};
