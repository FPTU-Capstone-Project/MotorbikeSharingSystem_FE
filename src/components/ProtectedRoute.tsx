import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  // Fallback to localStorage right after login to avoid a brief unauthenticated render
  const storedToken = !isAuthenticated && (localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('access_token'));
  const storedUser = !isAuthenticated && localStorage.getItem('user');
  const effectiveAuthenticated = isAuthenticated || (!!storedToken && !!storedUser);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  if (!effectiveAuthenticated) {
    // Redirect to login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
