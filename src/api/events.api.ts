import axiosInstance from './axiosInstance';
import type { WeddingEvent } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export const fetchEventsApi = async (): Promise<WeddingEvent[]> => {
  const { data } = await axiosInstance.get<ApiResponse<{ events: WeddingEvent[] }>>(API.events.base);
  return data.data.events;
};

export const createEventApi = async (payload: Omit<WeddingEvent, '_id'>): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.post<ApiResponse<{ event: WeddingEvent }>>(API.events.base, payload);
  return data.data.event;
};

export const updateEventApi = async (id: string, payload: Omit<WeddingEvent, '_id'>): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.put<ApiResponse<{ event: WeddingEvent }>>(API.events.byId(id), payload);
  return data.data.event;
};

export const patchEventStatusApi = async (id: string, status: WeddingEvent['status']): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ event: WeddingEvent }>>(API.events.status(id), { status });
  return data.data.event;
};

export const deleteEventApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(API.events.byId(id));
};
