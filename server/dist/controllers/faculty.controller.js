"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFacultyAnalytics = exports.getClassStudents = exports.removeStudentFromClass = exports.addStudentsToClass = exports.deleteClass = exports.updateClass = exports.getFacultyClasses = exports.createClass = exports.getFacultyProfile = void 0;
const Class_1 = __importDefault(require("../models/Class"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
const Student_1 = __importDefault(require("../models/Student"));
// GET /api/faculty/profile
const getFacultyProfile = async (req, res) => {
    try {
        const profile = await Faculty_1.default.findOne({ userId: req.user?._id });
        res.json({ success: true, data: { ...req.user?.toObject(), profile } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getFacultyProfile = getFacultyProfile;
// POST /api/faculty/classes
const createClass = async (req, res) => {
    try {
        const { name, subject, subjectCode, department, semester, schedule } = req.body;
        const newClass = await Class_1.default.create({
            name,
            subject,
            subjectCode,
            department,
            semester,
            faculty: req.user?._id,
            schedule: schedule || [],
        });
        res.status(201).json({ success: true, data: newClass });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.createClass = createClass;
// GET /api/faculty/classes
const getFacultyClasses = async (req, res) => {
    try {
        const classes = await Class_1.default.find({ faculty: req.user?._id, isActive: true }).sort({ createdAt: -1 });
        res.json({ success: true, data: classes, count: classes.length });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getFacultyClasses = getFacultyClasses;
// PUT /api/faculty/classes/:id
const updateClass = async (req, res) => {
    try {
        const cls = await Class_1.default.findOneAndUpdate({ _id: req.params.id, faculty: req.user?._id }, req.body, { new: true });
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        res.json({ success: true, data: cls });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateClass = updateClass;
// DELETE /api/faculty/classes/:id
const deleteClass = async (req, res) => {
    try {
        const cls = await Class_1.default.findOneAndUpdate({ _id: req.params.id, faculty: req.user?._id }, { isActive: false }, { new: true });
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        res.json({ success: true, message: 'Class deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.deleteClass = deleteClass;
// POST /api/faculty/classes/:id/students
const addStudentsToClass = async (req, res) => {
    try {
        const { studentIds } = req.body;
        const cls = await Class_1.default.findOneAndUpdate({ _id: req.params.id, faculty: req.user?._id }, { $addToSet: { students: { $each: studentIds } } }, { new: true });
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        res.json({ success: true, data: cls });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.addStudentsToClass = addStudentsToClass;
// DELETE /api/faculty/classes/:id/students/:studentId
const removeStudentFromClass = async (req, res) => {
    try {
        const cls = await Class_1.default.findOneAndUpdate({ _id: req.params.id, faculty: req.user?._id }, { $pull: { students: req.params.studentId } }, { new: true });
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        res.json({ success: true, data: cls });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.removeStudentFromClass = removeStudentFromClass;
// GET /api/faculty/classes/:id/students
const getClassStudents = async (req, res) => {
    try {
        const cls = await Class_1.default.findOne({ _id: req.params.id, faculty: req.user?._id }).populate('students', 'name email');
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        const studentDetails = await Student_1.default.find({ userId: { $in: cls.students } })
            .populate('userId', 'name email phone')
            .select('rollNo department semester isFaceRegistered userId');
        res.json({ success: true, data: studentDetails });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getClassStudents = getClassStudents;
// GET /api/faculty/analytics
const getFacultyAnalytics = async (req, res) => {
    try {
        const Attendance = (await Promise.resolve().then(() => __importStar(require('../models/Attendance')))).default;
        const AttendanceSession = (await Promise.resolve().then(() => __importStar(require('../models/AttendanceSession')))).default;
        const classes = await Class_1.default.find({ faculty: req.user?._id, isActive: true });
        const classIds = classes.map((c) => c._id);
        const totalSessions = await AttendanceSession.countDocuments({ faculty: req.user?._id });
        const activeSessions = await AttendanceSession.countDocuments({ faculty: req.user?._id, status: 'active' });
        // Attendance per class
        const classStats = await Promise.all(classes.map(async (cls) => {
            const sessions = await AttendanceSession.find({ classId: cls._id });
            const sessionIds = sessions.map((s) => s._id);
            const totalRecords = await Attendance.countDocuments({ classId: cls._id });
            const presentRecords = await Attendance.countDocuments({ classId: cls._id, status: 'present' });
            return {
                classId: cls._id,
                className: cls.name,
                subject: cls.subject,
                totalSessions: sessions.length,
                totalStudents: cls.students.length,
                avgAttendance: totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0,
            };
        }));
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getFacultyAnalytics = getFacultyAnalytics;
//# sourceMappingURL=faculty.controller.js.map