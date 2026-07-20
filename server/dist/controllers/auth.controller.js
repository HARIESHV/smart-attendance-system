"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.updateProfile = exports.getMe = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const Student_1 = __importDefault(require("../models/Student"));
const Faculty_1 = __importDefault(require("../models/Faculty"));
const signToken = (id) => jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d'),
});
const sendResponse = (res, statusCode, user, token) => {
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            avatar: user.avatar,
        },
    });
};
// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role, phone, rollNo, department, course, semester, year, employeeId, designation } = req.body;
        const existing = await User_1.default.findOne({ email });
        if (existing) {
            res.status(400).json({ success: false, message: 'Email already registered' });
            return;
        }
        const user = await User_1.default.create({ name, email, password, role, phone });
        if (role === 'student') {
            if (!rollNo || !department || !course || !semester) {
                await User_1.default.findByIdAndDelete(user._id);
                res.status(400).json({ success: false, message: 'Student details are required' });
                return;
            }
            await Student_1.default.create({
                userId: user._id,
                rollNo,
                department,
                course,
                semester,
                year: year || new Date().getFullYear(),
            });
        }
        else if (role === 'faculty') {
            if (!department) {
                await User_1.default.findByIdAndDelete(user._id);
                res.status(400).json({ success: false, message: 'Faculty details are required' });
                return;
            }
            // Generate unique employee ID if not provided
            let finalEmployeeId = employeeId;
            if (!finalEmployeeId) {
                const timestamp = Date.now().toString().slice(-8);
                const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
                finalEmployeeId = `FAC${timestamp}${random}`;
            }
            await Faculty_1.default.create({
                userId: user._id,
                employeeId: finalEmployeeId,
                department,
                designation: designation || 'Assistant Professor',
            });
        }
        const token = signToken(user._id.toString());
        sendResponse(res, 201, user, token);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.register = register;
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Email and password are required' });
            return;
        }
        const user = await User_1.default.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
            return;
        }
        if (!user.isActive) {
            res.status(403).json({ success: false, message: 'Account is deactivated' });
            return;
        }
        const token = signToken(user._id.toString());
        sendResponse(res, 200, user, token);
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.login = login;
// GET /api/auth/me
const getMe = async (req, res) => {
    try {
        const user = req.user;
        let profile = null;
        if (user.role === 'student') {
            profile = await Student_1.default.findOne({ userId: user._id });
        }
        else if (user.role === 'faculty') {
            profile = await Faculty_1.default.findOne({ userId: user._id });
        }
        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                phone: user.phone,
                avatar: user.avatar,
                profile,
            },
        });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.getMe = getMe;
// PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;
        const user = await User_1.default.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
        res.json({ success: true, user });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.updateProfile = updateProfile;
// PUT /api/auth/change-password
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findById(req.user._id).select('+password');
        if (!user || !(await user.comparePassword(currentPassword))) {
            res.status(401).json({ success: false, message: 'Current password is incorrect' });
            return;
        }
        user.password = newPassword;
        await user.save();
        res.json({ success: true, message: 'Password changed successfully' });
    }
    catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=auth.controller.js.map