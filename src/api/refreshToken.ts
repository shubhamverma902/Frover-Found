const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1';

interface RefreshResponse { success: boolean; data: { token: string } }

export async function refreshTokenApi(): Promise<string> {
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method:      'POST',
    credentials: 'include',
    headers:     { 'Content-Type': 'application/json' },
    body:        '{}',
  });
  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const json: RefreshResponse = await res.json();
  return json.data.token;
}
