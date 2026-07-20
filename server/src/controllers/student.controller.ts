import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/User';
import Student from '../models/Student';
import cloudinary from '../config/cloudinary';

// ─── GET /api/students/profile ────────────────────────────────────────────────
export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await Student.findOne({ userId: req.user?._id });
    if (!profile) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }
    res.json({ success: true, data: { ...req.user?.toObject(), profile } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/students/face-descriptors ──────────────────────────────────────
/**
 * Saves PERMANENT face descriptors (used once for initial enrollment).
 * Requires college network (enforced at route level).
 */
export const saveFaceDescriptors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { descriptors, imageUrls } = req.body;
    if (!descriptors || !Array.isArray(descriptors) || descriptors.length === 0) {
      res.status(400).json({ success: false, message: 'Face descriptors are required' });
      return;
    }

    const student = await Student.findOne({ userId: req.user?._id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    student.faceDescriptors = [
      {
        label: student.rollNo,
        descriptors,
        imageUrls: imageUrls || [],
      },
    ];
    student.isFaceRegistered = true;
    await student.save();

    // ── Notify Faculty in real-time ──
    if (req.io) {
      req.io.to('faculty').emit('faculty:notification', {
        title: 'New Face Registration',
        message: `Student: ${req.user?.name}\nRegister No: ${student.rollNo}\nDepartment: ${student.department}\nReady for Face Attendance.`,
        studentId: student.userId,
        time: new Date(),
      });
    }

    res.json({ success: true, message: 'Face registered successfully', data: { isFaceRegistered: true } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/students/daily-face-registration ───────────────────────────────
/**
 * Saves DAILY face descriptors. Students must call this each day before
 * their attendance can be marked via face recognition.
 * Requires college network (enforced at route level).
 */
export const saveDailyFaceDescriptors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { descriptors } = req.body;
    if (!descriptors || !Array.isArray(descriptors) || descriptors.length === 0) {
      res.status(400).json({ success: false, message: 'Face descriptors are required' });
      return;
    }

    const student = await Student.findOne({ userId: req.user?._id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    // Get today's date string YYYY-MM-DD in IST
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    // Remove any existing record for today, then push the new one
    student.dailyDescriptors = student.dailyDescriptors.filter((d) => d.date !== today);
    student.dailyDescriptors.push({ date: today, descriptors, registeredAt: new Date() });

    // Keep only last 7 days to avoid bloat
    student.dailyDescriptors = student.dailyDescriptors
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7);

    await student.save();

    res.json({
      success: true,
      message: 'Daily face registration successful',
      data: { date: today, registeredAt: new Date() },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/students/daily-registration-status ──────────────────────────────
/**
 * Returns whether the current student has registered their face today.
 */
export const getDailyRegistrationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await Student.findOne({ userId: req.user?._id }).select('dailyDescriptors isFaceRegistered');
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
    const todayRecord = student.dailyDescriptors.find((d) => d.date === today);

    res.json({
      success: true,
      data: {
        registeredToday: !!todayRecord,
        registeredAt: todayRecord?.registeredAt || null,
        date: today,
        isFaceRegistered: student.isFaceRegistered,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/students/all-descriptors ────────────────────────────────────────
/**
 * Returns ONLY TODAY'S daily descriptors for all registered students.
 * Faculty uses this to build the FaceMatcher for the current session.
 */
export const getAllDescriptors = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

    const students = await Student.find({ isFaceRegistered: true })
      .populate('userId', 'name email')
      .select('rollNo dailyDescriptors userId');

    // Only include students who have registered today
    const descriptorData = students
      .map((s) => {
        const todayDesc = s.dailyDescriptors.find((d) => d.date === today);
        if (!todayDesc || todayDesc.descriptors.length === 0) return null;
        return {
          studentId: (s.userId as any)._id,
          name: (s.userId as any).name,
          rollNo: s.rollNo,
          label: s.rollNo,
          descriptors: todayDesc.descriptors,
          registeredAt: todayDesc.registeredAt,
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      data: descriptorData,
      date: today,
      totalRegistered: descriptorData.length,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/students/active-sessions ─────────────────────────────────────────
export const getActiveSessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const AttendanceSession = (await import('../models/AttendanceSession')).default;
    const Class = (await import('../models/Class')).default;

    const studentId = req.user?._id;
    const enrolledClasses = await Class.find({ students: studentId });
    const classIds = enrolledClasses.map(c => c._id);

    const activeSessions = await AttendanceSession.find({ classId: { $in: classIds }, status: 'active' })
      .populate('classId', 'name subject subjectCode')
      .populate('faculty', 'name');

    res.json({ success: true, data: activeSessions });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/students/my-attendance ──────────────────────────────────────────
export const getMyAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const Attendance = (await import('../models/Attendance')).default;
    const AttendanceSession = (await import('../models/AttendanceSession')).default;
    const Class = (await import('../models/Class')).default;

    const studentId = req.user?._id;

    // Fetch classes the student is enrolled in
    const enrolledClasses = await Class.find({ students: studentId });
    const classIds = enrolledClasses.map(c => c._id);

    // Fetch all sessions for those classes
    const sessions = await AttendanceSession.find({ classId: { $in: classIds }, status: 'closed' });

    // Initialize summary map
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

    // Fetch student's attendance records
    const records = await Attendance.find({ student: studentId })
      .populate('classId', 'name subject subjectCode')
      .populate({
         path: 'session',
         select: 'date startTime faculty',
         populate: { path: 'faculty', select: 'name' }
      })
      .sort({ createdAt: -1 })
      .limit(100);

    // Tally up present/late marks
    records.forEach((r) => {
      const cid = (r.classId as any)._id ? (r.classId as any)._id.toString() : r.classId.toString();
      if (classSummary[cid] && (r.status === 'present' || r.status === 'late')) {
        classSummary[cid].present++;
      }
    });

    const summary = Object.entries(classSummary).map(([classId, data]) => ({
      classId,
      ...data,
      percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
    }));

    res.json({ success: true, data: { records, summary } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/students/all ────────────────────────────────────────────────────
export const getAllStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { department, semester } = req.query;
    const filter: any = {};
    if (department) filter.department = department;
    if (semester) filter.semester = Number(semester);

    const students = await Student.find(filter)
      .populate('userId', 'name email phone fatherPhone motherPhone avatar isActive')
      .sort({ rollNo: 1 });

    res.json({ success: true, data: students, count: students.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/students/phone-contacts ────────────────────────────────────────
export const updatePhoneContacts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { studentPhone, fatherPhone, motherPhone } = req.body;

    const student = await Student.findOne({ userId: req.user?._id });
    if (!student) {
      res.status(404).json({ success: false, message: 'Student profile not found' });
      return;
    }

    if (studentPhone !== undefined) student.studentPhone = studentPhone || undefined;
    if (fatherPhone !== undefined) student.fatherPhone = fatherPhone || undefined;
    if (motherPhone !== undefined) student.motherPhone = motherPhone || undefined;

    await student.save();
    res.json({ success: true, message: 'Phone contacts updated', data: { studentPhone: student.studentPhone, fatherPhone: student.fatherPhone, motherPhone: student.motherPhone } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
