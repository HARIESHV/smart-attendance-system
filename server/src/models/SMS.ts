import mongoose, { Document, Schema } from 'mongoose';

export interface ISMS extends Document {
  // Who sent the SMS (faculty)
  faculty: mongoose.Types.ObjectId;
  // Target student
  student: mongoose.Types.ObjectId;
  // Which contact was targeted
  recipientType: 'student' | 'father' | 'mother';
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  twilioSid?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
  nextRetryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SMSSchema = new Schema<ISMS>(
  {
    faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipientType: { type: String, enum: ['student', 'father', 'mother'], required: true },
    phone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['pending', 'sent', 'delivered', 'failed'], default: 'pending' },
    twilioSid: { type: String },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    error: { type: String },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 3 },
    nextRetryAt: { type: Date },
  },
  { timestamps: true }
);

// Indexes for fast queries
SMSSchema.index({ faculty: 1, createdAt: -1 });
SMSSchema.index({ student: 1, createdAt: -1 });
SMSSchema.index({ status: 1, nextRetryAt: 1 });

export default mongoose.model<ISMS>('SMS', SMSSchema);
