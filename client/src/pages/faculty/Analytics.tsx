import { useEffect, useState } from 'react';
import { facultyApi } from '../../api/faculty.api';
import type { FacultyAnalytics } from '../../types';
import { Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Analytics() {
  const [stats, setStats] = useState<FacultyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facultyApi.getAnalytics()
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" size={32} /></div>;

  const classData = stats?.classStats.map(c => ({
    name: c.subject,
    attendance: c.avgAttendance,
    students: c.totalStudents
  })) || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="page-title">Analytics Overview</h1>
        <p className="page-subtitle">Detailed insights into class attendance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
             <TrendingUp className="text-primary-500" />
             <h3 className="font-bold text-lg">Class Performance</h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                />
                <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                  {classData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.attendance >= 75 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-2 mb-6">
             <AlertTriangle className="text-amber-500" />
             <h3 className="font-bold text-lg">Needs Attention</h3>
          </div>
          
          <div className="space-y-4">
            {classData.filter(c => c.attendance < 75).length > 0 ? (
               classData.filter(c => c.attendance < 75).map((cls, idx) => (
                 <div key={idx} className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-red-900 dark:text-red-400">{cls.name}</h4>
                      <p className="text-sm text-red-700 dark:text-red-500">Average attendance is below 75% threshold.</p>
                    </div>
                    <div className="text-2xl font-black text-red-600">{cls.attendance}%</div>
                 </div>
               ))
            ) : (
              <div className="h-40 flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-dark-600 rounded-xl border border-dashed border-gray-300 dark:border-dark-500">
                <CheckCircle2 size={32} className="text-emerald-500 mb-2" />
                <p>All classes are performing well!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { CheckCircle2 } from 'lucide-react';
