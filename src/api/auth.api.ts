import axiosInstance from './axiosInstance';
import type { AuthUser } from '@/store/slices/authSlice';
import { API } from '@/constants/api';

// ── Shapes returned by the backend ───────────────────────────

interface BackendUser {
  id:                  string;
  name:                string;
  email:               string;
  role:                string;
  onboardingCompleted: boolean;
}

interface AuthApiData {
  token: string;
  user:  BackendUser;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}

// ── Request payloads ─────────────────────────────────────────

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface RegisterPayload {
  name:     string;
  email:    string;
  password: string;
  plan?:    'free' | 'premium';
}

// ── API calls ────────────────────────────────────────────────

const toAuthUser = (u: BackendUser, plan: AuthUser['plan'] = 'free'): AuthUser => ({
  id:                  u.id,
  name:                u.name,
  email:               u.email,
  plan,
  onboardingCompleted: u.onboardingCompleted,
});

export const loginApi = async (payload: LoginPayload): Promise<{ token: string; user: AuthUser }> => {
  const { data } = await axiosInstance.post<ApiResponse<AuthApiData>>(API.auth.login, payload);
  return { token: data.data.token, user: toAuthUser(data.data.user) };
};

export const registerApi = async (payload: RegisterPayload): Promise<{ token: string; user: AuthUser }> => {
  const { data } = await axiosInstance.post<ApiResponse<AuthApiData>>(API.auth.register, {
    name:     payload.name,
    email:    payload.email,
    password: payload.password,
  });
  return { token: data.data.token, user: toAuthUser(data.data.user, payload.plan ?? 'free') };
};

export const getMeApi = async (): Promise<AuthUser> => {
  const { data } = await axiosInstance.get<ApiResponse<{ user: BackendUser & { _id?: string } }>>(API.auth.me);
  const u = data.data.user;
  return toAuthUser({ ...u, id: u.id ?? u._id ?? '' });
};
