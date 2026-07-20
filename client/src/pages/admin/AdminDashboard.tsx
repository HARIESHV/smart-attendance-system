import { Users, Server, ShieldCheck, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-3">
          <ShieldCheck className="text-primary-500" />
          Admin Dashboard
        </h1>
        <p className="page-subtitle">System Overview and Management</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-l-4 border-l-blue-500 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-600/50 transition-colors" onClick={() => navigate('/admin/users')}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Users size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Manage Students</p>
              <h3 className="text-2xl font-bold">Face Data</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Server size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">System Status</p>
              <h3 className="text-2xl font-bold text-emerald-500">Online</h3>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-violet-500">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">AI Models</p>
              <h3 className="text-2xl font-bold">Loaded</h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
