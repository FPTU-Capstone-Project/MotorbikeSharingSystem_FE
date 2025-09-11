import { useEffect, useCallback } from 'react';

export const usePerformance = () => {
  const measurePerformance = useCallback((name: string, fn: () => void) => {
    const start = performance.now();
    fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    return end - start;
  }, []);

  const measureAsyncPerformance = useCallback(async (name: string, fn: () => Promise<any>) => {
    const start = performance.now();
    await fn();
    const end = performance.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${name} took ${end - start} milliseconds`);
    }
    
    return end - start;
  }, []);

  // Monitor memory usage in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      const logMemory = () => {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          allocated: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      };

      const interval = setInterval(logMemory, 30000); // Log every 30 seconds
      return () => clearInterval(interval);
    }
  }, []);

  return {
    measurePerformance,
    measureAsyncPerformance
  };
};