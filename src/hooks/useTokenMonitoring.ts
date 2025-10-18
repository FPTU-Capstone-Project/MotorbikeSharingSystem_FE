import { useEffect, useState } from 'react';
import { tokenService } from '../services/tokenService';

/**
 * Hook to monitor token expiration globally
 * This ensures token monitoring works on all pages
 */
export function useTokenMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Initialize token monitoring if not already initialized
    if (!isMonitoring) {
      tokenService.initialize();
      setIsMonitoring(true);
    }

    // Add listener for token updates
    const removeListener = tokenService.addListener(() => {
      // Force re-render when token updates
      setIsMonitoring(prev => !prev);
    });

    return () => {
      removeListener();
    };
  }, [isMonitoring]);

  return {
    isMonitoring,
    getTimeUntilExpiry: () => tokenService.getTimeUntilExpiry(),
    isTokenValid: () => tokenService.isTokenValid(),
    getTokenExpirationTime: () => tokenService.getTokenExpirationTime(),
  };
}

/**
 * Hook for real-time session countdown
 * Updates every second for accurate countdown display
 */
export function useSessionCountdown() {
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number | null>(null);
  const { getTimeUntilExpiry, isTokenValid } = useTokenMonitoring();

  useEffect(() => {
    const updateCountdown = () => {
      if (isTokenValid()) {
        const timeLeft = getTimeUntilExpiry();
        setTimeUntilExpiry(timeLeft);
      } else {
        setTimeUntilExpiry(null);
      }
    };

    // Update immediately
    updateCountdown();

    // Update every second for real-time countdown
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [getTimeUntilExpiry, isTokenValid]);

  const formatTime = (seconds: number | null): string => {
    if (seconds === null) return 'N/A';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return {
    timeUntilExpiry,
    formattedTime: formatTime(timeUntilExpiry),
    isTokenValid: isTokenValid(),
    isExpiringSoon: timeUntilExpiry !== null && timeUntilExpiry < 300 && timeUntilExpiry > 0,
  };
}
