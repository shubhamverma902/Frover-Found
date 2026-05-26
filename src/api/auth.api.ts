import axiosInstance from './axiosInstance';
import type { AuthUser } from '@/store/slices/authSlice';
import { API } from '@/constants/api';
import type { ApiResponse } from './parse';
export { refreshTokenApi } from './refreshToken';

// ── Shapes returned by the backend ───────────────────────────

interface BackendUser {
  id:                  string;
  name:                string;
  email:               string;
  plan:                'free' | 'premium';
  role:                string;
  onboardingCompleted: boolean;
  collaboratorRole?:   'planner' | 'viewer' | null;
}

interface AuthApiData {
  token: string;
  user:  BackendUser;
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

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token:    string;
  password: string;
}

// ── API calls ────────────────────────────────────────────────

const toAuthUser = (u: BackendUser): AuthUser => ({
  id:                  u.id,
  name:                u.name,
  email:               u.email,
  plan:                u.plan ?? 'free',
  onboardingCompleted: u.onboardingCompleted,
  collaboratorRole:    u.collaboratorRole ?? null,
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
    plan:     payload.plan ?? 'free',
  });
  return { token: data.data.token, user: toAuthUser(data.data.user) };
};

export const getMeApi = async (): Promise<AuthUser> => {
  const { data } = await axiosInstance.get<ApiResponse<{ user: BackendUser & { _id?: string } }>>(API.auth.me);
  const u = data.data.user;
  return toAuthUser({ ...u, id: u.id ?? u._id ?? '' });
};


export const logoutApi = async (): Promise<void> => {
  await axiosInstance.post(API.auth.logout, {}, { withCredentials: true });
};

export const forgotPasswordApi = async (payload: ForgotPasswordPayload): Promise<void> => {
  await axiosInstance.post(API.auth.forgotPassword, payload);
};

export const resetPasswordApi = async (payload: ResetPasswordPayload): Promise<void> => {
  await axiosInstance.post(API.auth.resetPassword, payload);
};
