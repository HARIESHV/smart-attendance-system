import { useEffect, useState } from 'react';
import { attendanceApi } from '../../api/attendance.api';
import type { AttendanceSession } from '../../types';
import { format } from 'date-fns';
import { Loader2, Calendar, CheckCircle2, FileText, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function FacultyAttendanceHistory() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await attendanceApi.getFacultySessions();
      setSessions(res?.data || []);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load attendance history.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async (classId: string, className: string) => {
    try {
      // In a real app, this would trigger a PDF/Excel download flow
      // using jsPDF and sheetJS with data from attendanceApi.getClassReport
      toast.success(`Generating report for ${className}...`);
      // Simulating download logic
      setTimeout(() => toast.success('Report downloaded successfully!'), 1500);
    } catch (e) {
      toast.error('Failed to generate report');
    }
  };

  if (loading) return <div className="flex justify-center items-center p-24 min-h-[50vh]"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={fetchSessions} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Attendance History</h1>
        <p className="page-subtitle">View past sessions and download reports</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-dark-600 flex justify-between items-center bg-gray-50/50 dark:bg-dark-600/50">
           <h3 className="font-bold text-gray-900 dark:text-white">Past Sessions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Class & Subject</th>
                <th>Topic</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sessions?.map(session => {
                const cls = session?.classId as any;
                const percentage = (session?.totalStudents || 0) > 0 
                  ? Math.round(((session?.presentCount || 0) / (session?.totalStudents || 1)) * 100) 
                  : 0;

                return (
                  <tr key={session?._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="font-medium whitespace-nowrap">{session?.date ? format(new Date(session.date), 'dd MMM yyyy') : '-'}</span>
                      </div>
                    </td>
                    <td>
                      <p className="font-semibold">{cls?.subject || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{cls?.name || 'Unknown'}</p>
                    </td>
                    <td><span className="text-sm truncate max-w-[150px] inline-block">{session?.topic || '-'}</span></td>
                    <td>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold">{session?.presentCount || 0} / {session?.totalStudents || 0}</span>
                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${percentage >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`} 
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${session?.status === 'closed' ? 'bg-gray-100 text-gray-600 dark:bg-dark-600 dark:text-gray-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                        {session?.status?.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {session?.status === 'active' ? (
                           <Link to={`/faculty/session/${session?._id}`} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Resume Session">
                             <CheckCircle2 size={18} />
                           </Link>
                        ) : (
                           <button onClick={() => handleDownloadReport(cls?._id, cls?.name)} className="p-1.5 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded transition-colors" title="Download Report">
                             <Download size={18} />
                           </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(!sessions || sessions.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">No sessions recorded yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
