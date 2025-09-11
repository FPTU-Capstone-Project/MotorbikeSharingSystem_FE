import React, { memo } from 'react';
import SkeletonLoader from './SkeletonLoader';

const DashboardSkeleton = memo(() => {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="mb-8 space-y-2">
        <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3 animate-pulse"></div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <SkeletonLoader key={index} variant="card" />
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonLoader variant="chart" />
        <SkeletonLoader variant="chart" />
      </div>

      {/* Monthly Rides Chart Skeleton */}
      <SkeletonLoader variant="chart" />

      {/* Recent Activity Skeleton */}
      <SkeletonLoader variant="table" />
    </div>
  );
});

DashboardSkeleton.displayName = 'DashboardSkeleton';

export default DashboardSkeleton;