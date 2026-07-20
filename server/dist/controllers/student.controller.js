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
exports.getAllStudents = exports.getMyAttendance = exports.getAllDescriptors = exports.saveFaceDescriptors = exports.getStudentProfile = void 0;
const Student_1 = __importDefault(require("../models/Student"));
// GET /api/students/profile
const getStudentProfile = async (req, res) => {
    try {
        const profile = await Student_1.default.findOne({ userId: req.user?._id });
        if (!profile) {
            res.status(404).json({ success: false, message: 'Student profile not found' });
            return;
        }
        res.json({ success: true, data: { ...req.user?.toObject(), profile } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getStudentProfile = getStudentProfile;
// POST /api/students/face-descriptors
const saveFaceDescriptors = async (req, res) => {
    try {
        const { descriptors, imageUrls } = req.body;
        if (!descriptors || !Array.isArray(descriptors) || descriptors.length === 0) {
            res.status(400).json({ success: false, message: 'Face descriptors are required' });
            return;
        }
        const student = await Student_1.default.findOne({ userId: req.user?._id });
        if (!student) {
            res.status(404).json({ success: false, message: 'Student profile not found' });
            return;
        }
        // Store descriptors with the student's roll number as label
        student.faceDescriptors = [
            {
                label: student.rollNo,
                descriptors,
                imageUrls: imageUrls || [],
            },
        ];
        student.isFaceRegistered = true;
        await student.save();
        res.json({ success: true, message: 'Face registered successfully', data: { isFaceRegistered: true } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.saveFaceDescriptors = saveFaceDescriptors;
// GET /api/students/all-descriptors
// Only faculty can call this to build the FaceMatcher
const getAllDescriptors = async (req, res) => {
    try {
        const students = await Student_1.default.find({ isFaceRegistered: true })
            .populate('userId', 'name email')
            .select('rollNo faceDescriptors userId');
        const descriptorData = students.map((s) => ({
            studentId: s.userId._id,
            name: s.userId.name,
            rollNo: s.rollNo,
            label: s.rollNo,
            descriptors: s.faceDescriptors[0]?.descriptors || [],
        }));
        res.json({ success: true, data: descriptorData });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllDescriptors = getAllDescriptors;
// GET /api/students/my-attendance
const getMyAttendance = async (req, res) => {
    try {
        const Attendance = (await Promise.resolve().then(() => __importStar(require('../models/Attendance')))).default;
        const records = await Attendance.find({ student: req.user?._id })
            .populate('classId', 'name subject subjectCode')
            .populate('session', 'date startTime')
            .sort({ date: -1 })
            .limit(100);
        // Calculate percentage per class
        const classSummary = {};
        records.forEach((r) => {
            const key = r.classId.toString();
            const classData = r.classId;
            if (!classSummary[key]) {
                classSummary[key] = { className: classData.name, subject: classData.subject, total: 0, present: 0 };
            }
            classSummary[key].total++;
            if (r.status === 'present' || r.status === 'late')
                classSummary[key].present++;
        });
        const summary = Object.entries(classSummary).map(([classId, data]) => ({
            classId,
            ...data,
            percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0,
        }));
        res.json({ success: true, data: { records, summary } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMyAttendance = getMyAttendance;
// GET /api/students/all (for faculty - list all students)
const getAllStudents = async (req, res) => {
    try {
        const { department, semester } = req.query;
        const filter = {};
        if (department)
            filter.department = department;
        if (semester)
            filter.semester = Number(semester);
        const students = await Student_1.default.find(filter)
            .populate('userId', 'name email phone avatar isActive')
            .sort({ rollNo: 1 });
        res.json({ success: true, data: students, count: students.length });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getAllStudents = getAllStudents;
//# sourceMappingURL=student.controller.js.map