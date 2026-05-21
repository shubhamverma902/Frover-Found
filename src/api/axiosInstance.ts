import axios, { type AxiosRequestConfig } from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL:         BASE_URL,
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true, // send the httpOnly refresh cookie on every request
  timeout:         10_000,
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach JWT access token; let browser own Content-Type for FormData uploads.
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — silent token refresh ──────────────────────────────
// When a 401 arrives we call /auth/refresh (the httpOnly cookie is sent
// automatically). If it succeeds we store the new access token and replay every
// request that was queued during the refresh round-trip.
// If the refresh itself fails we clear local state and let the app redirect.

let isRefreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const flushQueue = (err: unknown, token: string | null = null) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  queue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {};

    // Only attempt refresh on 401s that haven't already been retried,
    // and skip the refresh endpoint itself to avoid infinite loops.
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url === '/auth/refresh' ||
      original.url === '/auth/logout'
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Another request already kicked off a refresh — queue this one.
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(original);
      });
    }

    original._retry   = true;
    isRefreshing      = true;

    try {
      // Dynamic import avoids a circular dependency (auth.api → axiosInstance → auth.api)
      const { refreshTokenApi } = await import('./auth.api');
      const newToken = await refreshTokenApi();

      if (typeof window !== 'undefined') localStorage.setItem('auth_token', newToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;

      flushQueue(null, newToken);
      return axiosInstance(original);
    } catch (refreshErr) {
      flushQueue(refreshErr);
      if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
      // Dispatch a custom event so the Redux store can react without a circular import
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
