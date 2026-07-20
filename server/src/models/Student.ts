import mongoose, { Document, Schema } from 'mongoose';

export interface IFaceDescriptor {
  label: string;
  descriptors: number[][];
  imageUrls: string[];
}

export interface IDailyDescriptor {
  date: string;          // YYYY-MM-DD
  descriptors: number[][];
  registeredAt: Date;
}

export interface IStudent extends Document {
  userId: mongoose.Types.ObjectId;
  rollNo: string;
  department: string;
  course: string;
  semester: number;
  year: number;
  // Permanent face descriptors (for initial registration)
  faceDescriptors: IFaceDescriptor[];
  isFaceRegistered: boolean;
  // Daily descriptors — students re-register each day (anti-spoofing)
  dailyDescriptors: IDailyDescriptor[];
  // Phone contacts
  studentPhone?: string;
  fatherPhone?: string;
  motherPhone?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FaceDescriptorSchema = new Schema<IFaceDescriptor>({
  label: { type: String, required: true },
  descriptors: { type: [[Number]], required: true },
  imageUrls: [{ type: String }],
});

const DailyDescriptorSchema = new Schema<IDailyDescriptor>({
  date: { type: String, required: true },        // e.g. "2024-01-20"
  descriptors: { type: [[Number]], required: true },
  registeredAt: { type: Date, default: Date.now },
});

const StudentSchema = new Schema<IStudent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
    department: { type: String, required: true },
    course: { type: String, required: true },
    semester: { type: Number, required: true, min: 1, max: 8 },
    year: { type: Number, required: true },
    faceDescriptors: [FaceDescriptorSchema],
    isFaceRegistered: { type: Boolean, default: false },
    dailyDescriptors: [DailyDescriptorSchema],
    studentPhone: { type: String, trim: true },
    fatherPhone: { type: String, trim: true },
    motherPhone: { type: String, trim: true },
  },
  { timestamps: true }
);

// Index on dailyDescriptors.date for fast daily lookups
StudentSchema.index({ 'dailyDescriptors.date': 1 });

export default mongoose.model<IStudent>('Student', StudentSchema);
