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
      toast.success('Gia hạn phiên làm việc thành công');
    } catch (error) {
      toast.error('Không thể gia hạn phiên làm việc');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
  };

  if (!isTokenValid || timeUntilExpiry === null) {
    return null;
  }

  return (
    <div className={className}>
      {/* Session warning banner */}
      {showWarning && isExpiringSoon && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 dark:bg-amber-900/30 dark:border-amber-500/60">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mr-2 dark:text-amber-300" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700 dark:text-amber-200">
                Phiên đăng nhập của bạn sẽ hết hạn sau {formattedTime}. 
                <button
                  onClick={handleExtendSession}
                  className="ml-2 text-yellow-800 underline hover:text-yellow-900 dark:text-amber-200 dark:hover:text-amber-100"
                >
                  Gia hạn phiên
                </button>
                {' hoặc '}
                <button
                  onClick={handleLogout}
                  className="text-yellow-800 underline hover:text-yellow-900 dark:text-amber-200 dark:hover:text-amber-100"
                >
                  đăng xuất ngay
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session status indicator */}
      <div className="flex items-center text-sm text-gray-600 dark:text-slate-300">
        <ClockIcon className="h-4 w-4 mr-1 text-gray-500 dark:text-slate-300" />
        <span>
          Phiên đăng nhập còn {formattedTime}
        </span>
      </div>
    </div>
  );
}
