import React, { memo, useMemo } from 'react';
import {
  UsersIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import { Bike } from 'lucide-react';

const revenueData = [
  { month: 'Jan', revenue: 4200, rides: 120, users: 850 },
  { month: 'Feb', revenue: 5800, rides: 150, users: 1200 },
  { month: 'Mar', revenue: 7200, rides: 180, users: 1450 },
  { month: 'Apr', revenue: 6500, rides: 165, users: 1680 },
  { month: 'May', revenue: 8900, rides: 220, users: 1950 },
  { month: 'Jun', revenue: 10200, rides: 280, users: 2340 },
  { month: 'Jul', revenue: 11800, rides: 320, users: 2680 },
  { month: 'Aug', revenue: 13200, rides: 380, users: 2847 },
];


const recentActivity = [
  {
    id: 1,
    type: 'ride_completed',
    user: 'John Doe',
    description: 'completed a ride to FPT University',
    time: '2 minutes ago',
    status: 'success',
    amount: '$12.50',
    avatar: 'JD',
  },
  {
    id: 2,
    type: 'user_verified',
    user: 'Jane Smith',
    description: 'was verified as a driver',
    time: '5 minutes ago',
    status: 'info',
    avatar: 'JS',
  },
  {
    id: 3,
    type: 'sos_alert',
    user: 'Mike Johnson',
    description: 'triggered an SOS alert - Resolved',
    time: '8 minutes ago',
    status: 'warning',
    avatar: 'MJ',
  },
  {
    id: 4,
    type: 'payment',
    user: 'Sarah Wilson',
    description: 'deposited to wallet',
    time: '12 minutes ago',
    status: 'success',
    amount: '$50.00',
    avatar: 'SW',
  },
  {
    id: 5,
    type: 'ride_shared',
    user: 'David Chen',
    description: 'joined a shared ride',
    time: '15 minutes ago',
    status: 'info',
    amount: '$8.25',
    avatar: 'DC',
  },
];

const stats = [
  {
    name: 'Total Users',
    value: '2,847',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: UsersIcon,
    gradient: 'from-blue-600 to-blue-700',
    bgGradient: 'from-blue-50 to-blue-100',
    details: '147 new this week',
  },
  {
    name: 'Active Rides',
    value: '156',
    change: '+8.2%',
    changeType: 'increase' as const,
    icon: Bike,
    gradient: 'from-green-600 to-emerald-700',
    bgGradient: 'from-green-50 to-emerald-100',
    details: '23 shared rides',
  },
  {
    name: 'Total Revenue',
    value: '$48,562',
    change: '+23.1%',
    changeType: 'increase' as const,
    icon: CurrencyDollarIcon,
    gradient: 'from-purple-600 to-indigo-700',
    bgGradient: 'from-purple-50 to-indigo-100',
    details: '$12.3k this week',
  },
  {
    name: 'Avg. Response Time',
    value: '2.3 min',
    change: '-15s',
    changeType: 'decrease' as const,
    icon: ClockIcon,
    gradient: 'from-orange-600 to-red-700',
    bgGradient: 'from-orange-50 to-red-100',
    details: 'Emergency response',
  },
];

const rideStatusData = [
  { name: 'Completed', value: 1245, color: '#059669', percentage: 78.5 },
  { name: 'Ongoing', value: 156, color: '#2563EB', percentage: 9.8 },
  { name: 'Cancelled', value: 89, color: '#DC2626', percentage: 5.6 },
  { name: 'Shared', value: 98, color: '#7C3AED', percentage: 6.1 },
];

const hourlyData = [
  { hour: '6AM', rides: 12, revenue: 180 },
  { hour: '7AM', rides: 45, revenue: 680 },
  { hour: '8AM', rides: 89, revenue: 1340 },
  { hour: '9AM', rides: 67, revenue: 1010 },
  { hour: '10AM', rides: 34, revenue: 510 },
  { hour: '11AM', rides: 28, revenue: 420 },
  { hour: '12PM', rides: 56, revenue: 840 },
  { hour: '1PM', rides: 43, revenue: 645 },
  { hour: '2PM', rides: 38, revenue: 570 },
  { hour: '3PM', rides: 52, revenue: 780 },
  { hour: '4PM', rides: 71, revenue: 1065 },
  { hour: '5PM', rides: 98, revenue: 1470 },
  { hour: '6PM', rides: 85, revenue: 1275 },
  { hour: '7PM', rides: 62, revenue: 930 },
  { hour: '8PM', rides: 41, revenue: 615 },
  { hour: '9PM', rides: 29, revenue: 435 },
  { hour: '10PM', rides: 18, revenue: 270 },
  { hour: '11PM', rides: 8, revenue: 120 },
];

// Memoized components for performance
const StatCard = memo(({ stat, index }: { stat: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-5`} />
      <div className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.gradient} shadow-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-0.5">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{stat.details}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end mb-1">
              {stat.changeType === 'increase' ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500 mr-1" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-emerald-500 mr-1" />
              )}
              <span className="text-sm font-semibold text-emerald-600">
                {stat.change}
              </span>
            </div>
            <p className="text-xs text-gray-400">vs last period</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

StatCard.displayName = 'StatCard';

const ActivityItem = memo(({ activity, index }: { activity: any; index: number }) => {
  const statusColors = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const avatarColors = {
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    info: 'bg-blue-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="flex items-center p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:bg-white hover:shadow-sm transition-all duration-200"
    >
      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold text-white ${avatarColors[activity.status as keyof typeof avatarColors]}`}>
        {activity.avatar}
      </div>
      <div className="flex-1 ml-4">
        <div className="flex items-center space-x-3">
          <p className="text-sm text-gray-900">
            <span className="font-semibold">{activity.user}</span> {activity.description}
          </p>
          {activity.amount && (
            <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-lg">
              {activity.amount}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
      <div className={`px-2 py-1 rounded-lg text-xs font-medium border ${statusColors[activity.status as keyof typeof statusColors]}`}>
        {activity.type.replace('_', ' ').toUpperCase()}
      </div>
    </motion.div>
  );
});

ActivityItem.displayName = 'ActivityItem';

export default function Dashboard() {
  const memoizedStats = useMemo(() => stats, []);
  const memoizedActivity = useMemo(() => recentActivity, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-3">
          <SparklesIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl">
          Monitor your motorbike sharing system performance with real-time insights and analytics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {memoizedStats.map((stat, index) => (
          <StatCard key={stat.name} stat={stat} index={index} />
        ))}
      </div>

      {/* Advanced Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Revenue Trend - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Revenue & Growth Trend</h3>
              <p className="text-sm text-gray-500 mt-1">Monthly performance overview</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Revenue</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Users</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#revenueGradient)"
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#10B981"
                  strokeWidth={3}
                  fill="url(#usersGradient)"
                  dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ride Status Distribution - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Ride Distribution</h3>
          <p className="text-sm text-gray-500 mb-6">Current ride status breakdown</p>
          <div className="h-48 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rideStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {rideStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3">
            {rideStatusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                  <div className="text-xs text-gray-500">{item.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Hourly Performance Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-lg transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Hourly Performance</h3>
            <p className="text-sm text-gray-500 mt-1">Today's ride activity by hour</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Rides</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} barCategoryGap="20%">
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={1}/>
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="hour" 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                }}
                formatter={(value: any) => [`${value} rides`, 'Rides']}
              />
              <Bar 
                dataKey="rides" 
                fill="url(#barGradient)" 
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>


      {/* Recent Activity - Enhanced */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Live Activity Feed</h3>
            <p className="text-sm text-gray-500 mt-1">Real-time system events and transactions</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">LIVE</span>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {memoizedActivity.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
            View All Activity →
          </button>
        </div>
      </motion.div>
    </div>
  );
}