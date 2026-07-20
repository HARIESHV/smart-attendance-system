import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getStudentProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const saveFaceDescriptors: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllDescriptors: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getMyAttendance: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllStudents: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=student.controller.d.ts.map