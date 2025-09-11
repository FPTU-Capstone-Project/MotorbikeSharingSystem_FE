import { ReportHandler } from 'web-vitals';

const reportWebVitals = (onPerfEntry?: ReportHandler) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
};

// Enhanced performance monitoring
export const logWebVitals = () => {
  reportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${metric.name}: ${metric.value}`);
    }
    
    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // Example: Analytics service
      // analytics.track('Web Vitals', {
      //   name: metric.name,
      //   value: metric.value,
      //   id: metric.id,
      //   delta: metric.delta,
      // });
    }
  });
};

export default reportWebVitals;
