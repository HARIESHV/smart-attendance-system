import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

/**
 * ProtectedRoute guards authenticated routes.
 * - Redirects unauthenticated users to /login
 * - Redirects users without the required role back to their home
 */
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect to the user's own dashboard
    const home = user.role === 'faculty' ? '/faculty' : '/student';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
