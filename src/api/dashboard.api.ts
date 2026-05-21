import axiosInstance from './axiosInstance';
import { API } from '@/constants/api';

interface ApiResponse<T> { success: boolean; message: string; data: T; }

export interface DashboardUserData {
  name:        string;
  partner:     string;
  weddingDate: string;
  venue:       string;
  daysLeft:    number | null;
}

export interface DashboardStatsData {
  daysLeft:         number | null;
  tasksTotal:       number;
  tasksDone:        number;
  budgetTotal:      number;
  budgetSpent:      number;
  guestsTotal:      number;
  guestsConfirmed:  number;
  vendorsTotal:     number;
  vendorsBooked:    number;
}

export interface DashboardTask {
  _id:          string;
  label:        string;
  due:          string;
  done:         boolean;
  categoryIcon: string;
}

export interface DashboardActivity {
  _id:  string;
  icon: string;
  text: string;
  time: string;
}

export interface DashboardData {
  user:     DashboardUserData;
  stats:    DashboardStatsData;
  tasks:    DashboardTask[];
  activity: DashboardActivity[];
}

export const fetchDashboardApi = async (): Promise<DashboardData> => {
  const { data } = await axiosInstance.get<ApiResponse<DashboardData>>(API.dashboard);
  return data.data;
};
