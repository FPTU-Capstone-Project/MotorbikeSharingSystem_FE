import React, { useEffect } from 'react';

// Performance optimizer component
const PerformanceOptimizer: React.FC = () => {
  useEffect(() => {
    // Preload critical resources
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    preloadLink.as = 'style';
    document.head.appendChild(preloadLink);

    // Optimize rendering
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Non-critical tasks
        document.body.style.willChange = 'auto';
      });
    }

    // Cleanup function
    return () => {
      document.head.removeChild(preloadLink);
    };
  }, []);

  return null;
};

export default PerformanceOptimizer;