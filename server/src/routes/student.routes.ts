import { Router } from 'express';
import {
  getStudentProfile,
  saveFaceDescriptors,
  saveDailyFaceDescriptors,
  getDailyRegistrationStatus,
  getAllDescriptors,
  getMyAttendance,
  getAllStudents,
  updatePhoneContacts,
} from '../controllers/student.controller';
import { getStudentDashboard } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { requireCollegeNetwork } from '../middleware/networkCheck.middleware';

const router = Router();

router.use(authenticate);

// Student profile
router.get('/profile', authorize('student'), getStudentProfile);

// Unified Dashboard
router.get('/dashboard', authorize('student'), getStudentDashboard);

// Attendance history
router.get('/my-attendance', authorize('student'), getMyAttendance);

// Active sessions
import { getActiveSessions } from '../controllers/student.controller';
router.get('/active-sessions', authorize('student'), getActiveSessions);

// Phone contacts
router.put('/phone-contacts', authorize('student'), updatePhoneContacts);

// Daily registration status (no network check needed — just a read)
router.get('/daily-registration-status', authorize('student'), getDailyRegistrationStatus);

// Permanent face enrollment (requires college network)
router.post('/face-descriptors', authorize('student'), requireCollegeNetwork, saveFaceDescriptors);

// Daily face registration (requires college network)
router.post('/daily-face-registration', authorize('student'), requireCollegeNetwork, saveDailyFaceDescriptors);

// Faculty can access these
router.get('/all', authorize('faculty'), getAllStudents);
router.get('/all-descriptors', authorize('faculty'), getAllDescriptors);

export default router;
