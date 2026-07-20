import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const startSession: (req: AuthRequest, res: Response) => Promise<void>;
export declare const markAttendance: (req: AuthRequest, res: Response) => Promise<void>;
export declare const closeSession: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getSession: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFacultySessions: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getClassAttendanceReport: (req: AuthRequest, res: Response) => Promise<void>;
export declare const manualCorrect: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=attendance.controller.d.ts.map