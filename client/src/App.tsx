import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { authApi } from './api/auth.api';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Landing Page
import LandingPage from './pages/LandingPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import FaceRegistration from './pages/student/FaceRegistration';
import AttendanceHistory from './pages/student/AttendanceHistory';
import StudentLiveAttendance from './pages/student/StudentLiveAttendance';

// Faculty Pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import ManageClasses from './pages/faculty/ManageClasses';
import AttendanceSession from './pages/faculty/AttendanceSession';
import Reports from './pages/faculty/Reports';
import Analytics from './pages/faculty/Analytics';
import FacultyAttendanceHistory from './pages/faculty/AttendanceHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import SystemSettings from './pages/admin/SystemSettings';
import NotFound from './pages/NotFound';

// Guards
import ProtectedRoute from './components/auth/ProtectedRoute';

function App() {
  const { setAuth, setLoading } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authApi.getMe();
          // getMe returns { data: { user: User } }
          const user = res.data?.user ?? (res as any).user;
          if (user) setAuth(user, token);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setAuth, setLoading]);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }} 
      />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<MainLayout />}>
          
          {/* Student Routes */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route index element={<StudentDashboard />} />
            <Route path="face-registration" element={<FaceRegistration />} />
            <Route path="attendance" element={<AttendanceHistory />} />
            <Route path="live/:sessionId" element={<StudentLiveAttendance />} />
          </Route>

          {/* Faculty Routes */}
          <Route path="/faculty" element={<ProtectedRoute allowedRoles={['faculty']} />}>
            <Route index element={<FacultyDashboard />} />
            <Route path="classes" element={<ManageClasses />} />
            <Route path="session/:sessionId" element={<AttendanceSession />} />
            <Route path="reports" element={<Reports />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="attendance" element={<FacultyAttendanceHistory />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="settings" element={<SystemSettings />} />
          </Route>

          {/* 404 Catch All inside layout so it gets sidebar if authenticated */}
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Fallback 404 for unauthenticated */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
