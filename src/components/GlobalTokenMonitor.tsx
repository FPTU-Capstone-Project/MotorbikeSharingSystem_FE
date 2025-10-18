import { useEffect } from 'react';
import { useTokenMonitoring } from '../hooks/useTokenMonitoring';

/**
 * Global Token Monitor Component
 * This component ensures token monitoring works across all pages
 * It should be placed at the root level of the app
 */
export default function GlobalTokenMonitor() {
  const { isMonitoring } = useTokenMonitoring();

  useEffect(() => {
    // This component just ensures token monitoring is active
    // The actual monitoring logic is in the hook
    console.log('Global token monitoring active:', isMonitoring);
  }, [isMonitoring]);

  // This component doesn't render anything visible
  return null;
}
