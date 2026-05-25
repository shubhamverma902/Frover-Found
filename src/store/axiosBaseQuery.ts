import { retry } from '@reduxjs/toolkit/query';
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
> = async ({ url, method = 'GET', data, params }, { signal }) => {
  try {
    const res = await axiosInstance.request({ url, method, data, params, signal });
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

// Retry wrapper with exponential backoff (600 ms → 1.2 s → 2.4 s).
//
// Retry policy:
//   FormData (file uploads) — never retry: duplicate uploads waste bandwidth
//   Mutations on 5xx        — never retry: server may have committed before failing
//   Mutations on no status  — retry: pure network error, request never reached server
//   Queries on no status    — retry: idempotent reads, safe to re-issue
//   Queries on 5xx          — retry: transient server error on a read
export const axiosBaseQueryWithRetry = retry(axiosBaseQuery, {
  maxRetries: 3,
  retryCondition: (error: AxiosBaseQueryError, args, { baseQueryApi }) => {
    // Never retry file uploads regardless of error type
    if ((args as Args).data instanceof FormData) return false;
    // For mutations, only a pure network failure (no HTTP response at all) is
    // safe to retry — 5xx means the server received the request and may have
    // committed the write, so retrying risks creating a duplicate
    if (baseQueryApi.type === 'mutation') return !error.status;
    // Queries are idempotent: retry on both network errors and server errors
    return !error.status || error.status >= 500;
  },
});
