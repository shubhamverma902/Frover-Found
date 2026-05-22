import axiosInstance from './axiosInstance';
import type { ChecklistCategory } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export const fetchChecklistApi = async (signal?: AbortSignal): Promise<ChecklistCategory[]> => {
  const { data } = await axiosInstance.get<ApiResponse<{ categories: ChecklistCategory[] }>>(API.checklist.base, { signal });
  return data.data.categories;
};

export const createTaskApi = async (
  payload: { category: string; label: string; due: string }
): Promise<ChecklistCategory> => {
  const { data } = await axiosInstance.post<ApiResponse<{ category: ChecklistCategory }>>(API.checklist.tasks, payload);
  return data.data.category;
};

export const toggleTaskApi = async (taskId: string): Promise<ChecklistCategory> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ category: ChecklistCategory }>>(API.checklist.toggle(taskId));
  return data.data.category;
};

export const updateTaskApi = async (
  taskId: string,
  payload: { label: string; due: string; category: string; originalCategory: string }
): Promise<ChecklistCategory[]> => {
  const { data } = await axiosInstance.put<ApiResponse<{ categories: ChecklistCategory[] }>>(API.checklist.task(taskId), payload);
  return data.data.categories;
};

export const deleteTaskApi = async (taskId: string): Promise<{ id: string; category: ChecklistCategory }> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ id: string; category: ChecklistCategory }>>(API.checklist.task(taskId));
  return data.data;
};
