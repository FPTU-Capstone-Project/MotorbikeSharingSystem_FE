import React from 'react';
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../utils/cn';

type IconType = React.ComponentType<React.ComponentProps<'svg'>>;

interface StatSummaryCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  gradient: string;
  backgroundGradient: string;
  detail?: string;
  change?: string;
  changeDirection?: 'increase' | 'decrease';
  className?: string;
}

export default function StatSummaryCard({
  label,
  value,
  icon: Icon,
  gradient,
  backgroundGradient,
  detail,
  change,
  changeDirection = 'increase',
  className,
}: StatSummaryCardProps) {
  const TrendingIcon =
    changeDirection === 'decrease' ? ArrowTrendingDownIcon : ArrowTrendingUpIcon;

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 dark:bg-gradient-to-br dark:from-slate-900/85 dark:to-slate-950/70 dark:border-slate-800/80 dark:shadow-xl dark:shadow-black/40',
        className,
      )}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient} opacity-5`} />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg shadow-indigo-900/10`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5 dark:text-slate-300/90">{label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{value}</p>
              {detail ? (
                <p className="text-xs text-gray-400 mt-0.5 dark:text-slate-400">{detail}</p>
              ) : null}
            </div>
          </div>
          {change ? (
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                <TrendingIcon
                  className={cn(
                    'h-4 w-4 mr-1',
                    changeDirection === 'decrease' ? 'text-rose-500' : 'text-emerald-500',
                  )}
                />
                <span
                  className={cn(
                    'text-sm font-semibold',
                    changeDirection === 'decrease' ? 'text-rose-500' : 'text-emerald-600',
                  )}
                >
                  {change}
                </span>
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-400">so với kỳ trước</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
