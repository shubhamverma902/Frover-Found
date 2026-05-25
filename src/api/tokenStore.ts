// In-memory access token store.
// The access token is NEVER written to localStorage or sessionStorage.
// On hard refresh, axiosInstance's restoreAuth calls /auth/refresh (httpOnly cookie)
// to rehydrate — so the XSS attack surface for token theft is eliminated.

let _accessToken: string | null = null;

export const setAccessToken   = (token: string)       => { _accessToken = token; };
export const getAccessToken   = ()                     => _accessToken;
export const clearAccessToken = ()                     => { _accessToken = null; };
