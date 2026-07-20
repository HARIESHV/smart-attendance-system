import mongoose, { Document } from 'mongoose';
export interface IFaculty extends Document {
    userId: mongoose.Types.ObjectId;
    employeeId: string;
    department: string;
    designation: string;
    subjects: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IFaculty, {}, {}, {}, mongoose.Document<unknown, {}, IFaculty, {}, {}> & IFaculty & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Faculty.d.ts.map