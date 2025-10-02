import React from 'react';
import { motion } from 'framer-motion';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { type DriverVerificationStats } from '../../types/verification.types';
import './VerificationStats.css';

interface VerificationStatsProps {
  stats: DriverVerificationStats;
}

const VerificationStats: React.FC<VerificationStatsProps> = ({ stats }) => {
  const statCards = [
    {
      label: 'Pending',
      value: stats.total_pending,
      icon: ClockIcon,
      color: 'warning',
      description: 'Awaiting review',
    },
    {
      label: 'Approved',
      value: stats.total_approved,
      icon: CheckCircleIcon,
      color: 'success',
      description: 'Verified drivers',
    },
    {
      label: 'Rejected',
      value: stats.total_rejected,
      icon: XCircleIcon,
      color: 'danger',
      description: 'Not verified',
    },
    {
      label: 'Processed Today',
      value: stats.today_processed,
      icon: ChartBarIcon,
      color: 'info',
      description: 'Completed today',
    },
  ];

  const totalCount = stats.total_pending + stats.total_approved + stats.total_rejected;
  const approvalRate = totalCount > 0
    ? ((stats.total_approved / totalCount) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="verification-stats">
      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`stat-card ${stat.color}`}
          >
            <div className="stat-icon">
              <stat.icon className="icon" />
            </div>
            <div className="stat-content">
              <p className="stat-label">{stat.label}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-description">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="approval-rate"
      >
        <div className="rate-content">
          <p className="rate-label">Approval Rate</p>
          <h2 className="rate-value">{approvalRate}%</h2>
          <div className="rate-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${approvalRate}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className="rate-fill"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(VerificationStats);
