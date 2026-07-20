import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getFacultyProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const createClass: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFacultyClasses: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateClass: (req: AuthRequest, res: Response) => Promise<void>;
export declare const deleteClass: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addStudentsToClass: (req: AuthRequest, res: Response) => Promise<void>;
export declare const removeStudentFromClass: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getClassStudents: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getFacultyAnalytics: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=faculty.controller.d.ts.map