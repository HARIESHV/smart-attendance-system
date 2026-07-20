import { useEffect, useState } from 'react';
import { studentApi } from '../../api/student.api';
import type { AttendanceRecord } from '../../types';
import { format } from 'date-fns';
import { Loader2, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function StudentAttendanceHistory() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentApi.getMyAttendance()
      .then(res => setRecords(res.data.records))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Attendance History</h1>
        <p className="page-subtitle">Detailed log of all your classes</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Approved By</th>
                <th>Status</th>
                <th>Method</th>
                <th>Confidence</th>
              </tr>
            </thead>
            <tbody>
              {records?.map(record => {
                const sessionDate = (record.session as any)?.date;
                const subject = (record.classId as any)?.subject || 'Unknown Subject';
                const facultyName = (record.session as any)?.faculty?.name || 'System';
                
                return (
                  <tr key={record._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <span className="font-medium">{sessionDate ? format(new Date(sessionDate), 'dd MMM yyyy, hh:mm a') : 'Unknown Date'}</span>
                      </div>
                    </td>
                    <td className="font-semibold">{subject}</td>
                    <td className="text-gray-600 dark:text-gray-400">{facultyName}</td>
                    <td>
                      {record.status === 'present' && <span className="badge-present"><CheckCircle2 size={14} /> Present</span>}
                      {record.status === 'absent' && <span className="badge-absent"><XCircle size={14} /> Absent</span>}
                      {record.status === 'late' && <span className="badge-late"><Clock size={14} /> Late</span>}
                    </td>
                    <td className="capitalize text-sm text-gray-500">
                      {record.method}
                    </td>
                    <td>
                      {record.confidence ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-500 rounded-full" 
                              style={{ width: `${record.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(record.confidence * 100)}%</span>
                        </div>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
              {records.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
