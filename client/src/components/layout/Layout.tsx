import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function Layout() {
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.role === 'faculty') {
      const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      socket.emit('join:faculty');

      socket.on('faculty:notification', (data) => {
        toast.success(
          <div>
            <b>{data.title}</b>
            <p className="text-sm whitespace-pre-wrap">{data.message}</p>
          </div>,
          { duration: 6000, icon: '👤' }
        );
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] bg-hero-gradient">
      <Sidebar />
      {/* Always apply sidebar margin — laptop/desktop layout only */}
      <div
        className={`flex flex-col flex-1 min-w-0 overflow-hidden transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
