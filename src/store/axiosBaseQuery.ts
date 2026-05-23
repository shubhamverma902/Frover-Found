import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import type { AxiosError } from 'axios';
import axiosInstance from '@/api/axiosInstance';

type Args = {
  url:     string;
  method?: string;
  data?:   unknown;
  params?: unknown;
};

export type AxiosBaseQueryError = { status?: number; error: string };

// Wraps axiosInstance so RTK Query can use it as its base query.
// All API responses are { success, message, data: <payload> } — we unwrap to
// return <payload> directly so endpoint types match the inner data shape.
export const axiosBaseQuery: BaseQueryFn<
  Args,
  unknown,
  AxiosBaseQueryError
> = async ({ url, method = 'GET', data, params }) => {
  try {
    const res = await axiosInstance.request({ url, method, data, params });
    return { data: res.data.data };
  } catch (e) {
    const err = e as AxiosError<{ message?: string }>;
    return {
      error: {
        status: err.response?.status,
        error:  err.response?.data?.message ?? err.message,
      },
    };
  }
};
