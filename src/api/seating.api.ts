import axiosInstance from './axiosInstance';
import type { SeatingTable } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export const fetchTablesApi = async (signal?: AbortSignal): Promise<SeatingTable[]> => {
  const { data } = await axiosInstance.get<ApiResponse<{ tables: SeatingTable[] }>>(API.seating.base, { signal });
  return data.data.tables;
};

export const createTableApi = async (payload: { name: string; capacity: number; shape: SeatingTable['shape'] }): Promise<SeatingTable> => {
  const { data } = await axiosInstance.post<ApiResponse<{ table: SeatingTable }>>(API.seating.base, payload);
  return data.data.table;
};

export const updateTableApi = async (id: string, payload: { name: string; capacity: number; shape: SeatingTable['shape'] }): Promise<SeatingTable> => {
  const { data } = await axiosInstance.put<ApiResponse<{ table: SeatingTable }>>(API.seating.byId(id), payload);
  return data.data.table;
};

export const deleteTableApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(API.seating.byId(id));
};

export const assignGuestApi = async (guestId: string, tableId: string | null): Promise<SeatingTable[]> => {
  const { data } = await axiosInstance.post<ApiResponse<{ tables: SeatingTable[] }>>(API.seating.assign, { guestId, tableId });
  return data.data.tables;
};
