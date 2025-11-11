import React, { memo, useMemo, useState, useEffect } from 'react';
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
import { getDashboardStats, DashboardStats } from '../services/dashboardService';
import toast from 'react-hot-toast';
 

// Format number with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString('vi-VN');
};

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Memoized components for performance
const StatCard = memo(({ stat, index }: { stat: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="relative overflow-hidden bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full flex flex-col"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-5`} />
      <div className="relative p-6 flex-1 flex flex-col">
        <div className="flex items-center justify-between flex-1">
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
            <p className="text-xs text-gray-400">{/* i18n at container-level */}</p>
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
        {(activity.badgeLabel || activity.type).toUpperCase()}
      </div>
    </motion.div>
  );
});

ActivityItem.displayName = 'ActivityItem';

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        console.log('Dashboard data loaded:', data);
        setDashboardData(data);
      } catch (error: any) {
        console.error('Failed to load dashboard data:', error);
        toast.error(error?.message || 'Không tải được dữ liệu dashboard');
        // Set empty data structure to prevent crashes
        setDashboardData({
          totalUsers: 0,
          activeTrips: 0,
          totalRevenue: 0,
          averageResponseTimeMinutes: 0,
          userGrowthPercentage: 0,
          tripGrowthPercentage: 0,
          revenueGrowthPercentage: 0,
          responseTimeChangeSeconds: 0,
          newUsersThisWeek: 0,
          sharedTripsCount: 0,
          revenueThisWeek: 0,
          responseTimeDescription: 'Chưa có dữ liệu',
          monthlyRevenueData: [],
          rideStatusDistribution: [],
          hourlyPerformanceData: [],
          recentActivity: [],
        });
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  // Transform backend data to frontend format
  const stats = useMemo(() => {
    if (!dashboardData) return [];
    
    // Ensure numbers are properly converted
    const totalUsers = Number(dashboardData.totalUsers) || 0;
    const activeTrips = Number(dashboardData.activeTrips) || 0;
    const totalRevenue = Number(dashboardData.totalRevenue) || 0;
    const avgResponseTime = Number(dashboardData.averageResponseTimeMinutes) || 0;
    const userGrowth = Number(dashboardData.userGrowthPercentage) || 0;
    const tripGrowth = Number(dashboardData.tripGrowthPercentage) || 0;
    const revenueGrowth = Number(dashboardData.revenueGrowthPercentage) || 0;
    const responseTimeChange = Number(dashboardData.responseTimeChangeSeconds) || 0;
    const newUsersWeek = Number(dashboardData.newUsersThisWeek) || 0;
    const sharedTrips = Number(dashboardData.sharedTripsCount) || 0;
    const revenueWeek = Number(dashboardData.revenueThisWeek) || 0;
    
    return [
      {
        name: 'Tổng số người dùng',
        value: formatNumber(totalUsers),
        change: userGrowth !== 0 ? `${userGrowth > 0 ? '+' : ''}${userGrowth.toFixed(1)}%` : '0%',
        changeType: userGrowth >= 0 ? 'increase' as const : 'decrease' as const,
        icon: UsersIcon,
        gradient: 'from-blue-600 to-blue-700',
        bgGradient: 'from-blue-50 to-blue-100',
        details: `${newUsersWeek} người dùng mới trong tuần`,
      },
      {
        name: 'Chuyến đi đang hoạt động',
        value: formatNumber(activeTrips),
        change: tripGrowth !== 0 ? `${tripGrowth > 0 ? '+' : ''}${tripGrowth.toFixed(1)}%` : '0%',
        changeType: tripGrowth >= 0 ? 'increase' as const : 'decrease' as const,
        icon: Bike,
        gradient: 'from-green-600 to-emerald-700',
        bgGradient: 'from-green-50 to-emerald-100',
        details: `${sharedTrips} chuyến đi ghép`,
      },
      {
        name: 'Tổng doanh thu',
        value: formatCurrency(totalRevenue),
        change: revenueGrowth !== 0 ? `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%` : '0%',
        changeType: revenueGrowth >= 0 ? 'increase' as const : 'decrease' as const,
        icon: CurrencyDollarIcon,
        gradient: 'from-purple-600 to-indigo-700',
        bgGradient: 'from-purple-50 to-indigo-100',
        details: formatCurrency(revenueWeek) + ' trong tuần',
      },
      {
        name: 'Thời gian phản hồi TB',
        value: avgResponseTime > 0 ? `${avgResponseTime.toFixed(1)} phút` : '—',
        change: responseTimeChange !== 0 ? `${responseTimeChange > 0 ? '+' : ''}${responseTimeChange}s` : '0s',
        changeType: responseTimeChange <= 0 ? 'decrease' as const : 'increase' as const,
        icon: ClockIcon,
        gradient: 'from-orange-600 to-red-700',
        bgGradient: 'from-orange-50 to-red-100',
        details: dashboardData.responseTimeDescription || 'Chưa có dữ liệu',
      },
    ];
  }, [dashboardData]);

  const revenueData = useMemo(() => {
    if (!dashboardData || !dashboardData.monthlyRevenueData) return [];
    return dashboardData.monthlyRevenueData.map(item => ({
      month: item.month || '',
      revenue: Number(item.revenue) || 0,
      rides: Number(item.rides) || 0,
      users: Number(item.users) || 0,
    }));
  }, [dashboardData]);

  const rideStatusData = useMemo(() => {
    if (!dashboardData || !dashboardData.rideStatusDistribution) return [];
    return dashboardData.rideStatusDistribution.map(item => ({
      name: item.statusLabel || item.status || '',
      value: Number(item.count) || 0,
      color: item.color || '#059669',
      percentage: Number(item.percentage) || 0,
    }));
  }, [dashboardData]);

  const hourlyData = useMemo(() => {
    if (!dashboardData || !dashboardData.hourlyPerformanceData) return [];
    return dashboardData.hourlyPerformanceData.map(item => ({
      hour: item.hour || '',
      rides: Number(item.rides) || 0,
      revenue: Number(item.revenue) || 0,
    }));
  }, [dashboardData]);

  const recentActivity = useMemo(() => {
    if (!dashboardData || !dashboardData.recentActivity) return [];
    return dashboardData.recentActivity.map((item, index) => ({
      id: index + 1,
      type: item.type || '',
      badgeLabel: item.badgeLabel || '',
      user: item.user || 'Unknown',
      description: item.description || '',
      time: item.time || 'Vừa xong',
      status: item.status || 'info',
      amount: item.amount ? formatCurrency(Number(item.amount)) : undefined,
      avatar: item.avatar || 'U',
    }));
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center space-x-3 mb-3">
          <SparklesIcon className="h-8 w-8 text-indigo-600" />
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Tổng quan hệ thống
          </h1>
        </div>
        <p className="text-lg text-gray-600 max-w-2xl">
          Theo dõi hiệu suất nền tảng chia sẻ xe máy với các chỉ số cập nhật theo thời gian thực
        </p>
      </div>

      {/* Stats Grid */}
      {stats.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 items-stretch">
          {stats.map((stat, index) => (
          <StatCard key={stat.name} stat={stat} index={index} />
        ))}
      </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 items-stretch">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse h-full">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      )}

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
              <h3 className="text-xl font-bold text-gray-900">Doanh thu & tăng trưởng</h3>
              <p className="text-sm text-gray-500 mt-1">Hiệu suất theo tháng</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Doanh thu</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                <span className="text-sm text-gray-600">Người dùng</span>
              </div>
            </div>
          </div>
          <div className="h-80">
            {revenueData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Chưa có dữ liệu doanh thu</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Ride Status Distribution - Enhanced */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">Phân bổ trạng thái chuyến đi</h3>
          <p className="text-sm text-gray-500 mb-6">Thống kê trạng thái hiện tại</p>
          <div className="h-48 mb-6">
            {rideStatusData.length > 0 ? (
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
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Chưa có dữ liệu phân bổ</p>
              </div>
            )}
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
            <h3 className="text-xl font-bold text-gray-900">Hiệu suất theo giờ</h3>
            <p className="text-sm text-gray-500 mt-1">Số chuyến theo từng khung giờ trong ngày</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"></div>
              <span className="text-sm text-gray-600">Chuyến đi</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          {hourlyData.length > 0 ? (
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
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Chưa có dữ liệu hiệu suất theo giờ</p>
            </div>
          )}
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
            <h3 className="text-xl font-bold text-gray-900">Hoạt động thời gian thực</h3>
            <p className="text-sm text-gray-500 mt-1">Sự kiện và giao dịch mới nhất trên hệ thống</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600 font-medium">TRỰC TIẾP</span>
          </div>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {recentActivity.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button className="w-full text-sm text-indigo-600 hover:text-indigo-700 font-medium py-2 hover:bg-indigo-50 rounded-lg transition-colors duration-200">
            Xem tất cả hoạt động →
          </button>
        </div>
      </motion.div>
    </div>
  );
}
