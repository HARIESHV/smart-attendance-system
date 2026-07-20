import { Link } from 'react-router-dom';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function NotFound() {
  const { user } = useAuthStore();
  const homePath = user?.role === 'faculty' ? '/faculty' : user?.role === 'student' ? '/student' : '/admin';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-dark-900 p-6">
      <div className="glass-card max-w-lg w-full p-10 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-6 shadow-glow">
          <SearchX className="text-primary-600 dark:text-primary-400 w-12 h-12" />
        </div>
        
        <h1 className="text-6xl font-black text-gray-900 dark:text-white mb-4 tracking-tighter">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm text-sm">
          Oops! The page you are looking for doesn't exist, has been moved, or you don't have access to it.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
          <button 
            onClick={() => window.history.back()} 
            className="btn-secondary flex items-center justify-center gap-2 py-2.5 px-6"
          >
            <ArrowLeft size={18} /> Go Back
          </button>
          <Link 
            to={homePath} 
            className="btn-primary flex items-center justify-center gap-2 py-2.5 px-6"
          >
            <Home size={18} /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
