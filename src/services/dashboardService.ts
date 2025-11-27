import { apiFetch } from '../utils/api';

export interface DashboardStats {
  totalUsers: number;
  activeTrips: number;
  totalRevenue: number;
  averageResponseTimeMinutes: number;
  userGrowthPercentage: number;
  tripGrowthPercentage: number;
  revenueGrowthPercentage: number;
  responseTimeChangeSeconds: number;
  newUsersThisWeek: number;
  sharedTripsCount: number;
  revenueThisWeek: number;
  responseTimeDescription: string;
  monthlyRevenueData: MonthlyRevenueData[];
  rideStatusDistribution: RideStatusDistribution[];
  hourlyPerformanceData: HourlyPerformanceData[];
  recentActivity: RecentActivityItem[];
}

export interface MonthlyRevenueData {
  month: string;
  revenue: number;
  rides: number;
  users: number;
}

export interface RideStatusDistribution {
  status: string;
  statusLabel: string;
  count: number;
  percentage: number;
  color: string;
}

export interface HourlyPerformanceData {
  hour: string;
  rides: number;
  revenue: number;
}

export interface RecentActivityItem {
  type: string;
  badgeLabel: string;
  user: string;
  description: string;
  time: string;
  status: string;
  amount?: number;
  avatar: string;
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats(startDate?: string, endDate?: string): Promise<DashboardStats> {
  const params = [];
  if (startDate) params.push(`startDate=${startDate}`);
  if (endDate) params.push(`endDate=${endDate}`);
  const query = params.length ? `?${params.join('&')}` : '';
  const data = await apiFetch<any>(`/dashboard/stats${query}`);
  
  // Convert backend BigDecimal/numbers to JavaScript numbers
  return {
    totalUsers: Number(data.totalUsers) || 0,
    activeTrips: Number(data.activeTrips) || 0,
    totalRevenue: Number(data.totalRevenue) || 0,
    averageResponseTimeMinutes: Number(data.averageResponseTimeMinutes) || 0,
    userGrowthPercentage: Number(data.userGrowthPercentage) || 0,
    tripGrowthPercentage: Number(data.tripGrowthPercentage) || 0,
    revenueGrowthPercentage: Number(data.revenueGrowthPercentage) || 0,
    responseTimeChangeSeconds: Number(data.responseTimeChangeSeconds) || 0,
    newUsersThisWeek: Number(data.newUsersThisWeek) || 0,
    sharedTripsCount: Number(data.sharedTripsCount) || 0,
    revenueThisWeek: Number(data.revenueThisWeek) || 0,
    responseTimeDescription: data.responseTimeDescription || 'Chưa có dữ liệu',
    monthlyRevenueData: (data.monthlyRevenueData || []).map((item: any) => ({
      month: item.month || '',
      revenue: Number(item.revenue) || 0,
      rides: Number(item.rides) || 0,
      users: Number(item.users) || 0,
    })),
    rideStatusDistribution: (data.rideStatusDistribution || []).map((item: any) => ({
      status: item.status || '',
      statusLabel: item.statusLabel || item.status || '',
      count: Number(item.count) || 0,
      percentage: Number(item.percentage) || 0,
      color: item.color || '#059669',
    })),
    hourlyPerformanceData: (data.hourlyPerformanceData || []).map((item: any) => ({
      hour: item.hour || '',
      rides: Number(item.rides) || 0,
      revenue: Number(item.revenue) || 0,
    })),
    recentActivity: (data.recentActivity || []).map((item: any) => ({
      type: item.type || '',
      badgeLabel: item.badgeLabel || '',
      user: item.user || 'Unknown',
      description: item.description || '',
      time: item.time || 'Vừa xong',
      status: item.status || 'info',
      amount: item.amount ? Number(item.amount) : undefined,
      avatar: item.avatar || 'U',
    })),
  };
}

