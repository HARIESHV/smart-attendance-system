"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualCorrect = exports.getClassAttendanceReport = exports.getFacultySessions = exports.getSession = exports.closeSession = exports.markAttendance = exports.startSession = void 0;
const AttendanceSession_1 = __importDefault(require("../models/AttendanceSession"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Class_1 = __importDefault(require("../models/Class"));
const notification_service_1 = require("../services/notification.service");
const socket_1 = require("../config/socket");
// POST /api/attendance/sessions/start
const startSession = async (req, res) => {
    try {
        const { classId, topic } = req.body;
        const cls = await Class_1.default.findOne({ _id: classId, faculty: req.user?._id });
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        // Check for an already active session for this class today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingSession = await AttendanceSession_1.default.findOne({
            classId,
            faculty: req.user?._id,
            status: 'active',
            date: { $gte: today },
        });
        if (existingSession) {
            res.status(400).json({ success: false, message: 'A session is already active for this class today', data: existingSession });
            return;
        }
        // Create session
        const session = await AttendanceSession_1.default.create({
            classId,
            faculty: req.user?._id,
            topic,
            totalStudents: cls.students.length,
        });
        // Pre-populate absent records for all enrolled students
        if (cls.students.length > 0) {
            const absentRecords = cls.students.map((studentId) => ({
                session: session._id,
                classId,
                student: studentId,
                status: 'absent',
                date: new Date(),
            }));
            await Attendance_1.default.insertMany(absentRecords, { ordered: false }).catch(() => { });
        }
        res.status(201).json({ success: true, data: session });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.startSession = startSession;
// POST /api/attendance/sessions/:sessionId/mark
const markAttendance = async (req, res) => {
    try {
        const { studentId, status = 'present', confidence, method = 'face' } = req.body;
        const { sessionId } = req.params;
        const session = await AttendanceSession_1.default.findById(sessionId);
        if (!session || session.status === 'closed') {
            res.status(400).json({ success: false, message: 'Session not found or already closed' });
            return;
        }
        const record = await Attendance_1.default.findOneAndUpdate({ session: sessionId, student: studentId }, { status, markedAt: new Date(), method, confidence }, { new: true, upsert: true }).populate('student', 'name email phone');
        // Update session count
        const presentCount = await Attendance_1.default.countDocuments({ session: sessionId, status: { $in: ['present', 'late'] } });
        await AttendanceSession_1.default.findByIdAndUpdate(sessionId, { presentCount });
        // Emit real-time update to all clients in this session room
        const io = req.io;
        if (io) {
            (0, socket_1.emitToSession)(io, sessionId, 'attendance:marked', {
                studentId,
                studentName: record?.student?.name,
                status,
                confidence,
                markedAt: record?.markedAt,
                presentCount,
            });
        }
        // Send SMS notification to student
        const student = record?.student;
        if (student?.phone && status === 'present') {
            const cls = await Class_1.default.findById(session.classId);
            const msg = `📚 Attendance Marked!\nHi ${student.name}, your attendance has been marked PRESENT for ${cls?.subject} on ${new Date().toLocaleDateString('en-IN')}.\n- Smart Attendance System`;
            (0, notification_service_1.sendSMS)(student.phone, msg, student._id).catch(console.error);
        }
        res.json({ success: true, data: record, presentCount });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.markAttendance = markAttendance;
// PUT /api/attendance/sessions/:sessionId/close
const closeSession = async (req, res) => {
    try {
        const session = await AttendanceSession_1.default.findOneAndUpdate({ _id: req.params.sessionId, faculty: req.user?._id }, { status: 'closed', endTime: new Date() }, { new: true });
        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }
        // Emit session closed event
        const io = req.io;
        if (io)
            (0, socket_1.emitToSession)(io, req.params.sessionId, 'session:closed', { sessionId: req.params.sessionId });
        res.json({ success: true, data: session });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.closeSession = closeSession;
// GET /api/attendance/sessions/:sessionId
const getSession = async (req, res) => {
    try {
        const session = await AttendanceSession_1.default.findById(req.params.sessionId)
            .populate('classId', 'name subject subjectCode students')
            .populate('faculty', 'name email');
        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }
        const attendanceRecords = await Attendance_1.default.find({ session: session._id })
            .populate('student', 'name email')
            .populate({
            path: 'student',
            populate: { path: 'student', model: 'Student', localField: '_id', foreignField: 'userId', select: 'rollNo' },
        });
        res.json({ success: true, data: { session, attendanceRecords } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getSession = getSession;
// GET /api/attendance/sessions (faculty - list sessions)
const getFacultySessions = async (req, res) => {
    try {
        const { classId, status, limit = 20 } = req.query;
        const filter = { faculty: req.user?._id };
        if (classId)
            filter.classId = classId;
        if (status)
            filter.status = status;
        const sessions = await AttendanceSession_1.default.find(filter)
            .populate('classId', 'name subject subjectCode')
            .sort({ date: -1 })
            .limit(Number(limit));
        res.json({ success: true, data: sessions, count: sessions.length });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getFacultySessions = getFacultySessions;
// GET /api/attendance/class/:classId/report
const getClassAttendanceReport = async (req, res) => {
    try {
        const { classId } = req.params;
        const { from, to } = req.query;
        const dateFilter = {};
        if (from)
            dateFilter.$gte = new Date(from);
        if (to)
            dateFilter.$lte = new Date(to);
        const sessions = await AttendanceSession_1.default.find({
            classId,
            ...(Object.keys(dateFilter).length && { date: dateFilter }),
        }).sort({ date: 1 });
        const sessionIds = sessions.map((s) => s._id);
        const records = await Attendance_1.default.find({ session: { $in: sessionIds } })
            .populate('student', 'name email')
            .populate('session', 'date topic');
        // Build pivot table: student → session → status
        const studentMap = {};
        records.forEach((r) => {
            const sid = r.student._id.toString();
            const student = r.student;
            if (!studentMap[sid]) {
                studentMap[sid] = { name: student.name, email: student.email, sessions: {} };
            }
            studentMap[sid].sessions[r.session._id.toString()] = r.status;
        });
        res.json({
            success: true,
            data: {
                classId,
                sessions,
                students: Object.entries(studentMap).map(([id, data]) => ({ studentId: id, ...data })),
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getClassAttendanceReport = getClassAttendanceReport;
// PUT /api/attendance/:id/manual-correct
const manualCorrect = async (req, res) => {
    try {
        const { status } = req.body;
        const record = await Attendance_1.default.findByIdAndUpdate(req.params.id, { status, method: 'manual', markedAt: new Date() }, { new: true });
        if (!record) {
            res.status(404).json({ success: false, message: 'Attendance record not found' });
            return;
        }
        res.json({ success: true, data: record });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.manualCorrect = manualCorrect;
//# sourceMappingURL=attendance.controller.js.map