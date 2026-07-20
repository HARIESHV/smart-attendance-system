import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Student from '../models/Student';
import Class from '../models/Class';
import AttendanceSession from '../models/AttendanceSession';
import Attendance from '../models/Attendance';

export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.user?._id;

    // 1. Fetch Student Profile
    const studentProfile = await Student.findOne({ userId: studentId }).populate('userId', 'name email');
    if (!studentProfile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // 2. Fetch Enrolled Classes (Subjects)
    const enrolledClasses = await Class.find({ students: studentId });
    const classIds = enrolledClasses.map(c => c._id);

    const subjects = enrolledClasses.map(c => ({
      _id: c._id,
      name: c.name,
      subject: c.subject,
      subjectCode: c.subjectCode
    }));

    // 3. Fetch Attendance Summary
    const sessions = await AttendanceSession.find({ classId: { $in: classIds }, status: 'closed' });
    
    const classSummary: Record<string, { className: string; subject: string; total: number; present: number }> = {};
    enrolledClasses.forEach(cls => {
      const cid = cls._id.toString();
      classSummary[cid] = {
        className: cls.name,
        subject: cls.subject,
        total: sessions.filter(s => s.classId.toString() === cid).length,
        present: 0
      };
    });

    const records = await Attendance.find({ student: studentId, session: { $in: sessions.map(s => s._id) } });
    
    records.forEach((r) => {
      const cid = (r.classId as any)._id ? (r.classId as any)._id.toString() : r.classId.toString();
      if (classSummary[cid] && (r.status === 'present' || r.status === 'late')) {
        classSummary[cid].present++;
      }
    });

    const attendance = Object.entries(classSummary).map(([classId, data]) => ({
      classId,
      ...data,
      percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    }));

    // 4. Notifications (Placeholder for now)
    const notifications: any[] = [];

    // Also fetch active sessions just in case the dashboard needs them
    const activeSessions = await AttendanceSession.find({ classId: { $in: classIds }, status: 'active' })
      .populate('classId', 'name subject subjectCode')
      .populate('faculty', 'name');

    res.json({
      success: true,
      data: {
        student: { ...req.user?.toObject(), profile: studentProfile },
        attendance: { summary: attendance },
        subjects,
        notifications,
        activeSessions
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
