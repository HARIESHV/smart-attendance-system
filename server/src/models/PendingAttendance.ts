import mongoose, { Document, Schema } from 'mongoose';

export interface IPendingAttendance extends Document {
  session: mongoose.Types.ObjectId;
  classId: mongoose.Types.ObjectId;
  student: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  method: 'face';
  confidence: number;
  requestedAt: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PendingAttendanceSchema = new Schema<IPendingAttendance>(
  {
    session: { type: Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    method: { type: String, enum: ['face'], default: 'face' },
    confidence: { type: Number, min: 0, max: 1, required: true },
    requestedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// Prevent multiple pending requests for the same student in the same session
PendingAttendanceSchema.index({ session: 1, student: 1 }, { unique: true });

export default mongoose.model<IPendingAttendance>('PendingAttendance', PendingAttendanceSchema);
