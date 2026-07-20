import mongoose, { Document, Schema } from 'mongoose';

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

const ClassSchema = new Schema<IClass>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true },
    subjectCode: { type: String, required: true, uppercase: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    schedule: [
      {
        day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
        startTime: { type: String },
        endTime: { type: String },
      },
    ],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<IClass>('Class', ClassSchema);
