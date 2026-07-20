import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { facultyApi } from '../../api/faculty.api';
import type { FacultyAnalytics } from '../../types';
import { Loader2, Users, BookOpen, Clock, Activity, AlertCircle, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function FacultyDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<FacultyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchAnalytics = () => {
    setLoading(true);
    setError(null);
    facultyApi.getAnalytics()
      .then(res => setStats(res.data))
      .catch(e => {
        console.error(e);
        setError(e.response?.data?.message || 'Failed to load dashboard data. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <div className="flex justify-center items-center p-24 min-h-[50vh]"><Loader2 className="animate-spin text-primary-500" size={40} /></div>;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Unable to Load Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{error}</p>
        <button onClick={fetchAnalytics} className="btn-primary">Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Faculty Dashboard</h1>
        <p className="page-subtitle">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Total Classes</h3>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500"><BookOpen size={20} /></div>
          </div>
          <p className="text-3xl font-bold">{stats?.totalClasses || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Sessions Conducted</h3>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500"><Clock size={20} /></div>
          </div>
          <p className="text-3xl font-bold">{stats?.totalSessions || 0}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-sm text-gray-500 uppercase tracking-wider">Active Sessions</h3>
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500"><Activity size={20} /></div>
          </div>
          <p className="text-3xl font-bold">{stats?.activeSessions || 0}</p>
        </div>
        <div className="stat-card border border-primary-200 dark:border-primary-900/50 bg-primary-50/50 dark:bg-primary-900/10">
          <h3 className="font-semibold text-primary-700 dark:text-primary-400 mb-2">Quick Actions</h3>
          <div className="space-y-2 mt-auto">
            <button 
              onClick={() => navigate('/faculty/classes')}
              className="btn-primary py-2 text-sm w-full block text-center bg-blue-600 hover:bg-blue-700"
            >
              📚 My Classes
            </button>
            <button 
              onClick={() => navigate('/faculty/analytics')}
              className="btn-primary py-2 text-sm w-full block text-center bg-violet-600 hover:bg-violet-700"
            >
              📊 Analytics
            </button>
            <button 
              onClick={() => navigate('/faculty/attendance')}
              className="btn-primary py-2 text-sm w-full block text-center bg-emerald-600 hover:bg-emerald-700"
            >
              📋 Attendance
            </button>
            {stats?.activeSessions > 0 && (
              <button 
                onClick={() => navigate('/faculty/classes')}
                className="btn-primary py-2 text-sm w-full block text-center bg-red-600 hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <Play size={16} /> Resume Class
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-6">
          <h3 className="font-bold text-lg mb-6">Recent Attendance Trend (7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.recentTrend || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="_id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#374151', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="present" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPresent)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-lg mb-4">Class Overview</h3>
          <div className="space-y-4">
            {stats?.classStats?.map(cls => (
              <div key={cls?.classId} className="p-4 rounded-xl border border-gray-100 dark:border-dark-500 bg-gray-50/50 dark:bg-dark-600/50 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-gray-900 dark:text-white line-clamp-1">{cls?.subject}</h4>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${(cls?.avgAttendance || 0) >= 75 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {cls?.avgAttendance || 0}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span className="flex items-center gap-1"><Users size={14} /> {cls?.totalStudents || 0}</span>
                  <span>{cls?.totalSessions || 0} Sessions</span>
                </div>
              </div>
            ))}
            {(!stats?.classStats || stats.classStats.length === 0) && (
              <p className="text-center text-gray-500 py-4">No classes found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
