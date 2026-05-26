import axiosInstance from './axiosInstance';
import type { WeddingEvent } from '@/types/event';
import { API } from '@/constants/api';
import { parseResponse } from './parse';
import { EventsDataSchema, WeddingEventSchema } from './schemas';
import { validateAttachment } from '@/utils/validate';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface EventsData {
  events:     WeddingEvent[];
  total:      number;      // filtered count (for pagination)
  page:       number;
  totalPages: number;
  grandTotal: number;      // unfiltered total (for header/summary/filter pills)
  confirmed:  number;      // unfiltered status counts
  planning:   number;
  pending:    number;
}

export const fetchEventsApi = async (page = 1, limit = 20, signal?: AbortSignal): Promise<EventsData> => {
  const { data } = await axiosInstance.get<ApiResponse<EventsData>>(API.events.base, {
    params: { page, limit },
    signal,
  });
  return parseResponse(EventsDataSchema, data.data, 'fetchEventsApi');
};

export const createEventApi = async (payload: Omit<WeddingEvent, '_id'>): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.post<ApiResponse<{ event: WeddingEvent }>>(API.events.base, payload);
  return parseResponse(WeddingEventSchema, data.data.event, 'createEventApi');
};

export const updateEventApi = async (id: string, payload: Omit<WeddingEvent, '_id'>): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.put<ApiResponse<{ event: WeddingEvent }>>(API.events.byId(id), payload);
  return parseResponse(WeddingEventSchema, data.data.event, 'updateEventApi');
};

export const patchEventStatusApi = async (id: string, status: WeddingEvent['status']): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ event: WeddingEvent }>>(API.events.status(id), { status });
  return parseResponse(WeddingEventSchema, data.data.event, 'patchEventStatusApi');
};

export const deleteEventApi = async (id: string): Promise<void> => {
  await axiosInstance.delete(API.events.byId(id));
};

export const addEventAttachmentApi = async (eventId: string, file: File): Promise<WeddingEvent> => {
  validateAttachment(file);
  const form = new FormData();
  form.append('file', file);
  const { data } = await axiosInstance.post<ApiResponse<{ event: WeddingEvent }>>(
    API.events.attachments(eventId), form
  );
  return parseResponse(WeddingEventSchema, data.data.event, 'addEventAttachmentApi');
};

export const removeEventAttachmentApi = async (eventId: string, fileId: string): Promise<WeddingEvent> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ event: WeddingEvent }>>(
    API.events.attachment(eventId, fileId)
  );
  return parseResponse(WeddingEventSchema, data.data.event, 'removeEventAttachmentApi');
};
