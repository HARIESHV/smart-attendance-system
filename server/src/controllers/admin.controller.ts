import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Student from '../models/Student';

// ─── POST /api/admin/students/:studentId/reset-face ──────────────────────────
export const resetStudentFaceData = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentId } = req.params; // Note: This is the User _id

    const student = await Student.findOne({ userId: studentId });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Clear face descriptors and reset flag
    student.faceDescriptors = [];
    student.dailyDescriptors = [];
    student.isFaceRegistered = false;
    
    await student.save();

    res.json({ success: true, message: 'Face data has been reset successfully. The student will need to re-register their face.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
