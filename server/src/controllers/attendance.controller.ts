import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import AttendanceSession from '../models/AttendanceSession';
import Attendance from '../models/Attendance';
import Class from '../models/Class';
import Student from '../models/Student';

import { emitToSession } from '../config/socket';
import { Server } from 'socket.io';

// ─── POST /api/attendance/sessions/start ────────────────────────────────────
export const startSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, topic } = req.body;

    const cls = await Class.findOne({ _id: classId, faculty: req.user?._id });
    if (!cls) {
      res.status(404).json({ success: false, message: 'Class not found' });
      return;
    }

    // ── Auto-close stale active sessions (> 4 hours old) globally ──
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
    await AttendanceSession.updateMany(
      { status: 'active', startTime: { $lt: fourHoursAgo } },
      { $set: { status: 'closed', endTime: new Date() } }
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existingSession = await AttendanceSession.findOne({
      classId,
      status: 'active',
      date: { $gte: today },
    });

    if (existingSession) {
      res.status(400).json({
        success: false,
        message: 'This class already has an active attendance session. Please end the current session before starting another.',
        data: existingSession,
      });
      return;
    }

    const session = await AttendanceSession.create({
      classId,
      faculty: req.user?._id,
      topic,
      totalStudents: cls.students.length,
      status: 'active',
    });

    res.status(201).json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── POST /api/attendance/sessions/:sessionId/request ───────────────────────
export const requestAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { confidence } = req.body;
    const { sessionId } = req.params;
    const studentId = req.user?._id;

    if (!studentId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const session = await AttendanceSession.findById(sessionId);
    if (!session || session.status === 'closed') {
      res.status(400).json({ success: false, message: 'Session not found or already closed' });
      return;
    }

    // Check if already approved/present
    const existingAttendance = await Attendance.findOne({ session: sessionId, student: studentId });
    if (existingAttendance && (existingAttendance.status === 'present' || existingAttendance.status === 'late')) {
      res.status(400).json({ success: false, message: 'Attendance already marked present' });
      return;
    }

    const PendingAttendance = (await import('../models/PendingAttendance')).default;

    // Create or update pending request
    const pendingRequest = await PendingAttendance.findOneAndUpdate(
      { session: sessionId, student: studentId },
      { classId: session.classId, status: 'pending', method: 'face', confidence, requestedAt: new Date() },
      { new: true, upsert: true }
    ).populate('student', 'name email rollNo');

    // Emit real-time request to faculty
    const io: Server = (req as any).io;
    if (io) {
      emitToSession(io, sessionId, 'attendance:requested', {
        requestId: pendingRequest._id,
        studentId,
        studentName: (pendingRequest.student as any)?.name,
        rollNo: (pendingRequest.student as any)?.rollNo,
        confidence,
        requestedAt: pendingRequest.requestedAt,
      });
    }

    res.status(201).json({ success: true, message: 'Attendance request sent to faculty', data: pendingRequest });
  } catch (err: any) {
    if (err.code === 11000) {
      res.status(400).json({ success: false, message: 'Request already pending' });
      return;
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/attendance/sessions/:sessionId/approve/:requestId ─────────────
export const approveAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, requestId } = req.params;

    const session = await AttendanceSession.findById(sessionId);
    if (!session || session.status === 'closed' || session.faculty.toString() !== req.user?._id?.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized or session closed' });
      return;
    }

    const PendingAttendance = (await import('../models/PendingAttendance')).default;
    const pendingRequest = await PendingAttendance.findOne({ _id: requestId, session: sessionId });
    
    if (!pendingRequest || pendingRequest.status !== 'pending') {
      res.status(404).json({ success: false, message: 'Pending request not found or already processed' });
      return;
    }

    pendingRequest.status = 'approved';
    pendingRequest.resolvedAt = new Date();
    await pendingRequest.save();

    // Create formal attendance record
    const record = await Attendance.findOneAndUpdate(
      { session: sessionId, student: pendingRequest.student },
      { status: 'present', markedAt: new Date(), method: 'face', confidence: pendingRequest.confidence },
      { new: true, upsert: true }
    ).populate('student', 'name email phone');

    // Update session present count
    const presentCount = await Attendance.countDocuments({ session: sessionId, status: { $in: ['present', 'late'] } });
    await AttendanceSession.findByIdAndUpdate(sessionId, { presentCount });

    // Emit real-time approval
    const io: Server = (req as any).io;
    if (io) {
      emitToSession(io, sessionId, 'attendance:approved', {
        requestId,
        studentId: pendingRequest.student,
        status: 'present',
      });
    }

    res.json({ success: true, message: 'Attendance approved', data: record, presentCount });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── PUT /api/attendance/sessions/:sessionId/reject/:requestId ──────────────
export const rejectAttendance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId, requestId } = req.params;

    const session = await AttendanceSession.findById(sessionId);
    if (!session || session.status === 'closed' || session.faculty.toString() !== req.user?._id?.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized or session closed' });
      return;
    }

    const PendingAttendance = (await import('../models/PendingAttendance')).default;
    const pendingRequest = await PendingAttendance.findOne({ _id: requestId, session: sessionId });
    
    if (!pendingRequest || pendingRequest.status !== 'pending') {
      res.status(404).json({ success: false, message: 'Pending request not found or already processed' });
      return;
    }

    pendingRequest.status = 'rejected';
    pendingRequest.resolvedAt = new Date();
    await pendingRequest.save();

    const io: Server = (req as any).io;
    if (io) {
      emitToSession(io, sessionId, 'attendance:rejected', {
        requestId,
        studentId: pendingRequest.student,
      });
    }

    res.json({ success: true, message: 'Attendance rejected' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ─── PUT /api/attendance/sessions/:sessionId/close ───────────────────────────
export const closeSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await AttendanceSession.findOneAndUpdate(
      { _id: req.params.sessionId, faculty: req.user?._id },
      { status: 'closed', endTime: new Date() },
      { new: true }
    );
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    const io: Server = (req as any).io;
    if (io) emitToSession(io, req.params.sessionId, 'session:closed', { sessionId: req.params.sessionId });

    res.json({ success: true, data: session });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/attendance/sessions/:sessionId ─────────────────────────────────
export const getSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const session = await AttendanceSession.findById(req.params.sessionId)
      .populate('classId', 'name subject subjectCode students')
      .populate('faculty', 'name email');

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    const attendanceRecords = await Attendance.find({ session: session._id })
      .populate('student', 'name email phone');

    const PendingAttendance = (await import('../models/PendingAttendance')).default;
    const pendingRequests = await PendingAttendance.find({ session: session._id, status: 'pending' })
      .populate('student', 'name email');

    res.json({ success: true, data: { session, attendanceRecords, pendingRequests } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/attendance/sessions ────────────────────────────────────────────
export const getFacultySessions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId, status, limit = 20 } = req.query;
    const filter: any = { faculty: req.user?._id };
    if (classId) filter.classId = classId;
    if (status) filter.status = status;

    const sessions = await AttendanceSession.find(filter)
      .populate('classId', 'name subject subjectCode')
      .sort({ date: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: sessions, count: sessions.length });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET /api/attendance/class/:classId/report ───────────────────────────────
export const getClassAttendanceReport = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { classId } = req.params;
    const { from, to } = req.query;

    const dateFilter: any = {};
    if (from) dateFilter.$gte = new Date(from as string);
    if (to) dateFilter.$lte = new Date(to as string);

    const sessions = await AttendanceSession.find({
      classId,
      ...(Object.keys(dateFilter).length && { date: dateFilter }),
    }).sort({ date: 1 });

    const sessionIds = sessions.map((s) => s._id);
    const records = await Attendance.find({ session: { $in: sessionIds } })
      .populate('student', 'name email')
      .populate('session', 'date topic');

    const studentMap: Record<string, { name: string; email: string; sessions: Record<string, string> }> = {};
    records.forEach((r) => {
      const sid = r.student._id.toString();
      const student = r.student as any;
      if (!studentMap[sid]) {
        studentMap[sid] = { name: student.name, email: student.email, sessions: {} };
      }
      studentMap[sid].sessions[(r.session as any)._id.toString()] = r.status;
    });

    res.json({
      success: true,
      data: {
        classId,
        sessions,
        students: Object.entries(studentMap).map(([id, data]) => ({ studentId: id, ...data })),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// End of attendance.controller.ts
