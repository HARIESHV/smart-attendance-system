// ========================
// User & Auth Types
// ========================
export const _dummy = true;

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'faculty';
  phone?: string;
  fatherPhone?: string;
  motherPhone?: string;
  avatar?: string;
  profile?: StudentProfile | FacultyProfile;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ========================
// Student Types
// ========================
export interface StudentProfile {
  _id: string;
  userId: string;
  rollNo: string;
  department: string;
  course: string;
  semester: number;
  year: number;
  isFaceRegistered: boolean;
  faceDescriptors?: FaceDescriptorData[];
  // Phone contacts
  studentPhone?: string;
  fatherPhone?: string;
  motherPhone?: string;
}

export interface FaceDescriptorData {
  label: string;
  descriptors: number[][];
  imageUrls: string[];
}

export interface DailyRegistrationStatus {
  registeredToday: boolean;
  registeredAt: string | null;
  date: string;
  isFaceRegistered: boolean;
}

// ========================
// Faculty Types
// ========================
export interface FacultyProfile {
  _id: string;
  userId: string;
  employeeId: string;
  department: string;
  designation: string;
  subjects: string[];
}

// ========================
// Class Types
// ========================
export interface ClassSchedule {
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
}

export interface ClassData {
  _id: string;
  name: string;
  subject: string;
  subjectCode: string;
  faculty: string;
  department: string;
  semester: number;
  students: string[];
  schedule: ClassSchedule[];
  isActive: boolean;
  createdAt: string;
}

// ========================
// Attendance Types
// ========================
export interface AttendanceSession {
  _id: string;
  classId: ClassData | string;
  faculty: User | string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'closed';
  topic?: string;
  totalStudents: number;
  presentCount: number;
  createdAt: string;
}

export interface AttendanceRecord {
  _id: string;
  session: AttendanceSession | string;
  classId: ClassData | string;
  student: User | string;
  status: 'present' | 'absent' | 'late';
  markedAt?: string;
  method: 'face' | 'manual';
  confidence?: number;
  date: string;
}

export interface AttendanceSummary {
  classId: string;
  className: string;
  subject: string;
  total: number;
  present: number;
  percentage: number;
}

// ========================
// Report Types
// ========================
export interface ReportStudent {
  studentId: string;
  name: string;
  rollNo: string;
  email: string;
  sessionData: Record<string, string>;
  present: number;
  total: number;
  percentage: number;
}

export interface ClassReport {
  class: ClassData;
  sessions: Array<{ _id: string; date: string; topic?: string }>;
  students: ReportStudent[];
  generatedAt: string;
}

// ========================
// Notification Types
// ========================
export interface Notification {
  _id: string;
  student: string;
  type: 'sms' | 'attendance_alert' | 'low_attendance';
  message: string;
  phone: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  createdAt: string;
}

// ========================
// SMS Types
// ========================
export interface SMSRecord {
  _id: string;
  faculty: string | User;
  student: string | User;
  recipientType: 'student' | 'father' | 'mother';
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  twilioSid?: string;
  sentAt?: string;
  deliveredAt?: string;
  error?: string;
  retryCount: number;
  maxRetries: number;
  createdAt: string;
}

export interface SMSStats {
  pending: number;
  sent: number;
  delivered: number;
  failed: number;
}

export interface StudentWithContacts {
  _id: string;
  name: string;
  email: string;
  rollNo: string;
  department: string;
  semester: number;
  isFaceRegistered: boolean;
  studentPhone: string | null;
  fatherPhone: string | null;
  motherPhone: string | null;
}

// ========================
// API Response
// ========================
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: User;
  count?: number;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  duplicate?: boolean;
}

// ========================
// Network Check
// ========================
export interface NetworkCheckResponse {
  success: boolean;
  onCollegeNetwork: boolean;
  ip: string;
  message: string;
}

// ========================
// Face Recognition
// ========================
export interface FaceMatchResult {
  studentId: string;
  rollNo: string;
  name: string;
  confidence: number;
  label: string;
}

export interface DescriptorEntry {
  studentId: string;
  name: string;
  rollNo: string;
  label: string;
  descriptors: number[][];
  registeredAt?: string;
}

// ========================
// Analytics
// ========================
export interface ClassAnalytics {
  classId: string;
  className: string;
  subject: string;
  totalSessions: number;
  totalStudents: number;
  avgAttendance: number;
}

export interface TrendPoint {
  _id: string;
  total: number;
  present: number;
}

export interface FacultyAnalytics {
  totalClasses: number;
  totalSessions: number;
  activeSessions: number;
  classStats: ClassAnalytics[];
  recentTrend: TrendPoint[];
}

// ========================
// Face Session Status
// ========================
export type ScanStatus =
  | 'idle'
  | 'loading_models'
  | 'connecting_camera'
  | 'camera_connected'
  | 'scanning'
  | 'face_detected'
  | 'face_matched'
  | 'attendance_marked'
  | 'unknown_face'
  | 'multiple_faces'
  | 'low_light'
  | 'reconnecting'
  | 'camera_denied'
  | 'error';
