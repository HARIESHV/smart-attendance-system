import mongoose, { Document } from 'mongoose';
export interface IFaceDescriptor {
    label: string;
    descriptors: number[][];
    imageUrls: string[];
}
export interface IStudent extends Document {
    userId: mongoose.Types.ObjectId;
    rollNo: string;
    department: string;
    course: string;
    semester: number;
    year: number;
    faceDescriptors: IFaceDescriptor[];
    isFaceRegistered: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IStudent, {}, {}, {}, mongoose.Document<unknown, {}, IStudent, {}, {}> & IStudent & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Student.d.ts.map