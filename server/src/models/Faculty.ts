import mongoose, { Document, Schema } from 'mongoose';

export interface IFaculty extends Document {
  userId: mongoose.Types.ObjectId;
  employeeId: string;
  department: string;
  designation: string;
  subjects: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FacultySchema = new Schema<IFaculty>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true },
    designation: { type: String, default: 'Assistant Professor' },
    subjects: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model<IFaculty>('Faculty', FacultySchema);
