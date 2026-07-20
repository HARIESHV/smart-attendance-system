"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const Attendance_1 = __importDefault(require("../models/Attendance"));
const AttendanceSession_1 = __importDefault(require("../models/AttendanceSession"));
const Class_1 = __importDefault(require("../models/Class"));
const Student_1 = __importDefault(require("../models/Student"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)('faculty'));
// GET /api/reports/class/:classId/pdf-data
// Returns data for client-side PDF generation
router.get('/class/:classId', async (req, res) => {
    try {
        const { classId } = req.params;
        const { from, to } = req.query;
        const dateFilter = {};
        if (from)
            dateFilter.$gte = new Date(from);
        if (to)
            dateFilter.$lte = new Date(to);
        const cls = await Class_1.default.findOne({ _id: classId, faculty: req.user?._id }).populate('faculty', 'name');
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        const sessions = await AttendanceSession_1.default.find({
            classId,
            status: 'closed',
            ...(Object.keys(dateFilter).length && { date: dateFilter }),
        }).sort({ date: 1 });
        const sessionIds = sessions.map((s) => s._id);
        // Get all students in the class
        const studentProfiles = await Student_1.default.find({ userId: { $in: cls.students } })
            .populate('userId', 'name email phone')
            .select('rollNo userId');
        // Build attendance matrix
        const matrix = await Promise.all(studentProfiles.map(async (sp) => {
            const records = await Attendance_1.default.find({
                session: { $in: sessionIds },
                student: sp.userId,
            }).select('session status');
            const sessionMap = {};
            records.forEach((r) => {
                sessionMap[r.session.toString()] = r.status;
            });
            const present = records.filter((r) => r.status === 'present' || r.status === 'late').length;
            const percentage = sessions.length > 0 ? Math.round((present / sessions.length) * 100) : 0;
            return {
                studentId: sp.userId._id,
                name: sp.userId.name,
                rollNo: sp.rollNo,
                email: sp.userId.email,
                sessionData: sessionMap,
                present,
                total: sessions.length,
                percentage,
            };
        }));
        res.json({
            success: true,
            data: {
                class: cls,
                sessions: sessions.map((s) => ({ _id: s._id, date: s.date, topic: s.topic })),
                students: matrix,
                generatedAt: new Date(),
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=report.routes.js.map