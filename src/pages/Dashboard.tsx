import React from 'react';
import {
  UsersIcon,
  MapIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
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
} from 'recharts';

const revenueData = [
  { month: 'Jan', revenue: 4200, rides: 120 },
  { month: 'Feb', revenue: 5800, rides: 150 },
  { month: 'Mar', revenue: 7200, rides: 180 },
  { month: 'Apr', revenue: 6500, rides: 165 },
  { month: 'May', revenue: 8900, rides: 220 },
  { month: 'Jun', revenue: 10200, rides: 280 },
];


const recentActivity = [
  {
    id: 1,
    type: 'ride_completed',
    user: 'John Doe',
    description: 'completed a ride to FPT University',
    time: '2 minutes ago',
    status: 'success',
  },
  {
    id: 2,
    type: 'user_verified',
    user: 'Jane Smith',
    description: 'was verified as a driver',
    time: '5 minutes ago',
    status: 'info',
  },
  {
    id: 3,
    type: 'sos_alert',
    user: 'Mike Johnson',
    description: 'triggered an SOS alert',
    time: '8 minutes ago',
    status: 'warning',
  },
  {
    id: 4,
    type: 'payment',
    user: 'Sarah Wilson',
    description: 'deposited $50 to wallet',
    time: '12 minutes ago',
    status: 'success',
  },
];

const stats = [
  {
    name: 'Total Users',
    value: '2,847',
    change: '+12.5%',
    changeType: 'increase' as const,
    icon: UsersIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Active Rides',
    value: '156',
    change: '+8.2%',
    changeType: 'increase' as const,
    icon: MapIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Total Revenue',
    value: '$48,562',
    change: '+23.1%',
    changeType: 'increase' as const,
    icon: CurrencyDollarIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'SOS Alerts',
    value: '3',
    change: '-2',
    changeType: 'decrease' as const,
    icon: ExclamationTriangleIcon,
    color: 'bg-red-500',
  },
];

const rideStatusData = [
  { name: 'Completed', value: 1245, color: '#10B981' },
  { name: 'Ongoing', value: 156, color: '#3B82F6' },
  { name: 'Cancelled', value: 89, color: '#EF4444' },
];

export default function Dashboard() {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600">
          Monitor your motorbike sharing system performance and key metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex items-center">
                {stat.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span
                  className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ride Status Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Status Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rideStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {rideStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {rideStatusData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Rides Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Rides</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="rides" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center p-4 bg-gray-50 rounded-lg">
              <div
                className={`w-2 h-2 rounded-full mr-3 ${
                  activity.status === 'success'
                    ? 'bg-green-500'
                    : activity.status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-blue-500'
                }`}
              />
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.user}</span> {activity.description}
                </p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}