import React, { memo } from 'react';
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

const StatSummaryCard = memo(function StatSummaryCard({
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
        'relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 dark:bg-gradient-to-br dark:from-slate-900/85 dark:to-slate-950/70 dark:border-slate-800/80 dark:shadow-xl dark:shadow-black/40 h-full flex flex-col',
        className,
      )}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${backgroundGradient} opacity-5`} />
      <div className="relative p-6 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-4 flex-1">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg shadow-indigo-900/10 flex-shrink-0`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="text-sm font-medium text-gray-500 dark:text-slate-300/90 flex-shrink-0">{label}</p>
                {change ? (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <TrendingIcon
                      className={cn(
                        'h-4 w-4',
                        changeDirection === 'decrease' ? 'text-rose-500' : 'text-emerald-500',
                      )}
                    />
                    <span
                      className={cn(
                        'text-sm font-semibold whitespace-nowrap',
                        changeDirection === 'decrease' ? 'text-rose-500' : 'text-emerald-600',
                      )}
                    >
                      {change}
                    </span>
                  </div>
                ) : null}
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-slate-50">{value}</p>
              {detail ? (
                <p className="text-xs text-gray-400 mt-0.5 dark:text-slate-400">{detail}</p>
              ) : null}
              {change ? (
                <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5">so với kỳ trước</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default StatSummaryCard;
