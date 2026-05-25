import axiosInstance from './axiosInstance';
import { API } from '@/constants/api';
import { parseResponse } from './parse';
import { NotificationsDataSchema } from './schemas';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface AppNotification {
  _id:  string;
  icon: string;
  text: string;
  time: string;
  read: boolean;
}

export interface NotificationsData {
  notifications: AppNotification[];
  unreadCount:   number;
}

export const fetchNotificationsApi = async (signal?: AbortSignal): Promise<NotificationsData> => {
  const { data } = await axiosInstance.get<ApiResponse<NotificationsData>>(API.notifications.base, { signal });
  return parseResponse(NotificationsDataSchema, data.data, 'fetchNotificationsApi');
};

export const markAllReadApi = async (): Promise<void> => {
  await axiosInstance.patch(API.notifications.readAll);
};
