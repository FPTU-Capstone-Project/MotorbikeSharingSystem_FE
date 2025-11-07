import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import {
  Line,
  AreaChart,
  Area,
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
  ComposedChart,
} from 'recharts';

const monthlyData = [
  { month: 'Th1', users: 120, rides: 450, revenue: 4200000, drivers: 25 },
  { month: 'Th2', users: 180, rides: 680, revenue: 5800000, drivers: 35 },
  { month: 'Th3', users: 250, rides: 920, revenue: 7200000, drivers: 48 },
  { month: 'Th4', users: 320, rides: 1150, revenue: 6500000, drivers: 52 },
  { month: 'Th5', users: 420, rides: 1480, revenue: 8900000, drivers: 68 },
  { month: 'Th6', users: 580, rides: 1920, revenue: 10200000, drivers: 85 },
];

const dailyRidesData = [
  { day: 'Thứ 2', rides: 45, shared: 18 },
  { day: 'Thứ 3', rides: 52, shared: 22 },
  { day: 'Thứ 4', rides: 48, shared: 19 },
  { day: 'Thứ 5', rides: 61, shared: 28 },
  { day: 'Thứ 6', rides: 78, shared: 35 },
  { day: 'Thứ 7', rides: 85, shared: 42 },
  { day: 'CN', rides: 38, shared: 15 },
];

const rideTypeData = [
  { name: 'Chuyến riêng', value: 1245, color: '#3B82F6' },
  { name: 'Đi chung', value: 856, color: '#10B981' },
];

const peakHoursData = [
  { hour: '6', rides: 15 },
  { hour: '7', rides: 45 },
  { hour: '8', rides: 78 },
  { hour: '9', rides: 42 },
  { hour: '10', rides: 28 },
  { hour: '11', rides: 35 },
  { hour: '12', rides: 68 },
  { hour: '13', rides: 52 },
  { hour: '14', rides: 38 },
  { hour: '15', rides: 45 },
  { hour: '16', rides: 72 },
  { hour: '17', rides: 85 },
  { hour: '18', rides: 92 },
  { hour: '19', rides: 65 },
  { hour: '20', rides: 35 },
  { hour: '21', rides: 25 },
  { hour: '22', rides: 18 },
];

const topRoutes = [
  { route: 'ĐH FPT → Times City', count: 245, revenue: 8575000 },
  { route: 'ĐH FPT → Keangnam Tower', count: 189, revenue: 6615000 },
  { route: 'ĐH FPT → Lotte Center', count: 156, revenue: 5460000 },
  { route: 'ĐH FPT → Vincom Mega Mall', count: 134, revenue: 4690000 },
  { route: 'ĐH FPT → Big C Thăng Long', count: 112, revenue: 3920000 },
];

export default function Analytics() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const kpis = [
    {
      title: 'Tổng doanh thu',
      value: '₫42.5M',
      change: '+23.5%',
      changeType: 'increase',
      period: 'so với tháng trước',
    },
    {
      title: 'Người dùng hoạt động',
      value: '2,847',
      change: '+12.8%',
      changeType: 'increase',
      period: 'so với tháng trước',
    },
    {
      title: 'Tổng số chuyến',
      value: '8,654',
      change: '+18.2%',
      changeType: 'increase',
      period: 'so với tháng trước',
    },
    {
      title: 'Giá cước trung bình',
      value: '₫28,500',
      change: '-2.1%',
      changeType: 'decrease',
      period: 'so với tháng trước',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Phân tích & Báo cáo</h1>
          <p className="mt-2 text-gray-600">
            Tổng quan chỉ số hoạt động và hiệu suất của nền tảng
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            className="input-field"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
          >
            <option value="7d">7 ngày gần đây</option>
            <option value="30d">30 ngày gần đây</option>
            <option value="90d">90 ngày gần đây</option>
            <option value="1y">1 năm gần đây</option>
          </select>
          <button className="btn-secondary flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2" />
            Chọn khoảng khác
          </button>
          <button className="btn-primary flex items-center">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <div className="flex items-center mt-2">
                  {kpi.changeType === 'increase' ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      kpi.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {kpi.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">{kpi.period}</span>
                </div>
              </div>
              <div className="p-3 bg-primary-50 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-primary-600" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Revenue & Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Doanh thu & Tăng trưởng người dùng</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
              <span>Doanh thu</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Người dùng</span>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis yAxisId="left" stroke="#6b7280" />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="revenue"
                stackId="1"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.1}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="users"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Rides */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bổ chuyến theo tuần</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyRidesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Bar dataKey="rides" fill="#3B82F6" name="Tổng chuyến" />
                <Bar dataKey="shared" fill="#10B981" name="Đi chung" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ride Type Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỉ lệ loại chuyến</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rideTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {rideTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {rideTypeData.map((item) => (
              <div key={item.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-600">
                  {item.name}: {((item.value / rideTypeData.reduce((sum, d) => sum + d.value, 0)) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Peak Hours Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân tích khung giờ cao điểm</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={peakHoursData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip
                labelFormatter={(value) => `${value}h`}
                formatter={(value: any) => [`${value} chuyến`, 'Số chuyến']}
              />
              <Area
                type="monotone"
                dataKey="rides"
                stroke="#8B5CF6"
                fill="#8B5CF6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Top Routes Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Tuyến đường nổi bật</h3>
          <button className="btn-secondary text-sm">Xem tất cả tuyến</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tuyến đường
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tổng chuyến
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Doanh thu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Cước bình quân
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topRoutes.map((route, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{route.route}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{route.count}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">₫{route.revenue.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      ₫{Math.round(route.revenue / route.count).toLocaleString()}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
