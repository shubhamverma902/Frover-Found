import axiosInstance from './axiosInstance';
import type { BudgetCategory } from '@/types/budget';
import { API } from '@/constants/api';
import { parseResponse, type ApiResponse } from './parse';
import { BudgetDataSchema, BudgetCategorySchema } from './schemas';


export interface BudgetData {
  total:      number;
  categories: BudgetCategory[];
}

export const fetchBudgetApi = async (signal?: AbortSignal): Promise<BudgetData> => {
  const { data } = await axiosInstance.get<ApiResponse<BudgetData>>(API.budget.base, { signal });
  return parseResponse(BudgetDataSchema, data.data, 'fetchBudgetApi');
};

export const updateTotalApi = async (total: number): Promise<number> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ total: number }>>(API.budget.total, { total });
  return data.data.total;
};

export const updateAllocatedApi = async (categoryId: string, allocated: number): Promise<BudgetCategory> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ category: BudgetCategory }>>(
    API.budget.allocated(categoryId), { allocated }
  );
  return parseResponse(BudgetCategorySchema, data.data.category, 'updateAllocatedApi');
};

export const addExpenseApi = async (
  categoryId: string,
  payload: { amount: number; note: string }
): Promise<BudgetCategory> => {
  const { data } = await axiosInstance.post<ApiResponse<{ category: BudgetCategory }>>(
    API.budget.expenses(categoryId), payload
  );
  return parseResponse(BudgetCategorySchema, data.data.category, 'addExpenseApi');
};

export const deleteExpenseApi = async (categoryId: string, expenseId: string): Promise<BudgetCategory> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ category: BudgetCategory }>>(
    API.budget.expense(categoryId, expenseId)
  );
  return parseResponse(BudgetCategorySchema, data.data.category, 'deleteExpenseApi');
};
