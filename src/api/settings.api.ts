import axiosInstance from './axiosInstance';
import { API } from '@/constants/api';
import { parseResponse, type ApiResponse } from './parse';
import { SettingsDataSchema, ProfileDataSchema, WeddingDataSchema } from './schemas';


export interface NotificationPref {
  key:   string;
  label: string;
  sub:   string;
  on:    boolean;
}

export interface ProfileData {
  name:        string;
  partnerName: string;
  email:       string;
  phone:       string;
}

export interface WeddingData {
  weddingDate: string;
  venue:       string;
  city:        string;
  guestCount:  number;
}

export interface SettingsData {
  profile:       ProfileData;
  wedding:       WeddingData | null;
  notifications: NotificationPref[];
}

export const fetchSettingsApi = async (signal?: AbortSignal): Promise<SettingsData> => {
  const { data } = await axiosInstance.get<ApiResponse<SettingsData>>(API.settings.base, { signal });
  return parseResponse(SettingsDataSchema, data.data, 'fetchSettingsApi');
};

export const updateProfileApi = async (payload: ProfileData): Promise<ProfileData> => {
  const { data } = await axiosInstance.patch<ApiResponse<ProfileData>>(API.settings.profile, payload);
  return parseResponse(ProfileDataSchema, data.data, 'updateProfileApi');
};

export const updateWeddingApi = async (payload: WeddingData): Promise<WeddingData> => {
  const { data } = await axiosInstance.patch<ApiResponse<WeddingData>>(API.settings.wedding, payload);
  return parseResponse(WeddingDataSchema, data.data, 'updateWeddingApi');
};

export const updateNotificationsApi = async (prefs: Record<string, boolean>): Promise<void> => {
  await axiosInstance.patch(API.settings.notifications, { prefs });
};

export const exportMyDataApi = async (): Promise<void> => {
  const response = await axiosInstance.get(API.me.export, { responseType: 'blob' });
  const disposition = response.headers['content-disposition'] as string | undefined;
  const filename = disposition?.match(/filename="(.+?)"/)?.[1] ?? 'frover-data.json';
  const url = URL.createObjectURL(response.data as Blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const deleteAccountApi = async (): Promise<void> => {
  await axiosInstance.delete(API.me.erase);
};

export interface LinkedPartnerData {
  id:       string;
  name:     string;
  email:    string;
  linkedAt: string;
}

export interface PartnerStatusData {
  linked:  LinkedPartnerData | null;
  pending: { email: string; expiresAt: string } | null;
}

export interface InviteResult {
  inviteUrl: string;
  email:     string;
  expiresAt: string;
}
