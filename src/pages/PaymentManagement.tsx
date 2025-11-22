import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  UsersIcon,
  CheckCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { transactionService, TransactionResponse } from '../services/transactionService';
import { userProfileService, UserProfileMap } from '../services/userProfileService';
import { reportsService, WalletDashboardStats, TopUpTrendResponse as WalletTopUpTrendResponse, CommissionReportResponse } from '../services/reportsService';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import StatSummaryCard from '../components/StatSummaryCard';

const currencyFormatter = new Intl.NumberFormat('vi-VN');
const numberFormatter = new Intl.NumberFormat();

const formatCurrencyValue = (value?: number | null, defaultLabel = '—') => {
  if (value === null || value === undefined) {
    return defaultLabel;
  }
  return `${currencyFormatter.format(value)}đ`;
};

const formatDateParam = (date: Date) => date.toISOString().split('T')[0];

const formatDateLabel = (isoString?: string) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatGrowthValue = (value?: number | null) => {
  if (value === null || value === undefined) return '—';
  const formatted = value.toFixed(1);
  return `${value > 0 ? '+' : ''}${formatted}%`;
};

const computePresetRange = (preset: 'today' | 'week' | 'month'): { from: string; to: string } => {
  const now = new Date();
  const end = formatDateParam(now);
  if (preset === 'today') {
    return { from: end, to: end };
  }
  if (preset === 'week') {
    const start = new Date(now);
    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1; // Monday as start
    start.setDate(start.getDate() - diff);
    return { from: formatDateParam(start), to: end };
  }
  if (preset === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { from: formatDateParam(start), to: end };
  }
  return { from: '', to: '' };
};

const isWithinThreeMonths = (from: string, to: string) => {
  if (!from || !to) return true;
  const fromDate = new Date(from);
  const toDate = new Date(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) return false;
  const diffDays = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 93 && diffDays >= 0;
};

const formatDateTime = (isoString?: string) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('vi-VN');
};

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');
  const [filterDirection, setFilterDirection] = useState<'all' | 'IN' | 'OUT' | 'INTERNAL'>('all');
  const initialRange = computePresetRange('week');
  const [dateFrom, setDateFrom] = useState<string>(initialRange.from);
  const [dateTo, setDateTo] = useState<string>(initialRange.to);
  const [datePreset, setDatePreset] = useState<'today' | 'week' | 'month' | 'custom'>('week');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 0,
    page_size: 10,
    total_pages: 0,
    total_records: 0,
  });
  const [userProfiles, setUserProfiles] = useState<UserProfileMap>({});
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionResponse | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<WalletDashboardStats | null>(null);
  const [trendData, setTrendData] = useState<WalletTopUpTrendResponse | null>(null);
  const [commissionReport, setCommissionReport] = useState<CommissionReportResponse | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const [insightRange, setInsightRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [ledgerView, setLedgerView] = useState<'USER' | 'SYSTEM'>('USER');
  const [pendingFrom, setPendingFrom] = useState<string>(initialRange.from);
  const [pendingTo, setPendingTo] = useState<string>(initialRange.to);

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
    loadInsights();
  }, [currentPage, pageSize, filterType, filterStatus, filterDirection, dateFrom, dateTo, datePreset]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      if (dateFrom && dateTo && !isWithinThreeMonths(dateFrom, dateTo)) {
        toast.error('Khoảng thời gian không được vượt quá 3 tháng và phải hợp lệ.');
        setLoading(false);
        return;
      }
      if (datePreset === 'custom' && (!dateFrom || !dateTo)) {
        setLoading(false);
        return;
      }

      const filters = {
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc' as const,
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterDirection !== 'all' && { direction: filterDirection }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      };

      const response = await transactionService.getAllTransactions(filters);
      setTransactions(response.data);
      setPagination(response.pagination);

      // Load user profiles for the transactions
      await loadUserProfiles(response.data);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Không thể tải danh sách giao dịch');
      toast.error('Không thể tải danh sách giao dịch');
    } finally {
      setLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsightsError(null);
      let startDate = dateFrom;
      let endDate = dateTo;
      if (!startDate || !endDate) {
        const fallback = computePresetRange('week');
        startDate = fallback.from;
        endDate = fallback.to;
        setDateFrom(fallback.from);
        setDateTo(fallback.to);
        setDatePreset('week');
        setPendingFrom(fallback.from);
        setPendingTo(fallback.to);
      }
      if (!isWithinThreeMonths(startDate, endDate)) {
        toast.error('Khoảng thời gian không được vượt quá 3 tháng và phải hợp lệ.');
        setInsightsLoading(false);
        return;
      }
      setInsightRange({ start: startDate, end: endDate });

      const [dashboard, trends, commission] = await Promise.all([
        reportsService.getWalletDashboardStats(startDate, endDate),
        reportsService.getTopUpTrends({ startDate, endDate, interval: 'daily' }),
        reportsService.getCommissionReport({ startDate, endDate }),
      ]);

      setDashboardStats(dashboard);
      setTrendData(trends);
      setCommissionReport(commission);
    } catch (err) {
      console.error('Error loading wallet insights:', err);
      setInsightsError('Không thể tải thông tin báo cáo tài chính');
      toast.error('Không thể tải thông tin báo cáo tài chính');
    } finally {
      setInsightsLoading(false);
    }
  };

  // Load user profiles for transactions
  const loadUserProfiles = async (transactions: TransactionResponse[]) => {
    try {
      // Extract unique user IDs from transactions
      const userIds = new Set<number>();
      transactions.forEach(transaction => {
        if (transaction.actorUserId) userIds.add(transaction.actorUserId);
      });

      if (userIds.size > 0) {
        const profiles = await userProfileService.getUserProfiles(Array.from(userIds));
        setUserProfiles(profiles);
      }
    } catch (err) {
      console.error('Error loading user profiles:', err);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0); // Reset to first page when changing page size
  };

  const filteredTransactions = useMemo(() => {
    if (ledgerView === 'SYSTEM') {
      return transactions.filter((txn) => txn.actorKind === 'SYSTEM');
    }
    return transactions.filter((txn) => txn.actorKind !== 'SYSTEM');
  }, [transactions, ledgerView]);

  const groupedTransactions = useMemo(() => {
    type TransactionGroup = {
      groupId: string;
      transactions: TransactionResponse[];
      sharedRideId?: number;
      sharedRideRequestId?: number;
      totalIn: number;
      totalOut: number;
      startedAt?: string;
      finishedAt?: string;
    };

    const groups: TransactionGroup[] = [];
    const map = new Map<string, TransactionGroup>();

    filteredTransactions.forEach((transaction) => {
      const key = transaction.groupId || `txn-${transaction.txnId}`;
      if (!map.has(key)) {
        const group: TransactionGroup = {
          groupId: key,
          transactions: [],
          totalIn: 0,
          totalOut: 0,
        };
        map.set(key, group);
        groups.push(group);
      }
      const group = map.get(key)!;
      group.transactions.push(transaction);
      if (transaction.direction === 'IN') {
        group.totalIn += transaction.amount || 0;
      } else if (transaction.direction === 'OUT') {
        group.totalOut += transaction.amount || 0;
      }
      if (!group.sharedRideId && transaction.sharedRideId) {
        group.sharedRideId = transaction.sharedRideId;
      }
      if (!group.sharedRideRequestId && transaction.sharedRideRequestId) {
        group.sharedRideRequestId = transaction.sharedRideRequestId;
      }
    });

    groups.forEach((group) => {
      group.transactions.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
      group.startedAt = group.transactions[0]?.createdAt;
      group.finishedAt = group.transactions[group.transactions.length - 1]?.createdAt;
    });

    return groups;
  }, [filteredTransactions]);

  const handleApproveWithdrawal = (transactionId: number) => {
    // This would typically call an API to approve the withdrawal
    toast.success('Đã phê duyệt yêu cầu rút tiền');
    loadTransactions(); // Reload data
  };

  const handleRejectWithdrawal = (transactionId: number) => {
    // This would typically call an API to reject the withdrawal
    toast.success('Đã từ chối yêu cầu rút tiền');
    loadTransactions(); // Reload data
  };

  // Handle view transaction details
  const handleViewDetails = (transaction: TransactionResponse) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  // Close details modal
  const handleCloseDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      COMPLETED: 'bg-green-100 text-green-800',
      SUCCESS: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      FAILED: 'bg-red-100 text-red-800',
      REVERSED: 'bg-amber-100 text-amber-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TOPUP':
        return <ArrowDownIcon className="h-5 w-5 text-blue-500" />;
      case 'PAYOUT':
        return <ArrowUpIcon className="h-5 w-5 text-green-500" />;
      case 'CAPTURE_FARE':
        return <CreditCardIcon className="h-5 w-5 text-purple-500" />;
      case 'HOLD_CREATE':
      case 'HOLD_RELEASE':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <BanknotesIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMethodBadge = (method: string) => {
    const styles: { [key: string]: string } = {
      wallet: 'bg-purple-100 text-purple-800',
      card: 'bg-blue-100 text-blue-800',
      bank_transfer: 'bg-gray-100 text-gray-800',
      bank: 'bg-gray-100 text-gray-800',
    };
    return styles[method] || 'bg-gray-100 text-gray-800';
  };

  const transactionTypeLabels: Record<string, string> = {
    TOPUP: 'Nạp ví',
    CAPTURE_FARE: 'Thanh toán chuyến',
    PAYOUT: 'Rút tiền khỏi ví',
    HOLD_CREATE: 'Tạo lệnh treo tiền',
    HOLD_RELEASE: 'Hoàn lệnh treo tiền',
    ADJUSTMENT: 'Điều chỉnh',
    REFUND: 'Hoàn tiền',
  };

  const transactionStatusLabels: Record<string, string> = {
    COMPLETED: 'Hoàn tất',
    SUCCESS: 'Thành công',
    PENDING: 'Đang xử lý',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
    REVERSED: 'Đã đảo ngược',
  };

  const paymentMethodLabels: Record<string, string> = {
    wallet: 'Ví nội bộ',
    card: 'Thẻ thanh toán',
    bank_transfer: 'Chuyển khoản ngân hàng',
    bank: 'Ngân hàng',
  };

  const systemMasterBalance = dashboardStats?.systemMasterBalance ?? 0;
  const systemCommissionBalance = dashboardStats?.systemCommissionBalance ?? 0;
  const liabilityCoverageGap = dashboardStats?.liabilityCoverageGap ?? 0;
  const coverageLabel = liabilityCoverageGap >= 0 ? 'Hệ thống dư so với người dùng' : 'Hệ thống thiếu so với người dùng';
  const coverageClass = liabilityCoverageGap >= 0 ? 'text-emerald-600' : 'text-red-600';
  const rangeLabel = dateFrom && dateTo ? `${formatDateLabel(dateFrom)} - ${formatDateLabel(dateTo)}` : 'Không có bộ lọc thời gian';
  const handlePresetSelection = (preset: 'today' | 'week' | 'month') => {
    const range = computePresetRange(preset);
    setDatePreset(preset);
    setDateFrom(range.from);
    setDateTo(range.to);
    setPendingFrom(range.from);
    setPendingTo(range.to);
    setCurrentPage(0);
  };

  const handleApplyCustomRange = () => {
    if (!pendingFrom || !pendingTo) {
      toast.error('Vui lòng chọn đủ ngày bắt đầu và kết thúc');
      return;
    }
    if (!isWithinThreeMonths(pendingFrom, pendingTo)) {
      toast.error('Khoảng thời gian không được vượt quá 3 tháng và phải hợp lệ.');
      return;
    }
    setDatePreset('custom');
    setDateFrom(pendingFrom);
    setDateTo(pendingTo);
    setCurrentPage(0);
  };

  return (
    <>
      <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lí tài chính</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi dòng tiền ví nội bộ, kiểm soát nạp/rút và trạng thái các giao dịch tài chính
          </p>
          <p className="text-sm text-gray-500">Khoảng thời gian: {rangeLabel}</p>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-wrap gap-2">
            {(['today', 'week', 'month'] as const).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetSelection(preset)}
                className={`px-3 py-2 text-sm rounded-lg border ${
                  datePreset === preset
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {preset === 'today' && 'Hôm nay'}
                {preset === 'week' && 'Tuần này'}
                {preset === 'month' && 'Tháng này'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Từ</span>
            <input
              type="date"
              className="input-field"
              value={pendingFrom}
              onChange={(e) => {
                setPendingFrom(e.target.value);
                setDatePreset('custom');
              }}
            />
            <span className="text-sm text-gray-500">Đến</span>
            <input
              type="date"
              className="input-field"
              value={pendingTo}
              onChange={(e) => {
                setPendingTo(e.target.value);
                setDatePreset('custom');
              }}
            />
            <button
              onClick={handleApplyCustomRange}
              className="px-3 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
            >
              Áp dụng
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
        {[
          {
            label: 'Tổng số dư ví',
            value: insightsLoading ? 'Đang tải...' : formatCurrencyValue(dashboardStats?.totalWalletBalance),
            icon: BanknotesIcon,
            gradient: 'from-emerald-600 to-teal-600',
            backgroundGradient: 'from-emerald-50 to-teal-100',
            detail: `${numberFormatter.format(dashboardStats?.totalActiveWallets ?? 0)} ví đang hoạt động`,
          },
          {
            label: 'Nạp ví',
            value: insightsLoading ? 'Đang tải...' : formatCurrencyValue(dashboardStats?.totalTopupsToday),
            icon: ArrowDownIcon,
            gradient: 'from-blue-600 to-indigo-600',
            backgroundGradient: 'from-blue-50 to-indigo-100',
            detail: `${numberFormatter.format(dashboardStats?.totalTransactionsToday ?? 0)} giao dịch ghi nhận`,
          },
          {
            label: 'Rút tiền',
            value: insightsLoading ? 'Đang tải...' : formatCurrencyValue(dashboardStats?.totalPayoutsToday),
            icon: ArrowUpIcon,
            gradient: 'from-amber-500 to-orange-500',
            backgroundGradient: 'from-amber-50 to-orange-100',
            detail: `${numberFormatter.format(dashboardStats?.pendingTransactionsCount ?? 0)} yêu cầu đang chờ xử lí`,
          },
          {
            label: 'Hoa hồng tích lũy',
            value: insightsLoading ? 'Đang tải...' : formatCurrencyValue(dashboardStats?.totalCommissionCollected),
            icon: ChartBarIcon,
            gradient: 'from-rose-600 to-red-600',
            backgroundGradient: 'from-rose-50 to-red-100',
            detail: `Số dư trung bình ${formatCurrencyValue(dashboardStats?.avgWalletBalance)}`,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="h-full"
          >
            <StatSummaryCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              gradient={stat.gradient}
              backgroundGradient={stat.backgroundGradient}
              detail={stat.detail}
            />
          </motion.div>
        ))}
      </div>


      {insightsError && (
        <div className="card border border-amber-300 bg-amber-50 text-amber-800">
          {insightsError}
        </div>
      )}

      {(trendData || commissionReport) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {trendData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <ChartBarIcon className="h-5 w-5 text-blue-600" />
                    Xu hướng nạp ví
                  </h2>
                  <p className="text-sm text-gray-500">
                    {insightRange.start && insightRange.end
                      ? `${formatDateLabel(insightRange.start)} - ${formatDateLabel(insightRange.end)}`
                      : '7 ngày gần nhất'}
                  </p>
                </div>
                {insightsLoading && <span className="text-xs text-gray-500">Đang cập nhật...</span>}
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Tổng giá trị</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrencyValue(trendData.totalAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Giá trị trung bình</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrencyValue(trendData.avgTopUpAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phương thức phổ biến</p>
                  <p className="text-base font-medium text-gray-900">
                    {trendData.mostPopularPaymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Tăng trưởng</p>
                  <p className="text-base font-semibold text-emerald-600">
                    {formatGrowthValue(trendData.growthRate)}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span className="flex-1">Ngày</span>
                  <span className="w-32 text-right">Giá trị</span>
                  <span className="w-24 text-right">Lượt</span>
                </div>
                <div className="divide-y divide-gray-100 mt-2">
                  {trendData.dataPoints.slice(-6).map((point) => (
                    <div key={point.date} className="flex items-center py-2 text-sm">
                      <span className="flex-1 text-gray-900">{formatDateLabel(point.date)}</span>
                      <span className="w-32 text-right font-semibold text-gray-900">
                        {formatCurrencyValue(point.amount)}
                      </span>
                      <span className="w-24 text-right text-gray-600">{point.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {commissionReport && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCardIcon className="h-5 w-5 text-rose-500" />
                    Báo cáo hoa hồng
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatDateLabel(commissionReport.periodStart)} - {formatDateLabel(commissionReport.periodEnd)}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-500">Tổng hoa hồng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrencyValue(commissionReport.totalCommission)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Trung bình mỗi chuyến</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrencyValue(commissionReport.avgCommissionPerBooking)}
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>Tài xế</span>
                  <span>Hoa hồng</span>
                </div>
                <div className="divide-y divide-gray-100 mt-2">
                  {commissionReport.driverCommissions.slice(0, 5).map((driver) => (
                    <div key={driver.driverId} className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium text-gray-900">{driver.driverName}</p>
                        <p className="text-xs text-gray-500">
                          {driver.tripCount} chuyến • Thu nhập {formatCurrencyValue(driver.totalEarnings)}
                        </p>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        {formatCurrencyValue(driver.commissionPaid)}
                      </p>
                    </div>
                  ))}
                  {commissionReport.driverCommissions.length === 0 && (
                    <p className="text-sm text-gray-500 py-4 text-center">Chưa có dữ liệu hoa hồng.</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            className="input-field"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">Tất cả loại giao dịch</option>
            <option value="TOPUP">Nạp ví</option>
            <option value="CAPTURE_FARE">Thanh toán chuyến đi</option>
            <option value="PAYOUT">Rút tiền khỏi ví</option>
            <option value="HOLD_CREATE">Tạo lệnh treo tiền</option>
            <option value="HOLD_RELEASE">Hoàn lệnh treo tiền</option>
            <option value="ADJUSTMENT">Điều chỉnh</option>
            <option value="REFUND">Hoàn tiền</option>
          </select>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="FAILED">Thất bại</option>
            <option value="SUCCESS">Thành công</option>
            <option value="REVERSED">Đã đảo ngược</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <select
            className="input-field"
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value as 'all' | 'IN' | 'OUT' | 'INTERNAL')}
          >
            <option value="all">Tất cả dòng tiền</option>
            <option value="IN">Tiền vào</option>
            <option value="OUT">Tiền ra</option>
            <option value="INTERNAL">Điều chuyển</option>
          </select>
        </div>
      </motion.div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="inline-flex rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {[
            { key: 'USER' as const, label: 'Dòng tiền người dùng' },
            { key: 'SYSTEM' as const, label: 'Ví hệ thống' },
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setLedgerView(option.key)}
              className={`px-4 py-2 text-sm font-medium transition ${
                ledgerView === option.key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-500">
          {ledgerView === 'SYSTEM'
            ? 'Theo dõi riêng mọi ghi nhận thuộc ví hệ thống (MASTER, COMMISSION).'
            : 'Quan sát các giao dịch ảnh hưởng trực tiếp tới ví người dùng.'}
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách giao dịch...</p>
        </motion.div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card bg-red-50 border border-red-200"
        >
          <div className="flex items-center">
            <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={loadTransactions}
              className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </motion.div>
      )}

      {/* Transactions Table */}
      {!loading && !error && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giao dịch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {groupedTransactions.map((group) => {
                  const systemWalletNames = Array.from(
                    new Set(
                      group.transactions
                        .map((txn) => txn.systemWallet)
                        .filter((wallet): wallet is string => Boolean(wallet)),
                    ),
                  );
                  return (
                  <React.Fragment key={group.groupId}>
                    <tr className="bg-gray-50 text-sm font-medium text-gray-900">
                      <td colSpan={7} className="px-6 py-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              Nhóm giao dịch {group.groupId}
                            </p>
                            <div className="text-xs text-gray-500 space-x-2">
                              {group.sharedRideId && (
                                <span>Chuyến #{group.sharedRideId}</span>
                              )}
                              {group.sharedRideRequestId && (
                                <span>Yêu cầu #{group.sharedRideRequestId}</span>
                              )}
                              {group.startedAt && (
                                <span>Bắt đầu {formatDateTime(group.startedAt)}</span>
                              )}
                              {group.finishedAt && group.finishedAt !== group.startedAt && (
                                <span>Kết thúc {formatDateTime(group.finishedAt)}</span>
                              )}
                              {ledgerView === 'SYSTEM' && systemWalletNames.length > 0 && (
                                <span>Ví hệ thống: {systemWalletNames.join(', ')}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-600">
                            <div className="font-semibold text-emerald-600">
                              Tiền vào: {formatCurrencyValue(group.totalIn)}
                            </div>
                            <div className="font-semibold text-red-600">
                              Tiền ra: {formatCurrencyValue(group.totalOut)}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    {group.transactions.map((transaction) => (
                  <tr key={transaction.txnId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div className="text-sm font-medium text-gray-900">#{transaction.txnId}</div>
                        <div className="text-xs font-mono text-gray-600 break-all">Nhóm: {transaction.groupId}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.note || transactionTypeLabels[transaction.type] || transactionService.getTransactionTypeDisplay(transaction.type)}
                        </div>
                        {transaction.systemWallet && (
                          <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">
                            Ví hệ thống: {transaction.systemWallet}
                          </div>
                        )}
                        {transaction.sharedRideId && (
                          <div className="text-xs text-gray-500">
                            Chuyến chia sẻ #{transaction.sharedRideId}
                          </div>
                        )}
                        {transaction.sharedRideRequestId && (
                          <div className="text-xs text-gray-500">
                            Yêu cầu #{transaction.sharedRideRequestId}
                          </div>
                        )}
                      <div className="text-xs text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString('vi-VN')} lúc{' '}
                          {new Date(transaction.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        {(() => {
                          const actorId = transaction.actorUserId;
                          const userProfile = actorId ? userProfiles[actorId] : undefined;
                          const avatarUrl = userProfile?.profilePhotoUrl;
                          const displayName =
                            userProfile?.fullName ||
                            transaction.actorUsername ||
                            (actorId ? `Người dùng ${actorId}` : 'Hệ thống');
                          const initials = userProfile
                            ? userProfileService.getAvatarInitials(userProfile.fullName)
                            : (transaction.actorUsername?.split(' ').map((n) => n[0]).join('') || 'HT');

                          return (
                            <>
                              {avatarUrl ? (
                                <img
                                  className="h-8 w-8 rounded-full object-cover"
                                  src={avatarUrl}
                                  alt={displayName}
                                  onError={(e) => {
                                    // Fallback to initials if image fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    const fallback = target.nextElementSibling as HTMLElement;
                                    if (fallback) fallback.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div
                                className={`h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}
                                style={{ display: avatarUrl ? 'none' : 'flex' }}
                              >
                        <span className="text-xs font-medium text-gray-600">
                                  {initials}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                                  {displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                                  {transaction.actorUserId ? `Mã người dùng: ${transaction.actorUserId}` : 'Hệ thống'}
                                </div>
                        </div>
                            </>
                          );
                        })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        {getTypeIcon(transaction.type)}
                        <span className="ml-2 text-sm text-gray-900">
                          {transactionTypeLabels[transaction.type] || transactionService.getTransactionTypeDisplay(transaction.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(() => {
                      const amountClass =
                        transaction.direction === 'OUT'
                          ? 'text-red-600'
                          : transaction.direction === 'IN'
                          ? 'text-green-600'
                          : 'text-blue-600';
                      const prefix =
                        transaction.direction === 'OUT'
                          ? '-'
                          : transaction.direction === 'IN'
                          ? '+'
                          : '';
                      return (
                        <div>
                          <div className={`text-sm font-medium ${amountClass}`}>
                            {prefix}
                            {transactionService.formatAmount(transaction.amount, transaction.currency)}
                          </div>
                          {transaction.direction === 'INTERNAL' && (
                            <p className="text-xs text-gray-500">Dòng tiền nội bộ</p>
                          )}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMethodBadge(transaction.pspRef ? 'card' : 'wallet')}`}>
                        {transaction.pspRef ? paymentMethodLabels.card : paymentMethodLabels.wallet}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                          {transactionStatusLabels[transaction.status] || transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Xem chi tiết giao dịch"
                        >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                        {transaction.type === 'PAYOUT' && transaction.status === 'PENDING' && (
                        <>
                          <button
                              onClick={() => handleApproveWithdrawal(transaction.txnId)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Phê duyệt rút tiền"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                              onClick={() => handleRejectWithdrawal(transaction.txnId)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Từ chối rút tiền"
                          >
                            <XCircleIcon className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.total_pages}
            totalRecords={pagination.total_records}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={loading}
            pageSizeOptions={[5, 10, 25, 50]}
          />

          {groupedTransactions.length === 0 && !loading && (
          <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy giao dịch phù hợp tiêu chí lọc.</p>
          </div>
        )}
      </motion.div>
      )}
      </div>

    {/* Transaction Details Modal */}
    {showDetailsModal && selectedTransaction && (
      <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={handleCloseDetailsModal} />

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">
                        Chi tiết giao dịch
                      </h3>
                      <button
                        onClick={handleCloseDetailsModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                    {/* Transaction Info */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <CreditCardIcon className="h-5 w-5 mr-2 text-blue-500" />
                        Thông tin giao dịch
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Mã giao dịch</p>
                          <p className="text-base font-medium text-gray-900">#{selectedTransaction.txnId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Mã nhóm</p>
                          <p className="text-xs font-mono text-gray-900 break-all">{selectedTransaction.groupId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loại</p>
                          <p className="text-base font-medium text-gray-900">
                            {transactionTypeLabels[selectedTransaction.type] || transactionService.getTransactionTypeDisplay(selectedTransaction.type)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedTransaction.status)}`}>
                            {transactionStatusLabels[selectedTransaction.status] || selectedTransaction.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Số tiền</p>
                          <p
                            className={`text-lg font-bold ${
                              selectedTransaction.direction === 'OUT'
                                ? 'text-red-600'
                                : selectedTransaction.direction === 'IN'
                                ? 'text-green-600'
                                : 'text-blue-600'
                            }`}
                          >
                            {selectedTransaction.direction === 'OUT'
                              ? '-'
                              : selectedTransaction.direction === 'IN'
                              ? '+'
                              : ''}
                            {transactionService.formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Dòng tiền</p>
                          <p className="text-base font-medium text-gray-900">
                            {transactionService.getTransactionDirectionDisplay(selectedTransaction.direction).text}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loại chủ thể</p>
                          <p className="text-base font-medium text-gray-900">{selectedTransaction.actorKind}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Nguồn tiền</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedTransaction.systemWallet ? `SYSTEM.${selectedTransaction.systemWallet}` : 'Ví người dùng'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedTransaction.pspRef ? paymentMethodLabels.card : paymentMethodLabels.wallet}
                          </p>
                        </div>
                        {selectedTransaction.pspRef && (
                          <div>
                            <p className="text-sm text-gray-500">Mã tham chiếu PSP</p>
                            <p className="text-xs font-mono text-gray-900 break-all">{selectedTransaction.pspRef}</p>
                          </div>
                        )}
                        {selectedTransaction.sharedRideId && (
                          <div>
                            <p className="text-sm text-gray-500">Chuyến chia sẻ</p>
                            <p className="text-base font-medium text-gray-900">#{selectedTransaction.sharedRideId}</p>
                          </div>
                        )}
                        {selectedTransaction.sharedRideRequestId && (
                          <div>
                            <p className="text-sm text-gray-500">Yêu cầu đặt xe</p>
                            <p className="text-base font-medium text-gray-900">#{selectedTransaction.sharedRideRequestId}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <UsersIcon className="h-5 w-5 mr-2 text-green-500" />
                        Thông tin người dùng
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Chủ thể thực hiện</p>
                          <div className="flex items-center mt-1">
                            {(() => {
                              const actorId = selectedTransaction.actorUserId;
                              const userProfile = actorId ? userProfiles[actorId] : undefined;
                              const avatarUrl = userProfile?.profilePhotoUrl;
                              const displayName =
                                userProfile?.fullName ||
                                selectedTransaction.actorUsername ||
                                (actorId ? `Người dùng ${actorId}` : 'Hệ thống');
                              const initials = userProfile
                                ? userProfileService.getAvatarInitials(userProfile.fullName)
                                : (selectedTransaction.actorUsername?.split(' ').map((n) => n[0]).join('') || 'HT');

                              return (
                                <>
                                  {avatarUrl ? (
                                    <img
                                      className="h-8 w-8 rounded-full object-cover"
                                      src={avatarUrl}
                                      alt={displayName}
                                      onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center ${avatarUrl ? 'hidden' : 'flex'}`}
                                    style={{ display: avatarUrl ? 'none' : 'flex' }}
                                  >
                                    <span className="text-xs font-medium text-gray-600">{initials}</span>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-base font-medium text-gray-900">{displayName}</p>
                                    <p className="text-sm text-gray-500">
                                      {actorId ? `Mã người dùng: ${actorId}` : 'Hệ thống'}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Loại chủ thể</p>
                          <p className="text-base font-medium text-gray-900">{selectedTransaction.actorKind}</p>
                          <p className="text-xs text-gray-500">
                            {transactionService.getTransactionDirectionDisplay(selectedTransaction.direction).text}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Thông tin thêm</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedTransaction.systemWallet ? `SYSTEM.${selectedTransaction.systemWallet}` : 'Ví người dùng'}
                          </p>
                        </div>
                      </div>
          </div>
        </div>

                    {/* Balances */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <BanknotesIcon className="h-5 w-5 mr-2 text-amber-600" />
                        Biến động số dư
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedTransaction.beforeAvail !== null && typeof selectedTransaction.beforeAvail !== 'undefined' && (
                          <div>
                            <p className="text-sm text-gray-500">Số dư khả dụng trước</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.beforeAvail!, selectedTransaction.currency)}</p>
                          </div>
                        )}
                        {selectedTransaction.afterAvail !== null && typeof selectedTransaction.afterAvail !== 'undefined' && (
                          <div>
                            <p className="text-sm text-gray-500">Số dư khả dụng sau</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.afterAvail!, selectedTransaction.currency)}</p>
                          </div>
                        )}
                        {selectedTransaction.beforePending !== null && typeof selectedTransaction.beforePending !== 'undefined' && (
                <div>
                            <p className="text-sm text-gray-500">Số dư treo trước</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.beforePending!, selectedTransaction.currency)}</p>
                </div>
                        )}
                        {selectedTransaction.afterPending !== null && typeof selectedTransaction.afterPending !== 'undefined' && (
                          <div>
                            <p className="text-sm text-gray-500">Số dư treo sau</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.afterPending!, selectedTransaction.currency)}</p>
              </div>
                        )}
          </div>
        </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-purple-500" />
                        Thời gian
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Tạo lúc</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(selectedTransaction.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        {selectedTransaction.updatedAt && (
                <div>
                            <p className="text-sm text-gray-500">Cập nhật lúc</p>
                            <p className="text-base font-medium text-gray-900">
                              {new Date(selectedTransaction.updatedAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        )}
                        {selectedTransaction.note && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Ghi chú</p>
                            <p className="text-base font-medium text-gray-900">{selectedTransaction.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseDetailsModal}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
      )}
    </>
  );
}
