import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Student from '../models/Student';
import Faculty from '../models/Faculty';

const signToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });

const sendResponse = (res: Response, statusCode: number, user: any, token: string) => {
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
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, phone, rollNo, department, course, semester, year, employeeId, designation } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email already registered' });
      return;
    }

    const user = await User.create({ name, email, password, role, phone });

    if (role === 'student') {
      if (!rollNo || !department || !course || !semester) {
        await User.findByIdAndDelete(user._id);
        res.status(400).json({ success: false, message: 'Student details are required' });
        return;
      }
      await Student.create({
        userId: user._id,
        rollNo,
        department,
        course,
        semester,
        year: year || new Date().getFullYear(),
      });
    } else if (role === 'faculty') {
      if (!department) {
        await User.findByIdAndDelete(user._id);
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
      
      await Faculty.create({
        userId: user._id,
        employeeId: finalEmployeeId,
        department,
        designation: designation || 'Assistant Professor',
      });
    }

    const token = signToken(user._id.toString());
    sendResponse(res, 201, user, token);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
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
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'student') {
      profile = await Student.findOne({ userId: user._id });
    } else if (user.role === 'faculty') {
      profile = await Faculty.findOne({ userId: user._id });
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
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/update-profile
export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { name, phone } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone }, { new: true });
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/auth/change-password
export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      res.status(401).json({ success: false, message: 'Current password is incorrect' });
      return;
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
