/**
 * Send an SMS notification via Twilio and log it to the database.
 */
export declare const sendSMS: (phone: string, message: string, studentId: any) => Promise<void>;
/**
 * Send bulk SMS to multiple students (e.g., low-attendance warning).
 */
export declare const sendBulkSMS: (recipients: Array<{
    phone: string;
    message: string;
    studentId: any;
}>) => Promise<{
    sent: number;
    failed: number;
}>;
//# sourceMappingURL=notification.service.d.ts.map