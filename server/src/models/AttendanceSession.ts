import mongoose, { Document, Schema } from 'mongoose';

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

const AttendanceSessionSchema = new Schema<IAttendanceSession>(
  {
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, default: Date.now },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    topic: { type: String, trim: true },
    totalStudents: { type: Number, default: 0 },
    presentCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model<IAttendanceSession>('AttendanceSession', AttendanceSessionSchema);
