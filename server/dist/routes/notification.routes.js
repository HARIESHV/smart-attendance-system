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
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const Notification_1 = __importDefault(require("../models/Notification"));
const notification_service_1 = require("../services/notification.service");
const User_1 = __importDefault(require("../models/User"));
const Attendance_1 = __importDefault(require("../models/Attendance"));
const Class_1 = __importDefault(require("../models/Class"));
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /api/notifications (student - own notifications)
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification_1.default.find({ student: req.user?._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json({ success: true, data: notifications });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /api/notifications/send-sms (faculty - send manual SMS)
router.post('/send-sms', (0, auth_middleware_1.authorize)('faculty'), async (req, res) => {
    try {
        const { studentId, message } = req.body;
        const student = await User_1.default.findById(studentId);
        if (!student?.phone) {
            res.status(400).json({ success: false, message: 'Student phone not found' });
            return;
        }
        await (0, notification_service_1.sendSMS)(student.phone, message, studentId);
        res.json({ success: true, message: 'SMS sent successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
// POST /api/notifications/low-attendance-alert
// Send SMS to students with attendance below threshold
router.post('/low-attendance-alert', (0, auth_middleware_1.authorize)('faculty'), async (req, res) => {
    try {
        const { classId, threshold = 75 } = req.body;
        const cls = await Class_1.default.findOne({ _id: classId, faculty: req.user?._id });
        if (!cls) {
            res.status(404).json({ success: false, message: 'Class not found' });
            return;
        }
        const AttendanceSession = (await Promise.resolve().then(() => __importStar(require('../models/AttendanceSession')))).default;
        const sessions = await AttendanceSession.find({ classId, status: 'closed' });
        const sessionIds = sessions.map((s) => s._id);
        const totalSessions = sessions.length;
        if (totalSessions === 0) {
            res.status(400).json({ success: false, message: 'No completed sessions found' });
            return;
        }
        const recipients = [];
        for (const studentId of cls.students) {
            const student = await User_1.default.findById(studentId).select('name phone');
            if (!student?.phone)
                continue;
            const presentCount = await Attendance_1.default.countDocuments({
                session: { $in: sessionIds },
                student: studentId,
                status: { $in: ['present', 'late'] },
            });
            const percentage = Math.round((presentCount / totalSessions) * 100);
            if (percentage < threshold) {
                const msg = `⚠️ Low Attendance Alert!\nHi ${student.name}, your attendance in ${cls.subject} is ${percentage}% (${presentCount}/${totalSessions} classes). Minimum required: ${threshold}%.\nPlease improve your attendance.\n- Smart Attendance System`;
                recipients.push({ phone: student.phone, message: msg, studentId });
            }
        }
        if (recipients.length === 0) {
            res.json({ success: true, message: 'No students below threshold', data: { sent: 0, failed: 0 } });
            return;
        }
        const result = await (0, notification_service_1.sendBulkSMS)(recipients);
        res.json({ success: true, data: { ...result, total: recipients.length } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=notification.routes.js.map