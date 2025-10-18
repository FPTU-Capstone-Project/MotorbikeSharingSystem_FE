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
} from '@heroicons/react/24/outline';
import { transactionService, TransactionResponse, TransactionStats } from '../services/transactionService';
import { userProfileService, UserProfileMap } from '../services/userProfileService';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

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
      setError('Failed to load transactions');
      toast.error('Failed to load transactions');
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
    toast.success('Withdrawal approved successfully');
    loadTransactions(); // Reload data
  };

  const handleRejectWithdrawal = (transactionId: number) => {
    // This would typically call an API to reject the withdrawal
    toast.success('Withdrawal rejected');
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

  // Calculate stats from current data
  const totalRevenue = stats?.totalRevenue || 0;
  const totalDeposits = stats?.totalDeposits || 0;
  const pendingWithdrawals = stats?.pendingTransactions || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="mt-2 text-gray-600">
            Monitor transactions, deposits, withdrawals, and payment processing
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { 
            label: 'Total Revenue', 
            value: `${totalRevenue.toLocaleString()}đ`, 
            color: 'bg-green-500',
            icon: BanknotesIcon,
            change: '+12.5%'
          },
          { 
            label: 'Total Deposits', 
            value: `${totalDeposits.toLocaleString()}đ`, 
            color: 'bg-blue-500',
            icon: ArrowDownIcon,
            change: '+8.3%'
          },
          { 
            label: 'Pending Withdrawals', 
            value: `${pendingWithdrawals.toLocaleString()}đ`, 
            color: 'bg-yellow-500',
            icon: ArrowUpIcon,
            change: '3 requests'
          },
          { 
            label: 'Failed Transactions', 
            value: stats?.failedTransactions || 0,
            color: 'bg-red-500',
            icon: XCircleIcon,
            change: '-2 from yesterday'
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.color} shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.change}</p>
              </div>
            </div>
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
            <option value="all">All Types</option>
            <option value="TOPUP">Wallet Top-up</option>
            <option value="RIDE_CAPTURE">Ride Payments</option>
            <option value="PAYOUT">Driver Payouts</option>
            <option value="RIDE_HOLD">Payment Holds</option>
            <option value="RIDE_REFUND">Refunds</option>
          </select>
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
          <select
            className="input-field"
            value={filterDirection}
            onChange={(e) => setFilterDirection(e.target.value as 'all' | 'IN' | 'OUT')}
          >
            <option value="all">All Directions</option>
            <option value="IN">Credits</option>
            <option value="OUT">Debits</option>
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
          <p className="mt-4 text-gray-600">Loading transactions...</p>
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
              Retry
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
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.txnId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div className="text-sm font-medium text-gray-900">#{transaction.txnId}</div>
                        <div className="text-xs font-mono text-gray-600 break-all">Group: {transaction.groupId}</div>
                        <div className="text-sm text-gray-500">{transaction.description || transactionService.getTransactionTypeDisplay(transaction.type)}</div>
                      <div className="text-xs text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString()} at{' '}
                          {new Date(transaction.createdAt).toLocaleTimeString([], {
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
                          const displayName = userProfile?.fullName || transaction.actorUsername || `User ${transaction.actorUserId}`;
                          const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (transaction.actorUsername?.split(' ').map(n => n[0]).join('') || 'U');

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
                                  ID: {transaction.actorUserId}
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
                          {transactionService.getTransactionTypeDisplay(transaction.type)}
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
                        {transaction.pspRef ? 'External' : 'Wallet'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(transaction.status)}`}>
                          {transaction.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(transaction)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View transaction details"
                        >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                        {transaction.type === 'PAYOUT' && transaction.status === 'PENDING' && (
                        <>
                          <button
                              onClick={() => handleApproveWithdrawal(transaction.txnId)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                          >
                          </button>
                          <button
                              onClick={() => handleRejectWithdrawal(transaction.txnId)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
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
              <p className="text-gray-500">No transactions found matching your criteria.</p>
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
                        Transaction Details
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
                        Transaction Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Transaction ID</p>
                          <p className="text-base font-medium text-gray-900">#{selectedTransaction.txnId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Group ID</p>
                          <p className="text-xs font-mono text-gray-900 break-all">{selectedTransaction.groupId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Type</p>
                          <p className="text-base font-medium text-gray-900">{transactionService.getTransactionTypeDisplay(selectedTransaction.type)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Status</p>
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(selectedTransaction.status)}`}>
                            {selectedTransaction.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className={`text-lg font-bold ${selectedTransaction.direction === 'OUT' ? 'text-red-600' : 'text-green-600'}`}>
                            {selectedTransaction.direction === 'OUT' ? '-' : '+'}
                            {transactionService.formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Direction</p>
                          <p className="text-base font-medium text-gray-900">{selectedTransaction.direction === 'IN' ? 'Credit' : 'Debit'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Actor Kind</p>
                          <p className="text-base font-medium text-gray-900">{selectedTransaction.actorKind}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Payment Method</p>
                          <p className="text-base font-medium text-gray-900">{selectedTransaction.pspRef ? 'External Payment' : 'Wallet'}</p>
                        </div>
                        {selectedTransaction.systemWallet && (
                          <div>
                            <p className="text-sm text-gray-500">System Wallet</p>
                            <p className="text-base font-medium text-gray-900">{selectedTransaction.systemWallet}</p>
                          </div>
                        )}
                        {selectedTransaction.bookingId && (
                          <div>
                            <p className="text-sm text-gray-500">Booking ID</p>
                            <p className="text-base font-medium text-gray-900">{selectedTransaction.bookingId}</p>
                          </div>
                        )}
                        {selectedTransaction.pspRef && (
                          <div>
                            <p className="text-sm text-gray-500">PSP Reference</p>
                            <p className="text-xs font-mono text-gray-900 break-all">{selectedTransaction.pspRef}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* User Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <UsersIcon className="h-5 w-5 mr-2 text-green-500" />
                        User Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                          <p className="text-sm text-gray-500">Actor User</p>
                          <div className="flex items-center mt-1">
                            {(() => {
                              const userProfile = userProfiles[selectedTransaction.actorUserId];
                              const avatarUrl = userProfile?.profilePhotoUrl;
                              const displayName = userProfile?.fullName || selectedTransaction.actorUsername || `User ${selectedTransaction.actorUserId}`;
                              const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (selectedTransaction.actorUsername?.split(' ').map(n => n[0]).join('') || 'U');

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
                                    <p className="text-sm text-gray-500">ID: {selectedTransaction.actorUserId}</p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                </div>

                        {selectedTransaction.riderUserId && (
                          <div>
                            <p className="text-sm text-gray-500">Rider</p>
                            <div className="flex items-center mt-1">
                              {(() => {
                                const userProfile = userProfiles[selectedTransaction.riderUserId!];
                                const avatarUrl = userProfile?.profilePhotoUrl;
                                const displayName = userProfile?.fullName || selectedTransaction.riderUsername || `User ${selectedTransaction.riderUserId}`;
                                const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (selectedTransaction.riderUsername?.split(' ').map(n => n[0]).join('') || 'U');

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
                                      <p className="text-sm text-gray-500">ID: {selectedTransaction.riderUserId}</p>
                                    </div>
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        )}

                        {selectedTransaction.driverUserId && (
                          <div>
                            <p className="text-sm text-gray-500">Driver</p>
                            <div className="flex items-center mt-1">
                              {(() => {
                                const userProfile = userProfiles[selectedTransaction.driverUserId!];
                                const avatarUrl = userProfile?.profilePhotoUrl;
                                const displayName = userProfile?.fullName || selectedTransaction.driverUsername || `User ${selectedTransaction.driverUserId}`;
                                const initials = userProfile ? userProfileService.getAvatarInitials(userProfile.fullName) : (selectedTransaction.driverUsername?.split(' ').map(n => n[0]).join('') || 'U');

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
                                      <p className="text-sm text-gray-500">ID: {selectedTransaction.driverUserId}</p>
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
                        Balances
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {selectedTransaction.beforeAvail !== null && typeof selectedTransaction.beforeAvail !== 'undefined' && (
                          <div>
                            <p className="text-sm text-gray-500">Before Available</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.beforeAvail!, selectedTransaction.currency)}</p>
                          </div>
                        )}
                        {selectedTransaction.afterAvail !== null && typeof selectedTransaction.afterAvail !== 'undefined' && (
                          <div>
                            <p className="text-sm text-gray-500">After Available</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.afterAvail!, selectedTransaction.currency)}</p>
                          </div>
                        )}
                        {selectedTransaction.beforePending !== null && typeof selectedTransaction.beforePending !== 'undefined' && (
                <div>
                            <p className="text-sm text-gray-500">Before Pending</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.beforePending!, selectedTransaction.currency)}</p>
                </div>
                        )}
                        {selectedTransaction.afterPending !== null && typeof selectedTransaction.afterPending !== 'undefined' && (
                          <div>
                            <p className="text-sm text-gray-500">After Pending</p>
                            <p className="text-base font-medium text-gray-900">{transactionService.formatAmount(selectedTransaction.afterPending!, selectedTransaction.currency)}</p>
              </div>
                        )}
          </div>
        </div>

                    {/* Timestamps */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <ClockIcon className="h-5 w-5 mr-2 text-purple-500" />
                        Timestamps
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Created At</p>
                          <p className="text-base font-medium text-gray-900">
                            {new Date(selectedTransaction.createdAt).toLocaleString()}
                          </p>
                        </div>
                        {selectedTransaction.updatedAt && (
                <div>
                            <p className="text-sm text-gray-500">Updated At</p>
                            <p className="text-base font-medium text-gray-900">
                              {new Date(selectedTransaction.updatedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                        {(selectedTransaction.note || selectedTransaction.description) && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-500">Note</p>
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
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}