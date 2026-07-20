import mongoose, { Document } from 'mongoose';
export interface IClass extends Document {
    name: string;
    subject: string;
    subjectCode: string;
    faculty: mongoose.Types.ObjectId;
    department: string;
    semester: number;
    students: mongoose.Types.ObjectId[];
    schedule: {
        day: string;
        startTime: string;
        endTime: string;
    }[];
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IClass, {}, {}, {}, mongoose.Document<unknown, {}, IClass, {}, {}> & IClass & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Class.d.ts.map