import axiosInstance from './axiosInstance';
import type { SeatingTable } from '@/types/seating';
import { API } from '@/constants/api';
import { parseResponse, type ApiResponse } from './parse';
import { SeatingTableSchema, SeatingTablesResponseSchema } from './schemas';


export const fetchTablesApi = async (signal?: AbortSignal): Promise<SeatingTable[]> => {
  const { data } = await axiosInstance.get<ApiResponse<{ tables: SeatingTable[] }>>(API.seating.base, { signal });
  return parseResponse(SeatingTablesResponseSchema, data.data, 'fetchTablesApi').tables;
};

export const createTableApi = async (payload: { name: string; capacity: number; shape: SeatingTable['shape'] }): Promise<SeatingTable> => {
  const { data } = await axiosInstance.post<ApiResponse<{ table: SeatingTable }>>(API.seating.base, payload);
  return parseResponse(SeatingTableSchema, data.data.table, 'createTableApi');
};

export const updateTableApi = async (id: string, payload: { name: string; capacity: number; shape: SeatingTable['shape'] }): Promise<SeatingTable> => {
  const { data } = await axiosInstance.put<ApiResponse<{ table: SeatingTable }>>(API.seating.byId(id), payload);
  return parseResponse(SeatingTableSchema, data.data.table, 'updateTableApi');
};

export const deleteTableApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(API.seating.byId(id));
};

export const assignGuestApi = async (guestId: string, tableId: string | null): Promise<SeatingTable[]> => {
  const { data } = await axiosInstance.post<ApiResponse<{ tables: SeatingTable[] }>>(API.seating.assign, { guestId, tableId });
  return parseResponse(SeatingTablesResponseSchema, data.data, 'assignGuestApi').tables;
};
