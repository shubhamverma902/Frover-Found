import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import { getAccessToken, setAccessToken, clearAccessToken } from './tokenStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

const axiosInstance = axios.create({
  baseURL:         BASE_URL,
  headers:         { 'Content-Type': 'application/json' },
  withCredentials: true, // send the httpOnly refresh cookie on every request
  timeout:         10_000,
});

// ── Request deduplication ────────────────────────────────────────────────────
// If the same request is fired multiple times while the first is still in
// flight (e.g. a button clicked rapidly), all subsequent calls are cancelled
// immediately and transparently share the first call's promise.
interface Deferred {
  promise: Promise<AxiosResponse>;
  resolve: (value: AxiosResponse) => void;
  reject:  (reason: unknown)      => void;
}

const inFlight = new Map<string, Deferred>();

function dedupKey(config: AxiosRequestConfig): string | null {
  if (config.data instanceof FormData) return null; // uploads are always unique
  return [
    (config.method ?? 'get').toUpperCase(),
    config.url ?? '',
    JSON.stringify(config.params ?? null),
    typeof config.data === 'string' ? config.data : JSON.stringify(config.data ?? null),
  ].join('::');
}

function makeDeferred(): Deferred {
  let resolve!: (value: AxiosResponse) => void;
  let reject!:  (reason: unknown)      => void;
  const promise = new Promise<AxiosResponse>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

type ExtendedConfig = AxiosRequestConfig & {
  _retry?:         boolean;
  __dedupKey?:     string;
  __dedupPromise?: Promise<AxiosResponse>;
};

// ── Request interceptor ──────────────────────────────────────────────────────
axiosInstance.interceptors.request.use(
  (config) => {
    // Attach JWT access token; let browser own Content-Type for FormData uploads.
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Retried requests (after a 401 refresh) already carry __dedupKey but must
    // NOT be treated as duplicates — they are the original request replaying.
    const cfg = config as ExtendedConfig;
    if (!cfg._retry) {
      const key = dedupKey(config);
      if (key) {
        const existing = inFlight.get(key);
        if (existing) {
          // Identical request already in flight — abort this one and hand back
          // the shared promise so the caller gets the same response.
          const controller = new AbortController();
          cfg.__dedupPromise = existing.promise;
          config.signal      = controller.signal;
          controller.abort();
        } else {
          // First request for this key — register a deferred.
          const deferred = makeDeferred();
          inFlight.set(key, deferred);
          cfg.__dedupKey = key;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — deduplication + silent token refresh ──────────────
let isRefreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

const flushQueue = (err: unknown, token: string | null = null) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token!)));
  queue = [];
};

axiosInstance.interceptors.response.use(
  (response) => {
    // Resolve the deferred so any waiting duplicates receive this response.
    const key = (response.config as ExtendedConfig).__dedupKey;
    if (key) {
      inFlight.get(key)?.resolve(response);
      inFlight.delete(key);
    }
    return response;
  },
  async (error) => {
    // ── 1. Cancelled duplicate — return the shared in-flight promise ──────────
    if (axios.isCancel(error)) {
      const cfg = (error.config as ExtendedConfig | undefined);
      if (cfg?.__dedupPromise) return cfg.__dedupPromise;

      // Original request was aborted by the caller (e.g. RTK thunk abort on
      // navigation) — reject any waiting duplicates and clean up.
      if (cfg?.__dedupKey) {
        inFlight.get(cfg.__dedupKey)?.reject(error);
        inFlight.delete(cfg.__dedupKey);
      }
      return Promise.reject(error);
    }

    const original = (error.config ?? {}) as ExtendedConfig;
    const key      = original.__dedupKey;

    // ── 2. Non-401 or already-retried — reject deferred + propagate ──────────
    if (
      error.response?.status !== 401 ||
      original._retry               ||
      original.url === '/auth/refresh' ||
      original.url === '/auth/logout'
    ) {
      if (key) {
        inFlight.get(key)?.reject(error);
        inFlight.delete(key);
      }
      return Promise.reject(error);
    }

    // ── 3. 401 that needs a token refresh ────────────────────────────────────
    // The deferred stays in the map; the retried request will resolve it via
    // the success handler above (it inherits __dedupKey from original config).
    if (isRefreshing) {
      // Another request already started a refresh — queue behind it.
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((newToken) => {
        original._retry = true; // prevent dedup from treating this as a new first request
        if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;
        return axiosInstance(original);
      });
    }

    original._retry = true;
    isRefreshing    = true;

    try {
      // Dynamic import avoids a circular dependency (auth.api → axiosInstance → auth.api)
      const { refreshTokenApi } = await import('./auth.api');
      const newToken = await refreshTokenApi();

      setAccessToken(newToken);
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`;

      flushQueue(null, newToken);
      return axiosInstance(original);
    } catch (refreshErr) {
      flushQueue(refreshErr);
      // Refresh failed — reject the deferred so waiting duplicates also fail.
      if (key) {
        inFlight.get(key)?.reject(refreshErr);
        inFlight.delete(key);
      }
      clearAccessToken();
      if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth:logout'));
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
