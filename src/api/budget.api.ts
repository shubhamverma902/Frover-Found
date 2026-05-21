import axiosInstance from './axiosInstance';
import type { BudgetCategory } from '@/constants/dashboard-pages';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface BudgetData {
  total:      number;
  categories: BudgetCategory[];
}

export const fetchBudgetApi = async (): Promise<BudgetData> => {
  const { data } = await axiosInstance.get<ApiResponse<BudgetData>>(API.budget.base);
  return data.data;
};

export const updateTotalApi = async (total: number): Promise<number> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ total: number }>>(API.budget.total, { total });
  return data.data.total;
};

export const updateAllocatedApi = async (categoryId: string, allocated: number): Promise<BudgetCategory> => {
  const { data } = await axiosInstance.patch<ApiResponse<{ category: BudgetCategory }>>(
    API.budget.allocated(categoryId), { allocated }
  );
  return data.data.category;
};

export const addExpenseApi = async (
  categoryId: string,
  payload: { amount: number; note: string }
): Promise<BudgetCategory> => {
  const { data } = await axiosInstance.post<ApiResponse<{ category: BudgetCategory }>>(
    API.budget.expenses(categoryId), payload
  );
  return data.data.category;
};

export const deleteExpenseApi = async (categoryId: string, expenseId: string): Promise<BudgetCategory> => {
  const { data } = await axiosInstance.delete<ApiResponse<{ category: BudgetCategory }>>(
    API.budget.expense(categoryId, expenseId)
  );
  return data.data.category;
};
