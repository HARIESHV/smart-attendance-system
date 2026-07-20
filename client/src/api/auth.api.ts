import api from './axios';
import type { ApiResponse, User } from '../types';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload {
  name: string; email: string; password: string; role: 'student' | 'faculty';
  phone?: string; rollNo?: string; department?: string; course?: string;
  semester?: number; year?: number; employeeId?: string; designation?: string;
}

export const authApi = {
  login: (data: LoginPayload) =>
    api.post<ApiResponse>('/auth/login', data).then(r => r.data),

  register: (data: RegisterPayload) =>
    api.post<ApiResponse>('/auth/register', data).then(r => r.data),

  getMe: () =>
    api.get<ApiResponse<{ user: User }>>('/auth/me').then(r => r.data),

  updateProfile: (data: { name?: string; phone?: string }) =>
    api.put<ApiResponse>('/auth/update-profile', data).then(r => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put<ApiResponse>('/auth/change-password', data).then(r => r.data),
};
