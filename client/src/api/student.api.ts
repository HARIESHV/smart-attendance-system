import api from './axios';
import type { ApiResponse, DescriptorEntry, AttendanceSummary, AttendanceRecord, StudentProfile, DailyRegistrationStatus } from '../types';

export const studentApi = {
  getProfile: () =>
    api.get<ApiResponse>('/students/profile').then(r => r.data),

  getDashboard: () =>
    api.get<ApiResponse>('/students/dashboard').then(r => r.data),

  /** Permanent face enrollment (requires college network + first time) */
  saveFaceDescriptors: (data: { descriptors: number[][]; imageUrls?: string[] }) =>
    api.post<ApiResponse>('/students/face-descriptors', data).then(r => r.data),

  /** Daily face registration — students must call this every day */
  saveDailyFaceDescriptors: (data: { descriptors: number[][] }) =>
    api.post<ApiResponse>('/students/daily-face-registration', data).then(r => r.data),

  /** Check if current student has registered face today */
  getDailyRegistrationStatus: () =>
    api.get<ApiResponse<DailyRegistrationStatus>>('/students/daily-registration-status').then(r => r.data),

  /** Update phone contacts */
  updatePhoneContacts: (data: { studentPhone?: string; fatherPhone?: string; motherPhone?: string }) =>
    api.put<ApiResponse>('/students/phone-contacts', data).then(r => r.data),

  getMyAttendance: () =>
    api.get<ApiResponse<{ records: AttendanceRecord[]; summary: AttendanceSummary[] }>>('/students/my-attendance').then(r => r.data),

  getActiveSessions: () =>
    api.get<ApiResponse<any[]>>('/students/active-sessions').then(r => r.data),

  // Faculty only
  getAllStudents: (params?: { department?: string; semester?: number }) =>
    api.get<ApiResponse<StudentProfile[]>>('/students/all', { params }).then(r => r.data),

  getAllDescriptors: () =>
    api.get<ApiResponse<DescriptorEntry[]>>('/students/all-descriptors').then(r => r.data),
};
