import { refreshTokenApi } from './refreshToken';

// Single in-flight refresh promise shared by the axios interceptor and restoreAuth.
// If both fire simultaneously (e.g. on a hard page refresh when RTK queries fire
// before the in-memory token is restored), they both await the same promise and
// receive the same new token — preventing a double-refresh race that would rotate
// the token version twice and cause "Refresh token already used" on the second call.

let _pending: Promise<string> | null = null;

export function refreshOnce(): Promise<string> {
  if (!_pending) {
    _pending = refreshTokenApi().finally(() => { _pending = null; });
  }
  return _pending;
}
