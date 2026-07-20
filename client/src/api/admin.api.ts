import api from './axios';

export const adminApi = {
  resetStudentFaceData: (studentId: string) => api.post(`/admin/students/${studentId}/reset-face`),
};
