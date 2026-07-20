import { Router, Request, Response, NextFunction } from 'express';
import {
  startSession,
  closeSession,
  getSession,
  getFacultySessions,
  getClassAttendanceReport,
} from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';
import { AuthRequest } from '../middleware/auth.middleware';

const router = Router();

// Custom middleware for the exact error message required
const authorizeFacultyAttendance = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'faculty') {
    res.status(403).json({
      success: false,
      message: 'Only faculty members can perform face attendance.'
    });
    return;
  }
  next();
};

router.use(authenticate);

router.post('/sessions/start', authorizeFacultyAttendance, startSession);
router.get('/sessions', authorizeFacultyAttendance, getFacultySessions);
router.get('/sessions/:sessionId', authenticate, getSession);

// Student endpoints
import { requestAttendance } from '../controllers/attendance.controller';
router.post('/sessions/:sessionId/request', authenticate, requestAttendance);

// Faculty approval endpoints
import { approveAttendance, rejectAttendance } from '../controllers/attendance.controller';
router.put('/sessions/:sessionId/approve/:requestId', authorizeFacultyAttendance, approveAttendance);
router.put('/sessions/:sessionId/reject/:requestId', authorizeFacultyAttendance, rejectAttendance);

router.put('/sessions/:sessionId/close', authorizeFacultyAttendance, closeSession);
router.get('/class/:classId/report', authorizeFacultyAttendance, getClassAttendanceReport);

export default router;
