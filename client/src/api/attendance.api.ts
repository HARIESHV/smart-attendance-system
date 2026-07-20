import api from './axios';
import type { ApiResponse, AttendanceSession, AttendanceRecord, ClassReport } from '../types';

export const attendanceApi = {
  startSession: (data: { classId: string; topic?: string }) =>
    api.post<ApiResponse<AttendanceSession>>('/attendance/sessions/start', data).then(r => r.data),

  closeSession: (sessionId: string) =>
    api.put<ApiResponse<AttendanceSession>>(`/attendance/sessions/${sessionId}/close`).then(r => r.data),

  requestAttendance: (sessionId: string, data: { confidence?: number }) =>
    api.post<ApiResponse<any>>(`/attendance/sessions/${sessionId}/request`, data).then(r => r.data),

  approveAttendance: (sessionId: string, requestId: string) =>
    api.put<ApiResponse<any>>(`/attendance/sessions/${sessionId}/approve/${requestId}`).then(r => r.data),

  rejectAttendance: (sessionId: string, requestId: string) =>
    api.put<ApiResponse<any>>(`/attendance/sessions/${sessionId}/reject/${requestId}`).then(r => r.data),

  getSession: (sessionId: string) =>
    api.get<ApiResponse<{ session: AttendanceSession; attendanceRecords: AttendanceRecord[] }>>(`/attendance/sessions/${sessionId}`).then(r => r.data),

  getFacultySessions: (params?: { classId?: string; status?: string; limit?: number }) =>
    api.get<ApiResponse<AttendanceSession[]>>('/attendance/sessions', { params }).then(r => r.data),

  getClassReport: (classId: string, params?: { from?: string; to?: string }) =>
    api.get<ApiResponse<ClassReport>>(`/attendance/class/${classId}/report`, { params }).then(r => r.data),

  getReportData: (classId: string, params?: { from?: string; to?: string }) =>
    api.get<ApiResponse<ClassReport>>(`/reports/class/${classId}`, { params }).then(r => r.data),
};
