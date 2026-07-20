import { Sun, Moon, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { isDarkMode, toggleDarkMode } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6
      bg-white/80 dark:bg-dark-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-dark-600">

      {/* Greeting */}
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{getGreeting()},</p>
        <p className="font-semibold text-gray-900 dark:text-white text-sm">{user?.name} 👋</p>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => navigate(user?.role === 'faculty' ? '/faculty/notifications' : '/student/notifications')}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-dark-500 transition-all duration-200 hover:scale-105"
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          id="theme-toggle"
          onClick={toggleDarkMode}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-dark-600 text-gray-600 dark:text-gray-300
            hover:bg-gray-200 dark:hover:bg-dark-500 transition-all duration-200 hover:scale-105"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-500
          flex items-center justify-center cursor-pointer hover:scale-105 transition-transform">
          <span className="text-white font-semibold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
}
