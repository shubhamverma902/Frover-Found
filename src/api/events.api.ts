import axiosInstance from './axiosInstance';
import type { WeddingEvent } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface EventsData {
  events:    WeddingEvent[];
  total:     number;
  page:      number;
  totalPages: number;
  confirmed: number;
  planning:  number;
  pending:   number;
}

export const fetchEventsApi = async (page = 1, limit = 20, signal?: AbortSignal): Promise<EventsData> => {
  const { data } = await axiosInstance.get<ApiResponse<EventsData>>(API.events.base, {
    params: { page, limit },
    signal,
  });
  return data.data;
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

export const addEventAttachmentApi = async (eventId: string, file: File): Promise<WeddingEvent> => {
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<ApiResponse<{ event: WeddingEvent }>>(
    API.events.attachments(eventId), form
  );
  return data.data.event;
};

export const removeEventAttachmentApi = async (eventId: string, fileId: string): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ event: WeddingEvent }>>(
    API.events.attachment(eventId, fileId)
  );
  return data.data.event;
};
