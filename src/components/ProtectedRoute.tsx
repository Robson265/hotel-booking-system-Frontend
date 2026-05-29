/**
 * src/components/ProtectedRoute.tsx
 *
 * Wraps a route so only authenticated users can access it.
 * While the auth state is still being restored from localStorage we
 * show a spinner to avoid a flash-redirect on hard refresh.
 */

import { Navigate, Outlet } from 'react-router-dom';

interface ProtectedRouteProps {
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const token = localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  
  // Not logged in
  if (!token) {
    return <Navigate to={requireAdmin ? '/admin/login' : '/login'} replace />;
  }
  
  // Requires admin but user is not admin
  if (requireAdmin && userRole !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />;
}