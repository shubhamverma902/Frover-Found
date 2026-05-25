export interface SliceError {
  message: string;
  code:    number | null; // HTTP status code; null for network errors or non-HTTP failures
}

export function extractError(err: unknown, fallback: string): SliceError {
  const e = err as { response?: { data?: { message?: string }; status?: number }; message?: string };
  return {
    message: e.response?.data?.message ?? e.message ?? fallback,
    code:    e.response?.status        ?? null,
  };
}
