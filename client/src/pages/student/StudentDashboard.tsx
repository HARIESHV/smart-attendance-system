import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { studentApi } from '../../api/student.api';
import type { AttendanceSummary, StudentProfile } from '../../types';
import { Loader2, AlertCircle, Camera, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary[]>([]);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentApi.getDashboard();
      const data = res?.data || {};
      setProfile(data.student?.profile || null);
      setSummary(data.attendance?.summary || []);
      setActiveSessions(data.activeSessions || []);
      setSubjects(data.subjects || []);
      setNotifications(data.notifications || []);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-24 min-h-[50vh]"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{error}</p>
        <button onClick={fetchData} className="btn-primary">Retry</button>
      </div>
    );
  }

  const totalClasses = summary?.length || 0;
  const overallPercentage = totalClasses > 0
    ? summary.reduce((acc, curr) => acc + (curr?.percentage || 0), 0) / totalClasses
    : 0;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name}!</h1>
        <p className="page-subtitle">{profile?.course} - Semester {profile?.semester}</p>
      </div>

      {!profile?.isFaceRegistered && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-amber-800 dark:text-amber-400">Face Registration Required</h3>
            <p className="text-amber-700 dark:text-amber-500 text-sm mt-1">
              You haven't registered your face yet. You won't be able to mark attendance until you do.
            </p>
          </div>
          <Link to="/student/face-registration" className="btn-primary py-2 text-sm whitespace-nowrap">
            Register Now
          </Link>
        </div>
      )}

      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            Live Classes (Join Now)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSessions?.map((session) => (
              <div key={session?._id} className="glass-card p-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10">
                <h3 className="font-bold text-red-900 dark:text-red-300">{(session.classId as any)?.subject}</h3>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">Topic: {session.topic}</p>
                <p className="text-xs text-gray-500 mt-2">Started at {new Date(session.startTime).toLocaleTimeString()}</p>
                <Link to={`/student/live/${session._id}`} className="btn-primary w-full mt-4 flex justify-center gap-2 bg-red-600 hover:bg-red-700 border-none">
                  <Camera size={18} /> Join Attendance
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats grid: 1 col on mobile, 3 col on md+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
            <Calendar size={18} />
            <h3 className="font-medium text-sm uppercase tracking-wider">Enrolled Classes</h3>
          </div>
          <p className="text-3xl font-bold">{totalClasses}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2">
            <CheckCircle size={18} />
            <h3 className="font-medium text-sm uppercase tracking-wider">Overall Attendance</h3>
          </div>
          <p className="text-3xl font-bold flex items-end gap-2">
            {Math.round(overallPercentage)}%
            {overallPercentage >= 75 ? (
              <span className="text-sm font-medium text-emerald-500 mb-1 border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">Good</span>
            ) : (
              <span className="text-sm font-medium text-red-500 mb-1 border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/30 px-2 py-0.5 rounded-full">Low</span>
            )}
          </p>
        </div>
        <div className="stat-card relative overflow-hidden">
           <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-2xl"></div>
           <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mb-2 relative z-10">
            <Camera size={18} />
            <h3 className="font-medium text-sm uppercase tracking-wider">Face Status</h3>
          </div>
          <div className="relative z-10 mt-2">
            {profile?.isFaceRegistered ? (
               <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-sm">
                 <CheckCircle size={16} /> Registered
               </span>
            ): (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                 <Clock size={16} /> Pending
               </span>
            )}
          </div>
        </div>
      </div>

      <h2 className="text-lg font-bold mb-4">Subject Wise Attendance</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {summary?.map(sub => (
          <div key={sub?.classId} className="glass-card p-5">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{sub?.subject}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{sub?.className}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="h-24 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: sub?.present || 0 },
                        { name: 'Absent', value: (sub?.total || 0) - (sub?.present || 0) }
                      ]}
                      innerRadius={25}
                      outerRadius={40}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1">
                <div className="text-2xl font-bold">{sub?.percentage || 0}%</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  <span className="text-emerald-500 font-medium">{sub?.present || 0}</span> / {sub?.total || 0} Classes
                </div>
              </div>
            </div>
          </div>
        ))}
        {(!summary || summary.length === 0) && (
           <div className="col-span-3 text-center p-8 text-gray-500 glass-card">
             No enrolled subjects.
           </div>
        )}
      </div>
    </div>
  );
}
