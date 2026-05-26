import axiosInstance from './axiosInstance';
import type { Guest } from '@/types/guest';
import { API } from '@/constants/api';
import { parseResponse, type ApiResponse } from './parse';
import { GuestsDataSchema, GuestSchema } from './schemas';


export interface GuestsData {
  guests:     Guest[];
  total:      number;      // filtered count (for pagination)
  page:       number;
  totalPages: number;
  grandTotal: number;      // unfiltered total (for stat cards)
  confirmed:  number;
  pending:    number;
  declined:   number;
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
  return parseResponse(GuestsDataSchema, data.data, 'fetchGuestsApi');
};

export const createGuestApi = async (payload: CreateGuestPayload): Promise<Guest> => {
  const { data } = await axiosInstance.post<ApiResponse<{ guest: Guest }>>(API.guests.base, payload);
  return parseResponse(GuestSchema, data.data.guest, 'createGuestApi');
};

export const patchGuestRsvpApi = async (guestId: string, rsvp: Guest['rsvp']): Promise<Guest> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ guest: Guest }>>(
    API.guests.rsvp(guestId),
    { rsvp }
  );
  return parseResponse(GuestSchema, data.data.guest, 'patchGuestRsvpApi');
};

export const deleteGuestApi = async (guestId: string): Promise<void> => {
  await axiosInstance.delete(API.guests.byId(guestId));
};
