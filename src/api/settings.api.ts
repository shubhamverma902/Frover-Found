import axiosInstance from './axiosInstance';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

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

export const fetchSettingsApi = async (): Promise<SettingsData> => {
  const { data } = await axiosInstance.get<ApiResponse<SettingsData>>(API.settings.base);
  return data.data;
};

export const updateProfileApi = async (payload: ProfileData): Promise<ProfileData> => {
  const { data } = await axiosInstance.patch<ApiResponse<ProfileData>>(API.settings.profile, payload);
  return data.data;
};

export const updateWeddingApi = async (payload: WeddingData): Promise<WeddingData> => {
  const { data } = await axiosInstance.patch<ApiResponse<WeddingData>>(API.settings.wedding, payload);
  return data.data;
};

export const updateNotificationsApi = async (prefs: Record<string, boolean>): Promise<void> => {
  await axiosInstance.patch(API.settings.notifications, { prefs });
};

export const deleteAccountApi = async (): Promise<void> => {
  await axiosInstance.delete(API.settings.account);
};
