import axiosInstance from './axiosInstance';
import type { Guest } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface GuestsData {
  guests:     Guest[];
  total:      number;
  page:       number;
  totalPages: number;
}

export interface CreateGuestPayload {
  name:     string;
  relation: string;
  phone:    string;
  rsvp:     Guest['rsvp'];
  meal:     Guest['meal'];
  plusOne:  boolean;
}

export const fetchGuestsApi = async (page = 1, limit = 10, signal?: AbortSignal): Promise<GuestsData> => {
  const { data } = await axiosInstance.get<ApiResponse<GuestsData>>(API.guests.base, {
    params: { page, limit },
    signal,
  });
  return data.data;
};

export const createGuestApi = async (payload: CreateGuestPayload): Promise<Guest> => {
  const { data } = await axiosInstance.post<ApiResponse<{ guest: Guest }>>(API.guests.base, payload);
  return data.data.guest;
};

export const patchGuestRsvpApi = async (guestId: string, rsvp: Guest['rsvp']): Promise<Guest> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ guest: Guest }>>(
    API.guests.rsvp(guestId),
    { rsvp }
  );
  return data.data.guest;
};

export const deleteGuestApi = async (guestId: string): Promise<void> => {
  await axiosInstance.delete(API.guests.byId(guestId));
};
