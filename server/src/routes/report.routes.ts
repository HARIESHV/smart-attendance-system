import { Router } from 'express';
import { Response } from 'express';
import { AuthRequest, authenticate, authorize } from '../middleware/auth.middleware';
import Attendance from '../models/Attendance';
import AttendanceSession from '../models/AttendanceSession';
import Class from '../models/Class';
import Student from '../models/Student';

const router = Router();

router.use(authenticate, authorize('faculty'));

// GET /api/reports/class/:classId/pdf-data
// Returns data for client-side PDF generation
router.get('/class/:classId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { from, to } = req.query;

    const dateFilter: any = {};
    if (from) dateFilter.$gte = new Date(from as string);
    if (to) dateFilter.$lte = new Date(to as string);

    const cls = await Class.findOne({ _id: classId, faculty: req.user?._id }).populate('faculty', 'name');
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }

    const sessions = await AttendanceSession.find({
      classId,
      status: 'closed',
      ...(Object.keys(dateFilter).length && { date: dateFilter }),
    }).sort({ date: 1 });

    const sessionIds = sessions.map((s) => s._id);

    // Get all students in the class
    const studentProfiles = await Student.find({ userId: { $in: cls.students } })
      .populate('userId', 'name email phone')
      .select('rollNo userId');

    // Build attendance matrix
    const matrix = await Promise.all(
      studentProfiles.map(async (sp) => {
        const records = await Attendance.find({
          session: { $in: sessionIds },
          student: sp.userId,
        }).select('session status');

        const sessionMap: Record<string, string> = {};
        records.forEach((r) => {
          sessionMap[r.session.toString()] = r.status;
        });

        const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
        const percentage = sessions.length > 0 ? Math.round((present / sessions.length) * 100) : 0;

        return {
          studentId: (sp.userId as any)._id,
          name: (sp.userId as any).name,
          rollNo: sp.rollNo,
          email: (sp.userId as any).email,
          sessionData: sessionMap,
          present,
          total: sessions.length,
          percentage,
        };
      })
    );

    res.json({
      success: true,
      data: {
        class: cls,
        sessions: sessions.map((s) => ({ _id: s._id, date: s.date, topic: s.topic })),
        students: matrix,
        generatedAt: new Date(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
