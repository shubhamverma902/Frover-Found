import axiosInstance from './axiosInstance';
import type { ChecklistCategory } from '@/types/checklist';
import { API } from '@/constants/api';
import { parseResponse } from './parse';
import { ChecklistCategorySchema, ChecklistResponseSchema } from './schemas';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export const fetchChecklistApi = async (signal?: AbortSignal): Promise<ChecklistCategory[]> => {
  const { data } = await axiosInstance.get<ApiResponse<{ categories: ChecklistCategory[] }>>(API.checklist.base, { signal });
  return parseResponse(ChecklistResponseSchema, data.data, 'fetchChecklistApi').categories;
};

export const createTaskApi = async (
  payload: { category: string; label: string; due: string }
): Promise<ChecklistCategory> => {
  const { data } = await axiosInstance.post<ApiResponse<{ category: ChecklistCategory }>>(API.checklist.tasks, payload);
  return parseResponse(ChecklistCategorySchema, data.data.category, 'createTaskApi');
};

export const toggleTaskApi = async (taskId: string): Promise<ChecklistCategory> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ category: ChecklistCategory }>>(API.checklist.toggle(taskId));
  return parseResponse(ChecklistCategorySchema, data.data.category, 'toggleTaskApi');
};

export const updateTaskApi = async (
  taskId: string,
  payload: { label: string; due: string; category: string; originalCategory: string }
): Promise<ChecklistCategory[]> => {
  const { data } = await axiosInstance.put<ApiResponse<{ categories: ChecklistCategory[] }>>(API.checklist.task(taskId), payload);
  return parseResponse(ChecklistResponseSchema, data.data, 'updateTaskApi').categories;
};

export const deleteTaskApi = async (taskId: string): Promise<{ id: string; category: ChecklistCategory }> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ id: string; category: ChecklistCategory }>>(API.checklist.task(taskId));
  return {
    id:       data.data.id,
    category: parseResponse(ChecklistCategorySchema, data.data.category, 'deleteTaskApi'),
  };
};
