import mongoose, { Document } from 'mongoose';
export interface IAttendanceSession extends Document {
    classId: mongoose.Types.ObjectId;
    faculty: mongoose.Types.ObjectId;
    date: Date;
    startTime: Date;
    endTime?: Date;
    status: 'active' | 'closed';
    topic?: string;
    totalStudents: number;
    presentCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAttendanceSession, {}, {}, {}, mongoose.Document<unknown, {}, IAttendanceSession, {}, {}> & IAttendanceSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=AttendanceSession.d.ts.map