import express from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { resetStudentFaceData } from '../controllers/admin.controller';

const router = express.Router();

router.use(authenticate);
router.use(authorize('admin'));

router.post('/students/:studentId/reset-face', resetStudentFaceData);

export default router;
