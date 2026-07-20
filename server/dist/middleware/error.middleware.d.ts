import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    statusCode?: number;
    status?: string;
}
export declare const errorHandler: (err: AppError, _req: Request, res: Response, _next: NextFunction) => void;
export declare const createError: (message: string, statusCode: number) => AppError;
//# sourceMappingURL=error.middleware.d.ts.map