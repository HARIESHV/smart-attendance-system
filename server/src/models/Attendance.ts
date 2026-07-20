import mongoose, { Document, Schema } from 'mongoose';

export interface IAttendance extends Document {
  session: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: 'present' | 'absent' | 'late';
  markedAt?: Date;
  method: 'face';
  confidence?: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendance>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'absent' },
    markedAt: { type: Date },
    method: { type: String, enum: ['face'], default: 'face' },
    confidence: { type: Number, min: 0, max: 1 },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Composite unique index to prevent duplicate attendance
AttendanceSchema.index({ session: 1, student: 1 }, { unique: true });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
