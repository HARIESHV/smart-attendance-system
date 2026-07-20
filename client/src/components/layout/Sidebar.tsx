import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import {
  LayoutDashboard, Camera, ClipboardList, Bell, BookOpen,
  BarChart3, LogOut, ChevronLeft, ChevronRight, Cpu, MessageSquare,
} from 'lucide-react';

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/face-registration', label: 'Face Registration', icon: Camera },
  { to: '/student/attendance', label: 'My Attendance', icon: ClipboardList },
  { to: '/student/notifications', label: 'Notifications', icon: Bell },
];

const facultyNav = [
  { to: '/faculty', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/faculty/classes', label: 'My Classes', icon: BookOpen },
  { to: '/faculty/attendance', label: 'Attendance History', icon: ClipboardList },
  { to: '/faculty/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();
  const navigate = useNavigate();

  const navItems = user?.role === 'faculty' ? facultyNav : studentNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // Always fixed, always visible — laptop layout only, no mobile overlay
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col
        bg-white/95 dark:bg-dark-800/95 backdrop-blur-xl
        border-r border-gray-200 dark:border-dark-600
        transition-all duration-300
        ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 p-5 border-b border-gray-200 dark:border-dark-600">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-violet-600 flex items-center justify-center shrink-0 shadow-glow">
          <Cpu size={18} className="text-white" />
        </div>
        {sidebarOpen && (
          <div className="min-w-0">
            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">SmartAttend</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Face Recognition</p>
          </div>
        )}
      </div>

      {/* ── User info ── */}
      {sidebarOpen && (
        <div className="p-4 border-b border-gray-200 dark:border-dark-600">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user?.role === 'faculty'
                  ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400'
                  : 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
              }`}>
                {user?.role === 'faculty' ? '👨‍🏫 Faculty' : '🎓 Student'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation ── */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-2' : ''}`
            }
            title={!sidebarOpen ? label : undefined}
          >
            <Icon size={20} className="shrink-0" />
            {sidebarOpen && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom ── */}
      <div className="p-3 border-t border-gray-200 dark:border-dark-600 space-y-1">
        <button
          onClick={handleLogout}
          className={`nav-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 ${
            !sidebarOpen ? 'justify-center px-2' : ''
          }`}
          title={!sidebarOpen ? 'Logout' : undefined}
        >
          <LogOut size={20} className="shrink-0" />
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </button>

        {/* Collapse/expand toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="nav-item w-full justify-center"
          title={sidebarOpen ? 'Collapse' : 'Expand'}
        >
          {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>
    </aside>
  );
}
