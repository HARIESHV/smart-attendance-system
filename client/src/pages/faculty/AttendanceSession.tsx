import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { attendanceApi } from '../../api/attendance.api';
import type { AttendanceSession as ISession, AttendanceRecord } from '../../types';
import toast from 'react-hot-toast';
import { Loader2, StopCircle, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AttendanceSession() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  const [session, setSession] = useState<ISession | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    });
    setSocket(newSocket);
    newSocket.emit('join:session', sessionId);

    newSocket.on('attendance:requested', (data) => {
      setPendingRequests(prev => {
        // Prevent duplicates in UI
        if (prev.some(r => r._id === data.requestId)) return prev;
        return [{
          _id: data.requestId,
          student: { _id: data.studentId, name: data.studentName, rollNo: data.rollNo },
          confidence: data.confidence,
          requestedAt: data.requestedAt
        }, ...prev];
      });
      toast(`New attendance request from ${data.studentName}`, { icon: '🔔' });
    });

    const init = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await attendanceApi.getSession(sessionId);
        setSession(res?.data?.session || null);
        setRecords(res?.data?.attendanceRecords || []);
        setPendingRequests((res?.data as any)?.pendingRequests || []);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to load session');
        toast.error('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    init();

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId, navigate]);

  const handleApprove = async (requestId: string) => {
    if (!sessionId) return;
    try {
      const res = await attendanceApi.approveAttendance(sessionId, requestId);
      toast.success('Attendance approved');
      
      // Remove from pending
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
      
      // Update roster
      const newRecord = res.data;
      setRecords(prev => {
        const exists = prev.some(r => r.student === newRecord.student || (r.student as any)?._id === newRecord.student);
        if (exists) {
          return prev.map(r => 
            (r.student === newRecord.student || (r.student as any)?._id === newRecord.student) 
              ? { ...r, status: 'present', confidence: newRecord.confidence } 
              : r
          );
        }
        return [...prev, newRecord];
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  const handleReject = async (requestId: string) => {
    if (!sessionId) return;
    try {
      await attendanceApi.rejectAttendance(sessionId, requestId);
      toast.success('Attendance rejected');
      setPendingRequests(prev => prev.filter(r => r._id !== requestId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  const handleEndSession = async () => {
    if (!sessionId) return;
    try {
      await attendanceApi.closeSession(sessionId);
      toast.success('Session closed');
      navigate('/faculty/classes');
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-24 min-h-[50vh]">
        <Loader2 className="animate-spin text-primary-500" size={40} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button onClick={() => navigate('/faculty/classes')} className="btn-primary">Back to Classes</button>
      </div>
    );
  }

  const presentCount = records?.filter(r => r?.status === 'present' || r?.status === 'late')?.length || 0;

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div>
          <h1 className="page-title text-xl flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            Live Session
          </h1>
          <p className="page-subtitle">
            {(session?.classId as any)?.subject} • {session?.topic}
          </p>
        </div>
        <button onClick={handleEndSession} className="btn-danger flex items-center gap-2">
          <StopCircle size={18} /> End Session
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0 pb-6">
        
        {/* ── Left: Pending Requests ── */}
        <div className="glass-card flex flex-col overflow-hidden border-amber-200/50 dark:border-amber-900/30">
          <div className="p-4 border-b border-gray-200 dark:border-dark-600 bg-amber-50/50 dark:bg-amber-900/10 shrink-0 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Clock className="text-amber-500" size={20} />
              <h3 className="font-bold text-amber-900 dark:text-amber-300">Pending Approvals</h3>
            </div>
            <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-xs font-bold">
              {pendingRequests.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30 dark:bg-dark-800/30">
            {pendingRequests?.map(req => (
              <div key={req?._id} className="p-3 bg-white dark:bg-dark-700 rounded-xl border border-gray-100 dark:border-dark-600 shadow-sm flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{req?.student?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{req?.student?.rollNo}</p>
                  <p className="text-xs text-primary-500 mt-1 font-medium">Score: {Math.round((req?.confidence || 0) * 100)}%</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleApprove(req?._id)} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors" title="Approve">
                    <CheckCircle size={20} />
                  </button>
                  <button onClick={() => handleReject(req?._id)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Reject">
                    <XCircle size={20} />
                  </button>
                </div>
              </div>
            ))}
            {(!pendingRequests || pendingRequests.length === 0) && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Users size={48} className="mb-3 opacity-20" />
                <p>No pending requests</p>
                <p className="text-xs mt-1">Students will appear here when they scan their faces.</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Roster ── */}
        <div className="glass-card flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-dark-600 bg-gray-50/50 dark:bg-dark-600/50 shrink-0">
            <h3 className="font-bold">Class Roster</h3>
            <p className="text-xs text-gray-500 mt-1">
              {presentCount} present · {(session?.totalStudents || 0) - presentCount} absent
            </p>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {records?.map(record => {
              const student = record?.student as any;
              const isPresent = record?.status === 'present' || record?.status === 'late';

              return (
                <div
                  key={record?._id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isPresent
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-900/20'
                      : 'border-gray-100 bg-white dark:border-dark-600 dark:bg-dark-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                      isPresent
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400'
                        : 'bg-gray-100 text-gray-500 dark:bg-dark-600 dark:text-gray-400'
                    }`}>
                      {student?.name?.charAt(0) ?? '?'}
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isPresent ? 'text-emerald-900 dark:text-emerald-300' : 'text-gray-900 dark:text-white'}`}>
                        {student?.name}
                      </p>
                      <p className="text-xs text-gray-500">{student?.rollNo || student?.email}</p>
                    </div>
                  </div>
                  {isPresent ? (
                    <div className="flex flex-col items-end gap-1">
                      <CheckCircle size={18} className="text-emerald-500" />
                      {record.confidence && (
                        <span className="text-xs text-emerald-500 font-medium">
                          {Math.round(record.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-medium text-gray-400 bg-gray-100 dark:bg-dark-600 px-2 py-1 rounded">
                      Absent
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
