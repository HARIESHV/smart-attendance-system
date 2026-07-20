import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Class from '../models/Class';
import Faculty from '../models/Faculty';
import Student from '../models/Student';

// GET /api/faculty/profile
export const getFacultyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await Faculty.findOne({ userId: req.user?._id });
    res.json({ success: true, data: { ...req.user?.toObject(), profile } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/faculty/classes
export const createClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, subject, subjectCode, department, semester, schedule } = req.body;
    const newClass = await Class.create({
      name,
      subject,
      subjectCode,
      department,
      semester,
      faculty: req.user?._id,
      schedule: schedule || [],
    });
    res.status(201).json({ success: true, data: newClass });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/faculty/classes
export const getFacultyClasses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const classes = await Class.find({ faculty: req.user?._id, isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: classes, count: classes.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/faculty/classes/:id
export const updateClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user?._id },
      req.body,
      { new: true }
    );
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }
    res.json({ success: true, data: cls });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/faculty/classes/:id
export const deleteClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user?._id },
      { isActive: false },
      { new: true }
    );
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }
    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/faculty/classes/:id/students
export const addStudentsToClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentIds } = req.body;
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user?._id },
      { $addToSet: { students: { $each: studentIds } } },
      { new: true }
    );
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }
    res.json({ success: true, data: cls });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/faculty/classes/:id/students/:studentId
export const removeStudentFromClass = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, faculty: req.user?._id },
      { $pull: { students: req.params.studentId } },
      { new: true }
    );
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }
    res.json({ success: true, data: cls });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/faculty/classes/:id/students
export const getClassStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const cls = await Class.findOne({ _id: req.params.id, faculty: req.user?._id });
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }

    // Get student profiles with populated user data
    const studentDetails = await Student.find({ userId: { $in: cls.students } })
      .populate('userId', 'name email phone')
      .select('rollNo department semester isFaceRegistered userId');

    res.json({ success: true, data: studentDetails });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/faculty/analytics
export const getFacultyAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const Attendance = (await import('../models/Attendance')).default;
    const AttendanceSession = (await import('../models/AttendanceSession')).default;

    const classes = await Class.find({ faculty: req.user?._id, isActive: true });
    const classIds = classes.map((c) => c._id);

    const totalSessions = await AttendanceSession.countDocuments({ faculty: req.user?._id });
    const activeSessions = await AttendanceSession.countDocuments({ faculty: req.user?._id, status: 'active' });

    // Attendance per class
    const classStats = await Promise.all(
      classes.map(async (cls) => {
        const sessions = await AttendanceSession.find({ classId: cls._id, status: 'closed' });
        const presentRecords = await Attendance.countDocuments({ classId: cls._id, status: { $in: ['present', 'late'] } });
        
        const theoreticalTotal = sessions.length * cls.students.length;

        return {
          classId: cls._id,
          className: cls.name,
          subject: cls.subject,
          totalSessions: sessions.length,
          totalStudents: cls.students.length,
          avgAttendance: theoreticalTotal > 0 ? Math.round((presentRecords / theoreticalTotal) * 100) : 0,
        };
      })
    );

    // Recent 7-day attendance trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentAttendance = await Attendance.aggregate([
      { $match: { classId: { $in: classIds }, date: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, total: { $sum: 1 }, present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        totalClasses: classes.length,
        totalSessions,
        activeSessions,
        classStats,
        recentTrend: recentAttendance,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
