import { Router } from 'express';
import {
  getFacultyProfile,
  createClass,
  getFacultyClasses,
  updateClass,
  deleteClass,
  addStudentsToClass,
  removeStudentFromClass,
  getClassStudents,
  getFacultyAnalytics,
} from '../controllers/faculty.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorize('faculty'));

router.get('/profile', getFacultyProfile);
router.get('/analytics', getFacultyAnalytics);

router.post('/classes', createClass);
router.get('/classes', getFacultyClasses);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

router.get('/classes/:id/students', getClassStudents);
router.post('/classes/:id/students', addStudentsToClass);
router.delete('/classes/:id/students/:studentId', removeStudentFromClass);

export default router;
