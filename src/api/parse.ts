import type { ZodType } from 'zod';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}

export function parseResponse<T>(schema: ZodType<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (result.success) return result.data;
  if (process.env.NODE_ENV === 'development') {
    console.error(`[schema] ${label}`, result.error.format());
    throw result.error;
  }
  const first = result.error.issues[0];
  console.warn(`[schema] ${label}: ${first ? `${first.path.join('.')} — ${first.message}` : 'shape mismatch'}`);
  return data as T;
}
