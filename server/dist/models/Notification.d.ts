import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    student: mongoose.Types.ObjectId;
    type: 'sms';
    message: string;
    phone: string;
    status: 'pending' | 'sent' | 'failed';
    twilioSid?: string;
    sentAt?: Date;
    error?: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, {}> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Notification.d.ts.map