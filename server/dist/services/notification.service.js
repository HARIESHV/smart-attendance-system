"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBulkSMS = exports.sendSMS = void 0;
const twilio_1 = __importDefault(require("twilio"));
const Notification_1 = __importDefault(require("../models/Notification"));
const client = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
/**
 * Send an SMS notification via Twilio and log it to the database.
 */
const sendSMS = async (phone, message, studentId) => {
    const notification = await Notification_1.default.create({
        student: studentId,
        type: 'sms',
        message,
        phone,
        status: 'pending',
    });
    try {
        const result = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone,
        });
        await Notification_1.default.findByIdAndUpdate(notification._id, {
            status: 'sent',
            twilioSid: result.sid,
            sentAt: new Date(),
        });
        console.log(`✅ SMS sent to ${phone}: SID ${result.sid}`);
    }
    catch (err) {
        await Notification_1.default.findByIdAndUpdate(notification._id, {
            status: 'failed',
            error: err.message,
        });
        console.error(`❌ SMS failed to ${phone}: ${err.message}`);
        throw err;
    }
};
exports.sendSMS = sendSMS;
/**
 * Send bulk SMS to multiple students (e.g., low-attendance warning).
 */
const sendBulkSMS = async (recipients) => {
    let sent = 0;
    let failed = 0;
    await Promise.allSettled(recipients.map(async ({ phone, message, studentId }) => {
        try {
            await (0, exports.sendSMS)(phone, message, studentId);
            sent++;
        }
        catch {
            failed++;
        }
    }));
    return { sent, failed };
};
exports.sendBulkSMS = sendBulkSMS;
//# sourceMappingURL=notification.service.js.map