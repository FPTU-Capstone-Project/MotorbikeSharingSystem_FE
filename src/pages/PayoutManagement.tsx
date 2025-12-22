import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpIcon,
  ClockIcon,
  XCircleIcon,
  CheckCircleIcon,
  EyeIcon,
  DocumentArrowUpIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { walletService, PayoutProcessResponse } from '../services/walletService';
import { transactionService, TransactionResponse } from '../services/transactionService';
import { formatDateTime } from '../utils/dateUtils';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';

const currencyFormatter = new Intl.NumberFormat('vi-VN');

const formatCurrency = (value: number): string => {
  return `${currencyFormatter.format(value)}đ`;
};

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    PROCESSING: 'bg-blue-100 text-blue-800',
    COMPLETED: 'bg-green-100 text-green-800',
    SUCCESS: 'bg-green-100 text-green-800',
    FAILED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
  };
  return styles[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    COMPLETED: 'Hoàn thành',
    SUCCESS: 'Thành công',
    FAILED: 'Thất bại',
    CANCELLED: 'Đã hủy',
  };
  return labels[status] || status;
};

// Helper function to extract bank info from transaction note
const extractBankInfoFromNote = (note: string | undefined) => {
  if (!note) {
    return {
      bankName: '',
      maskedAccountNumber: '',
      accountHolderName: '',
    };
  }

  // Format: "Payout to {bank} - {masked} ({holder}) [BIN:xxx] | bankBin:xxx | bankAccountNumber:xxx | bankName:xxx | accountHolderName:xxx"
  let bankName = '';
  let maskedAccountNumber = '';
  let accountHolderName = '';

  // Try to extract from formatted string: "Payout to {bank} - {masked} ({holder})"
  if (note.startsWith('Payout to ')) {
    const dashIndex = note.indexOf(' - ');
    const parenIndex = note.indexOf(' (');
    const closeParen = note.indexOf(')');

    if (dashIndex > 0) {
      bankName = note.substring(10, dashIndex).trim();
    }
    if (dashIndex > 0 && parenIndex > dashIndex) {
      maskedAccountNumber = note.substring(dashIndex + 3, parenIndex).trim();
    }
    if (parenIndex > 0 && closeParen > parenIndex) {
      accountHolderName = note.substring(parenIndex + 2, closeParen).trim();
    }
  }

  // Also try to extract from pipe-separated format
  const parts = note.split(' | ');
  parts.forEach((part) => {
    if (part.startsWith('bankName:')) {
      bankName = bankName || part.substring(9).trim();
    } else if (part.startsWith('accountHolderName:')) {
      accountHolderName = accountHolderName || part.substring(18).trim();
    }
  });

  return {
    bankName: bankName || 'N/A',
    maskedAccountNumber: maskedAccountNumber || 'N/A',
    accountHolderName: accountHolderName || 'N/A',
  };
};

// Map TransactionResponse to PendingPayoutResponse-like structure
interface PayoutDisplayData {
  payoutRef: string;
  amount: number;
  bankName: string;
  maskedAccountNumber: string;
  accountHolderName: string;
  userEmail: string;
  userId: number | undefined;
  status: string;
  requestedAt: string;
  txnId: number;
  groupId: string;
}

export default function PayoutManagement() {
  const [payouts, setPayouts] = useState<PayoutDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PayoutDisplayData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [processingPayoutRef, setProcessingPayoutRef] = useState<string | null>(null);
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');
  const [failReason, setFailReason] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({
    page: 0,
    page_size: 10,
    total_pages: 0,
    total_records: 0,
  });

  useEffect(() => {
    loadPayouts();
  }, [currentPage, pageSize]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await transactionService.getAllTransactions({
        page: currentPage,
        size: pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc',
        type: 'PAYOUT',
        actorKind: 'USER',
      });

      // Map TransactionResponse to PayoutDisplayData
      const mappedPayouts: PayoutDisplayData[] = response.data.map((txn: TransactionResponse) => {
        const bankInfo = extractBankInfoFromNote(txn.note);
        return {
          payoutRef: txn.pspRef || `TXN-${txn.txnId}`,
          amount: txn.amount || 0,
          bankName: bankInfo.bankName,
          maskedAccountNumber: bankInfo.maskedAccountNumber,
          accountHolderName: bankInfo.accountHolderName,
          userEmail: txn.actorUsername || `user${txn.actorUserId}`,
          userId: txn.actorUserId,
          status: txn.status,
          requestedAt: txn.createdAt,
          txnId: txn.txnId,
          groupId: txn.groupId || '',
        };
      });

      setPayouts(mappedPayouts);
      setPagination(response.pagination);
    } catch (err: any) {
      console.error('Error loading payouts:', err);
      setError('Không thể tải danh sách yêu cầu rút tiền');
      toast.error('Không thể tải danh sách yêu cầu rút tiền');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async (payoutRef: string) => {
    try {
      setProcessingPayoutRef(payoutRef);
      await walletService.processPayout(payoutRef);
      toast.success('Đã đánh dấu yêu cầu rút tiền đang xử lý');
      await loadPayouts();
      setShowProcessModal(false);
      setProcessingPayoutRef(null);
    } catch (err: any) {
      console.error('Error processing payout:', err);
      toast.error(err.message || 'Không thể đánh dấu yêu cầu rút tiền đang xử lý');
      setProcessingPayoutRef(null);
    }
  };

  const handleCompletePayout = async () => {
    if (!selectedPayout || !evidenceFile) {
      toast.error('Vui lòng chọn file bằng chứng');
      return;
    }

    try {
      setProcessingPayoutRef(selectedPayout.payoutRef);
      await walletService.completePayout(selectedPayout.payoutRef, evidenceFile, notes);
      toast.success('Đã hoàn thành yêu cầu rút tiền');
      await loadPayouts();
      setShowCompleteModal(false);
      setSelectedPayout(null);
      setEvidenceFile(null);
      setNotes('');
      setProcessingPayoutRef(null);
    } catch (err: any) {
      console.error('Error completing payout:', err);
      toast.error(err.message || 'Không thể hoàn thành yêu cầu rút tiền');
      setProcessingPayoutRef(null);
    }
  };

  const handleFailPayout = async () => {
    if (!selectedPayout || !failReason.trim()) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }

    try {
      setProcessingPayoutRef(selectedPayout.payoutRef);
      await walletService.failPayout(selectedPayout.payoutRef, failReason);
      toast.success('Đã từ chối yêu cầu rút tiền');
      await loadPayouts();
      setShowFailModal(false);
      setSelectedPayout(null);
      setFailReason('');
      setProcessingPayoutRef(null);
    } catch (err: any) {
      console.error('Error failing payout:', err);
      toast.error(err.message || 'Không thể từ chối yêu cầu rút tiền');
      setProcessingPayoutRef(null);
    }
  };

  const handleViewDetails = (payout: PayoutDisplayData) => {
    setSelectedPayout(payout);
    setShowDetailsModal(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(0);
  };

  const handleCloseModals = () => {
    setShowDetailsModal(false);
    setShowProcessModal(false);
    setShowFailModal(false);
    setShowCompleteModal(false);
    setSelectedPayout(null);
    setEvidenceFile(null);
    setNotes('');
    setFailReason('');
  };

  const openProcessModal = (payout: PayoutDisplayData) => {
    setSelectedPayout(payout);
    setShowProcessModal(true);
  };

  const openCompleteModal = (payout: PayoutDisplayData) => {
    setSelectedPayout(payout);
    setShowCompleteModal(true);
  };

  const openFailModal = (payout: PayoutDisplayData) => {
    setSelectedPayout(payout);
    setShowFailModal(true);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quản lý rút tiền</h1>
            <p className="mt-2 text-gray-600">
              Xem và xử lý các yêu cầu rút tiền từ người dùng
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng yêu cầu chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {payouts.filter((p) => p.status === 'PENDING').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng số tiền chờ xử lý</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(
                    payouts
                      .filter((p) => p.status === 'PENDING')
                      .reduce((sum, p) => sum + p.amount, 0)
                  )}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tổng số yêu cầu</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{payouts.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DocumentArrowUpIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải danh sách yêu cầu rút tiền...</p>
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
                onClick={loadPayouts}
                className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Thử lại
              </button>
            </div>
          </motion.div>
        )}

        {/* Payouts Table */}
        {!loading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã yêu cầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông tin ngân hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày yêu cầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payouts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <p className="text-gray-500">Không có yêu cầu rút tiền nào</p>
                      </td>
                    </tr>
                  ) : (
                    payouts.map((payout) => (
                      <tr key={`${payout.payoutRef}-${payout.txnId}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{payout.payoutRef}</div>
                          <div className="text-xs text-gray-400">TXN: {payout.txnId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payout.accountHolderName}
                            </div>
                            <div className="text-sm text-gray-500">{payout.userEmail}</div>
                            <div className="text-xs text-gray-400">ID: {payout.userId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {formatCurrency(payout.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payout.bankName}</div>
                            <div className="text-sm text-gray-500">{payout.maskedAccountNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              payout.status
                            )}`}
                          >
                            {getStatusLabel(payout.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDateTime(payout.requestedAt, {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewDetails(payout)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded"
                              title="Xem chi tiết"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {payout.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => openProcessModal(payout)}
                                  className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                  title="Đánh dấu đang xử lý"
                                  disabled={processingPayoutRef === payout.payoutRef}
                                >
                                  <ClockIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openCompleteModal(payout)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="Hoàn thành"
                                  disabled={processingPayoutRef === payout.payoutRef}
                                >
                                  <CheckCircleIcon className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => openFailModal(payout)}
                                  className="text-red-600 hover:text-red-900 p-1 rounded"
                                  title="Từ chối"
                                  disabled={processingPayoutRef === payout.payoutRef}
                                >
                                  <XCircleIcon className="h-4 w-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
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
          </motion.div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModals}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Chi tiết yêu cầu rút tiền</h3>
                      <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-500">
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Mã yêu cầu</p>
                          <p className="text-base font-medium text-gray-900">{selectedPayout.payoutRef}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trạng thái</p>
                          <span
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                              selectedPayout.status
                            )}`}
                          >
                            {getStatusLabel(selectedPayout.status)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Số tiền</p>
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(selectedPayout.amount)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Ngày yêu cầu</p>
                          <p className="text-base font-medium text-gray-900">
                            {formatDateTime(selectedPayout.requestedAt, {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Thông tin người dùng</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Tên người dùng</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedPayout.accountHolderName}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Email</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedPayout.userEmail}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Mã người dùng</p>
                            <p className="text-base font-medium text-gray-900">{selectedPayout.userId}</p>
                          </div>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Thông tin ngân hàng</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Tên ngân hàng</p>
                            <p className="text-base font-medium text-gray-900">{selectedPayout.bankName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Số tài khoản</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedPayout.maskedAccountNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Tên chủ tài khoản</p>
                            <p className="text-base font-medium text-gray-900">
                              {selectedPayout.accountHolderName}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleCloseModals}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Process Modal */}
      {showProcessModal && selectedPayout && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModals}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Đánh dấu đang xử lý</h3>
                      <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-500">
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Bạn có chắc chắn muốn đánh dấu yêu cầu rút tiền <strong>{selectedPayout.payoutRef}</strong>{' '}
                      đang xử lý?
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                        <p className="text-sm text-yellow-800">
                          Sau khi đánh dấu, yêu cầu sẽ chuyển sang trạng thái "Đang xử lý". Bạn có thể hoàn thành
                          hoặc từ chối sau đó.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleProcessPayout(selectedPayout.payoutRef)}
                  disabled={processingPayoutRef === selectedPayout.payoutRef}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayoutRef === selectedPayout.payoutRef ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Complete Modal */}
      {showCompleteModal && selectedPayout && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModals}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Hoàn thành yêu cầu rút tiền</h3>
                      <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-500">
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          File bằng chứng <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => setEvidenceFile(e.target.files?.[0] || null)}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Chấp nhận: ảnh (JPG, PNG) hoặc PDF. Kích thước tối đa: 10MB
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú</label>
                        <textarea
                          rows={3}
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Nhập ghi chú (tùy chọn)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCompletePayout}
                  disabled={!evidenceFile || processingPayoutRef === selectedPayout.payoutRef}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayoutRef === selectedPayout.payoutRef ? 'Đang xử lý...' : 'Hoàn thành'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {showFailModal && selectedPayout && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
              onClick={handleCloseModals}
            />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Từ chối yêu cầu rút tiền</h3>
                      <button onClick={handleCloseModals} className="text-gray-400 hover:text-gray-500">
                        <XCircleIcon className="h-6 w-6" />
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-2" />
                          <p className="text-sm text-red-800">
                            Yêu cầu rút tiền sẽ bị từ chối và số tiền sẽ được hoàn lại vào ví của người dùng.
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lý do từ chối <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          rows={4}
                          value={failReason}
                          onChange={(e) => setFailReason(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          placeholder="Nhập lý do từ chối yêu cầu rút tiền..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleFailPayout}
                  disabled={!failReason.trim() || processingPayoutRef === selectedPayout.payoutRef}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processingPayoutRef === selectedPayout.payoutRef ? 'Đang xử lý...' : 'Từ chối'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

