import mongoose, { Document } from 'mongoose';
export interface IAttendance extends Document {
    session: mongoose.Types.ObjectId;
    classId: mongoose.Types.ObjectId;
    student: mongoose.Types.ObjectId;
    status: 'present' | 'absent' | 'late';
    markedAt?: Date;
    method: 'face' | 'manual';
    confidence?: number;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IAttendance, {}, {}, {}, mongoose.Document<unknown, {}, IAttendance, {}, {}> & IAttendance & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Attendance.d.ts.map