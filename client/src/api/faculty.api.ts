import api from './axios';
import type { ApiResponse, ClassData, FacultyAnalytics, StudentProfile } from '../types';

export interface CreateClassPayload {
  name: string; subject: string; subjectCode: string;
  department: string; semester: number;
  schedule?: Array<{ day: string; startTime: string; endTime: string }>;
}

export const facultyApi = {
  getProfile: () =>
    api.get<ApiResponse>('/faculty/profile').then(r => r.data),

  getAnalytics: () =>
    api.get<ApiResponse<FacultyAnalytics>>('/faculty/analytics').then(r => r.data),

  // Classes
  createClass: (data: CreateClassPayload) =>
    api.post<ApiResponse<ClassData>>('/faculty/classes', data).then(r => r.data),

  getClasses: () =>
    api.get<ApiResponse<ClassData[]>>('/faculty/classes').then(r => r.data),

  updateClass: (id: string, data: Partial<CreateClassPayload>) =>
    api.put<ApiResponse<ClassData>>(`/faculty/classes/${id}`, data).then(r => r.data),

  deleteClass: (id: string) =>
    api.delete<ApiResponse>(`/faculty/classes/${id}`).then(r => r.data),

  // Students in class
  getClassStudents: (classId: string) =>
    api.get<ApiResponse<StudentProfile[]>>(`/faculty/classes/${classId}/students`).then(r => r.data),

  addStudents: (classId: string, studentIds: string[]) =>
    api.post<ApiResponse<ClassData>>(`/faculty/classes/${classId}/students`, { studentIds }).then(r => r.data),

  removeStudent: (classId: string, studentId: string) =>
    api.delete<ApiResponse>(`/faculty/classes/${classId}/students/${studentId}`).then(r => r.data),
};
