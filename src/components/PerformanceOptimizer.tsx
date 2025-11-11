import React, { useEffect } from 'react';

// Performance optimizer component - Enhanced for better performance
const PerformanceOptimizer: React.FC = () => {
  useEffect(() => {
    // Preload critical resources with better performance
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preload';
    preloadLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    preloadLink.as = 'style';
    preloadLink.crossOrigin = 'anonymous';
    document.head.appendChild(preloadLink);

    // Enable GPU acceleration for smooth animations
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      /* Optimize compositing layers */
      [data-theme] {
        transform: translate3d(0, 0, 0);
      }
    `;
    document.head.appendChild(style);

    // Optimize rendering with requestIdleCallback
    const optimizeRendering = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(() => {
          // Clean up will-change after animations complete
          const elements = document.querySelectorAll('[style*="will-change"]');
          elements.forEach((el) => {
            if (el instanceof HTMLElement) {
              // Reset will-change after a delay to allow animations
              setTimeout(() => {
                el.style.willChange = 'auto';
              }, 500);
            }
          });
        });
      }
    };

    // Debounce scroll and resize events for better performance
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(optimizeRendering, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Cleanup function
    return () => {
      try {
        if (preloadLink.parentNode) {
          document.head.removeChild(preloadLink);
        }
        if (style.parentNode) {
          document.head.removeChild(style);
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  return null;
};

export default React.memo(PerformanceOptimizer);