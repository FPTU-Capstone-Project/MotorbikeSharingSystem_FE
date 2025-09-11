import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'line' | 'circle' | 'chart' | 'table';
  count?: number;
  className?: string;
}

const SkeletonLoader = memo(({ variant = 'line', count = 1, className = '' }: SkeletonLoaderProps) => {
  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return (
          <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            </div>
          </div>
        );

      case 'circle':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
          </div>
        );

      case 'chart':
        return (
          <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-300 rounded w-1/3"></div>
              <div className="h-80 bg-gray-200 rounded-lg flex items-end justify-between p-4 space-x-2">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-300 rounded-t"
                    style={{
                      height: `${Math.random() * 60 + 20}%`,
                      width: '12%'
                    }}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'table':
        return (
          <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
            <div className="animate-pulse">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-6 bg-gray-300 rounded w-1/4"></div>
              </div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-300 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className={`animate-pulse space-y-3 ${className}`}>
            {[...Array(count)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
            ))}
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0.6 }}
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
    >
      {renderSkeleton()}
    </motion.div>
  );
});

SkeletonLoader.displayName = 'SkeletonLoader';

export default SkeletonLoader;