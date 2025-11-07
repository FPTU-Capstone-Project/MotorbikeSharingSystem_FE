import React, { useState, useEffect } from 'react';
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
} from '@heroicons/react/24/outline';
import { transactionService, TransactionResponse, TransactionStats } from '../services/transactionService';
import { userProfileService, UserProfileMap } from '../services/userProfileService';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import StatSummaryCard from '../components/StatSummaryCard';

const currencyFormatter = new Intl.NumberFormat('vi-VN');
const numberFormatter = new Intl.NumberFormat();

export default function PaymentManagement() {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([]);
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | string>('all');
  const [filterDirection, setFilterDirection] = useState<'all' | 'IN' | 'OUT'>('all');
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

  // Load transactions on component mount
  useEffect(() => {
    loadTransactions();
    loadStats();
  }, [currentPage, pageSize, filterType, filterStatus, filterDirection]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters = {
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc' as const,
        ...(filterType !== 'all' && { type: filterType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterDirection !== 'all' && { direction: filterDirection }),
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

  const loadStats = async () => {
    try {
      const transactionStats = await transactionService.getTransactionStats();
      setStats(transactionStats);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Load user profiles for transactions
  const loadUserProfiles = async (transactions: TransactionResponse[]) => {
    try {
      // Extract unique user IDs from transactions
      const userIds = new Set<number>();
      transactions.forEach(transaction => {
        if (transaction.actorUserId) userIds.add(transaction.actorUserId);
        if (transaction.riderUserId) userIds.add(transaction.riderUserId);
        if (transaction.driverUserId) userIds.add(transaction.driverUserId);
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

  // Since we're using server-side filtering, we don't need client-side filtering
  const filteredTransactions = transactions;

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
      case 'RIDE_CAPTURE':
        return <CreditCardIcon className="h-5 w-5 text-purple-500" />;
      case 'RIDE_HOLD':
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
    RIDE_CAPTURE: 'Thanh toán chuyến',
    PAYOUT: 'Chi trả tài xế',
    RIDE_HOLD: 'Tạm giữ thanh toán',
    RIDE_REFUND: 'Hoàn tiền chuyến',
  };

  const transactionStatusLabels: Record<string, string> = {
    COMPLETED: 'Hoàn tất',
    SUCCESS: 'Thành công',
    PENDING: 'Đang xử lý',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
  };

  const paymentMethodLabels: Record<string, string> = {
    wallet: 'Ví nội bộ',
    card: 'Thẻ thanh toán',
    bank_transfer: 'Chuyển khoản ngân hàng',
    bank: 'Ngân hàng',
  };

  // Calculate stats from current data
  const totalRevenue = stats?.totalRevenue || 0;
  const totalDeposits = stats?.totalDeposits || 0;
  const pendingWithdrawals = stats?.pendingTransactions || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi giao dịch, nạp tiền, rút tiền và quá trình xử lý thanh toán
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
      {
            label: 'Tổng doanh thu',
            value: `${currencyFormatter.format(totalRevenue)}đ`,
            icon: BanknotesIcon,
            gradient: 'from-emerald-600 to-teal-600',
            backgroundGradient: 'from-emerald-50 to-teal-100',
            detail: 'Đã hoàn tất chi trả & thu cước chuyến đi',
            change: '+12.5%',
            changeDirection: 'increase' as const,
          },
          {
            label: 'Tổng số tiền nạp',
            value: `${currencyFormatter.format(totalDeposits)}đ`,
            icon: ArrowDownIcon,
            gradient: 'from-blue-600 to-indigo-600',
            backgroundGradient: 'from-blue-50 to-indigo-100',
            detail: 'Các lượt nạp ví đã xử lý',
            change: '+8.3%',
            changeDirection: 'increase' as const,
          },
          {
            label: 'Rút tiền chờ duyệt',
            value: `${currencyFormatter.format(pendingWithdrawals)}đ`,
            icon: ArrowUpIcon,
            gradient: 'from-amber-500 to-orange-500',
            backgroundGradient: 'from-amber-50 to-orange-100',
            detail: '3 yêu cầu đang chờ phê duyệt',
          },
          {
            label: 'Giao dịch thất bại',
            value: numberFormatter.format(stats?.failedTransactions || 0),
            icon: XCircleIcon,
            gradient: 'from-rose-600 to-red-600',
            backgroundGradient: 'from-rose-50 to-red-100',
            detail: 'Trong 24 giờ gần nhất',
            change: '-2',
            changeDirection: 'decrease' as const,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatSummaryCard
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              gradient={stat.gradient}
              backgroundGradient={stat.backgroundGradient}
              detail={stat.detail}
              change={stat.change}
              changeDirection={stat.changeDirection}
            />
          </motion.div>
        ))}
      </div>

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
            <option value="RIDE_CAPTURE">Thanh toán chuyến đi</option>
            <option value="PAYOUT">Chi trả cho tài xế</option>
            <option value="RIDE_HOLD">Tạm giữ thanh toán</option>
            <option value="RIDE_REFUND">Hoàn tiền</option>
          </select>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="COMPLETED">Hoàn tất</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="FAILED">Thất bại</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>
          <select
            className="input-field"
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value as 'all' | 'IN' | 'OUT')}
          >
            <option value="all">Tất cả dòng tiền</option>
            <option value="IN">Tiền vào</option>
            <option value="OUT">Tiền ra</option>
          </select>
        </div>
      </motion.div>

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
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.txnId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div className="text-sm font-medium text-gray-900">#{transaction.txnId}</div>
                        <div className="text-xs font-mono text-gray-600 break-all">Nhóm: {transaction.groupId}</div>
                        <div className="text-sm text-gray-500">
                          {transaction.description || transactionTypeLabels[transaction.type] || transactionService.getTransactionTypeDisplay(transaction.type)}
                        </div>
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
                          const userProfile = userProfiles[transaction.actorUserId];
                          const avatarUrl = userProfile?.profilePhotoUrl;
                          const displayName = userProfile?.fullName || transaction.actorUsername || `Người dùng ${transaction.actorUserId}`;
                          const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (transaction.actorUsername?.split(' ').map(n => n[0]).join('') || 'ND');

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
                                  Mã người dùng: {transaction.actorUserId}
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
                      <div className={`text-sm font-medium ${transaction.direction === 'OUT' ? 'text-red-600' : 'text-green-600'
                    }`}>
                        {transaction.direction === 'OUT' ? '-' : '+'}
                        {transactionService.formatAmount(transaction.amount, transaction.currency)}
                    </div>
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

          {filteredTransactions.length === 0 && !loading && (
          <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy giao dịch phù hợp tiêu chí lọc.</p>
          </div>
        )}
      </motion.div>
      )}

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
                          <p className={`text-lg font-bold ${selectedTransaction.direction === 'OUT' ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedTransaction.direction === 'OUT' ? '-' : '+'}
                            {transactionService.formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Dòng tiền</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedTransaction.direction === 'IN' ? 'Tiền vào' : 'Tiền ra'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Kiểu người thực hiện</p>
                          <p className="text-base font-medium text-gray-900">{selectedTransaction.actorKind}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Phương thức thanh toán</p>
                          <p className="text-base font-medium text-gray-900">
                            {selectedTransaction.pspRef ? paymentMethodLabels.card : paymentMethodLabels.wallet}
                          </p>
                        </div>
                        {selectedTransaction.systemWallet && (
                          <div>
                            <p className="text-sm text-gray-500">Ví hệ thống</p>
                            <p className="text-base font-medium text-gray-900">{selectedTransaction.systemWallet}</p>
                          </div>
                        )}
                        {selectedTransaction.bookingId && (
                          <div>
                            <p className="text-sm text-gray-500">Mã đặt chuyến</p>
                            <p className="text-base font-medium text-gray-900">{selectedTransaction.bookingId}</p>
                          </div>
                        )}
                        {selectedTransaction.pspRef && (
                          <div>
                            <p className="text-sm text-gray-500">Mã tham chiếu PSP</p>
                            <p className="text-xs font-mono text-gray-900 break-all">{selectedTransaction.pspRef}</p>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                          <p className="text-sm text-gray-500">Người thực hiện</p>
                          <div className="flex items-center mt-1">
                            {(() => {
                              const userProfile = userProfiles[selectedTransaction.actorUserId];
                              const avatarUrl = userProfile?.profilePhotoUrl;
                              const displayName = userProfile?.fullName || selectedTransaction.actorUsername || `Người dùng ${selectedTransaction.actorUserId}`;
                              const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (selectedTransaction.actorUsername?.split(' ').map(n => n[0]).join('') || 'ND');

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
                                    <span className="text-xs font-medium text-gray-600">
                                      {initials}
                                    </span>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-base font-medium text-gray-900">{displayName}</p>
                                    <p className="text-sm text-gray-500">Mã người dùng: {selectedTransaction.actorUserId}</p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                </div>

                        {selectedTransaction.riderUserId && (
                          <div>
                            <p className="text-sm text-gray-500">Hành khách</p>
                            <div className="flex items-center mt-1">
                              {(() => {
                                const userProfile = userProfiles[selectedTransaction.riderUserId!];
                                const avatarUrl = userProfile?.profilePhotoUrl;
                                const displayName = userProfile?.fullName || selectedTransaction.riderUsername || `Người dùng ${selectedTransaction.riderUserId}`;
                                const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (selectedTransaction.riderUsername?.split(' ').map(n => n[0]).join('') || 'ND');

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
                                      <span className="text-xs font-medium text-gray-600">
                                        {initials}
                                      </span>
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-base font-medium text-gray-900">{displayName}</p>
                                      <p className="text-sm text-gray-500">Mã người dùng: {selectedTransaction.riderUserId}</p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {selectedTransaction.driverUserId && (
                          <div>
                            <p className="text-sm text-gray-500">Tài xế</p>
                            <div className="flex items-center mt-1">
                              {(() => {
                                const userProfile = userProfiles[selectedTransaction.driverUserId!];
                                const avatarUrl = userProfile?.profilePhotoUrl;
                                const displayName = userProfile?.fullName || selectedTransaction.driverUsername || `Người dùng ${selectedTransaction.driverUserId}`;
                                const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (selectedTransaction.driverUsername?.split(' ').map(n => n[0]).join('') || 'ND');

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
                                      <span className="text-xs font-medium text-gray-600">
                                        {initials}
                                      </span>
                                    </div>
                                    <div className="ml-3">
                                      <p className="text-base font-medium text-gray-900">{displayName}</p>
                                      <p className="text-sm text-gray-500">Mã người dùng: {selectedTransaction.driverUserId}</p>
                                    </div>
                                  </>
                                );
                              })()}
                </div>
              </div>
                        )}
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
                        {(selectedTransaction.note || selectedTransaction.description) && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Ghi chú</p>
                            <p className="text-base font-medium text-gray-900">{selectedTransaction.note || selectedTransaction.description}</p>
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
        </div>
      )}
    </div>
  );
}
