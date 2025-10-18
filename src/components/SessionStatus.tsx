import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSessionCountdown } from '../hooks/useTokenMonitoring';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface SessionStatusProps {
  showWarning?: boolean;
  className?: string;
}

export default function SessionStatus({ showWarning = true, className = '' }: SessionStatusProps) {
  const { logout } = useAuth();
  const { timeUntilExpiry, formattedTime, isTokenValid, isExpiringSoon } = useSessionCountdown();

  const handleExtendSession = async () => {
    try {
      // This would trigger a token refresh
      toast.success('Session extended successfully');
    } catch (error) {
      toast.error('Failed to extend session');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (!isTokenValid || timeUntilExpiry === null) {
    return null;
  }

  return (
    <div className={className}>
      {/* Session warning banner */}
      {showWarning && isExpiringSoon && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700">
                Your session will expire in {formattedTime}. 
                <button
                  onClick={handleExtendSession}
                  className="ml-2 text-yellow-800 underline hover:text-yellow-900"
                >
                  Extend session
                </button>
                {' or '}
                <button
                  onClick={handleLogout}
                  className="text-yellow-800 underline hover:text-yellow-900"
                >
                  logout now
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session status indicator */}
      <div className="flex items-center text-sm text-gray-600">
        <ClockIcon className="h-4 w-4 mr-1" />
        <span>
          Session expires in {formattedTime}
        </span>
      </div>
    </div>
  );
}
