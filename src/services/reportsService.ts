import { API_ENDPOINTS } from '../config/api.config';
import { apiFetch } from '../utils/api';

export interface WalletDashboardStats {
  totalActiveWallets: number;
  totalWalletBalance: number;
  totalTopupsToday: number;
  totalPayoutsToday: number;
  pendingTransactionsCount: number;
  totalTransactionsToday: number;
  avgWalletBalance: number;
  totalCommissionCollected: number;
  systemMasterBalance: number;
  systemCommissionBalance: number;
  liabilityCoverageGap: number;
}

export interface TopUpTrendPoint {
  date: string;
  amount: number;
  count: number;
}

export interface TopUpTrendResponse {
  dataPoints: TopUpTrendPoint[];
  totalAmount: number;
  avgTopUpAmount: number;
  mostPopularPaymentMethod: string;
  growthRate: number | null;
}

export interface CommissionDriverEntry {
  driverId: number;
  driverName: string;
  commissionPaid: number;
  tripCount: number;
  totalEarnings: number;
}

export interface CommissionReportResponse {
  periodStart: string;
  periodEnd: string;
  totalCommission: number;
  totalBookings: number;
  avgCommissionPerBooking: number;
  driverCommissions: CommissionDriverEntry[];
}

export interface TrendFilter {
  startDate: string;
  endDate: string;
  interval?: 'daily' | 'weekly' | 'monthly';
  paymentMethod?: string;
}

export interface CommissionFilter {
  startDate: string;
  endDate: string;
  driverId?: number;
}

const toNumber = (value: any): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const reportsService = {
  async getWalletDashboardStats(): Promise<WalletDashboardStats> {
    const data = await apiFetch<any>(API_ENDPOINTS.REPORTS.DASHBOARD);
    return {
      totalActiveWallets: data?.totalActiveWallets ?? 0,
      totalWalletBalance: toNumber(data?.totalWalletBalance),
      totalTopupsToday: toNumber(data?.totalTopupsToday),
      totalPayoutsToday: toNumber(data?.totalPayoutsToday),
      pendingTransactionsCount: data?.pendingTransactionsCount ?? 0,
      totalTransactionsToday: data?.totalTransactionsToday ?? 0,
      avgWalletBalance: toNumber(data?.avgWalletBalance),
      totalCommissionCollected: toNumber(data?.totalCommissionCollected),
      systemMasterBalance: toNumber(data?.systemMasterBalance),
      systemCommissionBalance: toNumber(data?.systemCommissionBalance),
      liabilityCoverageGap: toNumber(data?.liabilityCoverageGap),
    };
  },

  async getTopUpTrends(filter: TrendFilter): Promise<TopUpTrendResponse> {
    const params = new URLSearchParams({
      startDate: filter.startDate,
      endDate: filter.endDate,
      interval: filter.interval ?? 'daily',
    });
    if (filter.paymentMethod) {
      params.append('paymentMethod', filter.paymentMethod);
    }
    const url = `${API_ENDPOINTS.REPORTS.TOPUP_TRENDS}?${params.toString()}`;
    const data = await apiFetch<any>(url);
    return {
      dataPoints: (data?.dataPoints || []).map((point: any) => ({
        date: point?.date ?? '',
        amount: toNumber(point?.amount),
        count: point?.count ?? 0,
      })),
      totalAmount: toNumber(data?.totalAmount),
      avgTopUpAmount: toNumber(data?.avgTopUpAmount),
      mostPopularPaymentMethod: data?.mostPopularPaymentMethod || 'UNKNOWN',
      growthRate: typeof data?.growthRate === 'number' ? data.growthRate : null,
    };
  },

  async getCommissionReport(filter: CommissionFilter): Promise<CommissionReportResponse> {
    const params = new URLSearchParams({
      startDate: filter.startDate,
      endDate: filter.endDate,
    });
    if (filter.driverId) {
      params.append('driverId', String(filter.driverId));
    }
    const url = `${API_ENDPOINTS.REPORTS.COMMISSION}?${params.toString()}`;
    const data = await apiFetch<any>(url);
    return {
      periodStart: data?.periodStart ?? filter.startDate,
      periodEnd: data?.periodEnd ?? filter.endDate,
      totalCommission: toNumber(data?.totalCommission),
      totalBookings: data?.totalBookings ?? 0,
      avgCommissionPerBooking: toNumber(data?.avgCommissionPerBooking),
      driverCommissions: (data?.driverCommissions || []).map((entry: any) => ({
        driverId: entry?.driverId ?? 0,
        driverName: entry?.driverName || 'Không xác định',
        commissionPaid: toNumber(entry?.commissionPaid),
        tripCount: entry?.tripCount ?? 0,
        totalEarnings: toNumber(entry?.totalEarnings),
      })),
    };
  },
};
