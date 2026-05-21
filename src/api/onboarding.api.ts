import axiosInstance from './axiosInstance';
import type { WeddingProfile } from '@/types/onboarding';
import { API } from '@/constants/api';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data:    T;
}

interface OnboardingData {
  onboardingCompleted: boolean;
  weddingProfile:      WeddingProfile | null;
}

export const saveOnboardingApi = async (profile: WeddingProfile): Promise<OnboardingData> => {
  const { data } = await axiosInstance.post<ApiResponse<OnboardingData>>(API.onboarding, profile);
  return data.data;
};

export const getOnboardingApi = async (): Promise<OnboardingData> => {
  const { data } = await axiosInstance.get<ApiResponse<OnboardingData>>(API.onboarding);
  return data.data;
};
