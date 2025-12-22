import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { UserReportsAPI } from '../api/reports.api';
import {
  UserReportSummary,
  UserReportDetails,
  ReportAnalytics,
  ReportStatus,
  ReportType,
  ReportPriority,
} from '../types/api.types';
import Pagination from '../components/Pagination';
import StatSummaryCard from '../components/StatSummaryCard';
import { formatUserId } from '../utils/formatters';
import { formatDate, formatDateTime } from '../utils/dateUtils';

// Helper functions
const formatReportId = (id: number): string => {
  return `RPT${String(id).padStart(5, '0')}`;
};

const translateType = (type: ReportType): string => {
  const typeMap: Record<ReportType, string> = {
    SAFETY: 'An toàn',
    BEHAVIOR: 'Hành vi',
    RIDE_EXPERIENCE: 'Trải nghiệm',
    PAYMENT: 'Thanh toán',
    ROUTE: 'Tuyến đường',
    TECHNICAL: 'Kỹ thuật',
    OTHER: 'Khác',
  };
  return typeMap[type] || type;
};

const translateStatus = (status: ReportStatus): string => {
  const statusMap: Record<ReportStatus, string> = {
    PENDING: 'Chờ xử lý',
    OPEN: 'Đang mở',
    IN_PROGRESS: 'Đang xử lý',
    RESOLVED: 'Đã giải quyết',
    DISMISSED: 'Đã bỏ qua',
  };
  return statusMap[status] || status;
};

const translatePriority = (priority: ReportPriority): string => {
  const priorityMap: Record<ReportPriority, string> = {
    LOW: 'Thấp',
    MEDIUM: 'Trung bình',
    HIGH: 'Cao',
    CRITICAL: 'Khẩn cấp',
  };
  return priorityMap[priority] || priority;
};

const getStatusColor = (status: ReportStatus): string => {
  const colors: Record<ReportStatus, string> = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-300',
    OPEN: 'bg-blue-100 text-blue-800 border-blue-300',
    IN_PROGRESS: 'bg-purple-100 text-purple-800 border-purple-300',
    RESOLVED: 'bg-green-100 text-green-800 border-green-300',
    DISMISSED: 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colors[status] || colors.PENDING;
};

const getPriorityColor = (priority: ReportPriority): string => {
  const colors: Record<ReportPriority, string> = {
    LOW: 'bg-green-100 text-green-800 border-green-300',
    MEDIUM: 'bg-blue-100 text-blue-800 border-blue-300',
    HIGH: 'bg-amber-100 text-amber-800 border-amber-300',
    CRITICAL: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[priority] || colors.MEDIUM;
};

const getPriorityIcon = (priority: ReportPriority) => {
  switch (priority) {
    case 'LOW':
      return <ArrowDownIcon className="w-4 h-4" />;
    case 'MEDIUM':
      return <MinusIcon className="w-4 h-4" />;
    case 'HIGH':
      return <ArrowUpIcon className="w-4 h-4" />;
    case 'CRITICAL':
      return <ExclamationTriangleIcon className="w-4 h-4" />;
    default:
      return <MinusIcon className="w-4 h-4" />;
  }
};

export default function ReportManagement() {
  const [reports, setReports] = useState<UserReportSummary[]>([]);
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState<'ALL' | ReportStatus>('ALL');
  const [filterType, setFilterType] = useState<'ALL' | ReportType>('ALL');
  const [filterPriority, setFilterPriority] = useState<'ALL' | ReportPriority>('ALL');

  const [selected, setSelected] = useState<UserReportDetails | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [updateStatus, setUpdateStatus] = useState<ReportStatus>('PENDING');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionMessage, setResolutionMessage] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  // Load reports
  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page,
        size,
        sortBy: 'createdAt',
        sortDir: 'desc',
      };

      if (filterStatus !== 'ALL') params.status = filterStatus;
      if (filterType !== 'ALL') params.reportType = filterType;

      const response = await UserReportsAPI.getReports(params);
      console.log('Reports API Response:', response);
      // Handle PageResponse format - backend returns { data, pagination }
      const reportsList = response.data || response.content || [];
      console.log('Reports List:', reportsList);
      setReports(reportsList);
      // Use pagination object if available, otherwise fall back to legacy fields
      if (response.pagination) {
        setTotalPages(response.pagination.total_pages || 0);
        setTotalElements(response.pagination.total_records || reportsList.length);
      } else {
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || reportsList.length);
      }
    } catch (error: any) {
      console.error('Error loading reports:', error);
      toast.error(error.message || 'Không thể tải danh sách báo cáo');
    } finally {
      setLoading(false);
    }
  }, [page, size, filterStatus, filterType]);

  // Load analytics
  const loadAnalytics = async () => {
    try {
      const data = await UserReportsAPI.getAnalytics();
      setAnalytics(data);
    } catch (error: any) {
      console.error('Error loading analytics:', error);
      toast.error(error.message || 'Không thể tải thống kê');
    }
  };

  useEffect(() => {
    loadReports();
  }, [loadReports, filterPriority]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, filterType, filterStatus, filterPriority]);

  // Filter reports by search term and priority (client-side for display)
  const filteredReports = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return reports.filter((r) => {
      const matchesSearch =
        term.length === 0 ||
        String(r.reportId).includes(term) ||
        r.description.toLowerCase().includes(term) ||
        r.reporterName.toLowerCase().includes(term);
      const matchesPriority = filterPriority === 'ALL' || r.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [reports, searchTerm, filterPriority]);

  // Handle view details
  const handleViewDetails = async (reportId: number) => {
    try {
      const details = await UserReportsAPI.getReportDetails(reportId);
      setSelected(details);
      setShowDetailModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Không thể tải chi tiết báo cáo');
    }
  };

  // Handle update status
  const handleUpdateStatus = async () => {
    if (!selected) return;

    try {
      setActionLoading(true);
      await UserReportsAPI.updateReportStatus(selected.reportId, {
        status: updateStatus,
        adminNotes: adminNotes.trim() || undefined,
      });
      toast.success('Đã cập nhật trạng thái báo cáo');
      setShowUpdateModal(false);
      setAdminNotes('');
      await loadReports();
      if (showDetailModal) {
        await handleViewDetails(selected.reportId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle resolve
  const handleResolve = async () => {
    if (!selected || !resolutionMessage.trim()) {
      toast.error('Vui lòng nhập thông báo giải quyết');
      return;
    }

    try {
      setActionLoading(true);
      await UserReportsAPI.resolveReport(selected.reportId, {
        resolutionMessage: resolutionMessage.trim(),
      });
      toast.success('Đã giải quyết báo cáo');
      setShowResolveModal(false);
      setResolutionMessage('');
      await loadReports();
      if (showDetailModal) {
        await handleViewDetails(selected.reportId);
      }
    } catch (error: any) {
      toast.error(error.message || 'Không thể giải quyết báo cáo');
    } finally {
      setActionLoading(false);
    }
  };

  // Open update modal
  const openUpdateModal = (report: UserReportSummary) => {
    setUpdateStatus(report.status);
    setAdminNotes('');
    handleViewDetails(report.reportId);
    setShowUpdateModal(true);
  };

  // Open resolve modal
  const openResolveModal = (report: UserReportSummary) => {
    setResolutionMessage('');
    handleViewDetails(report.reportId);
    setShowResolveModal(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý báo cáo</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Xem xét và xử lý báo cáo từ người dùng
          </p>
        </div>
        {/* <button
          onClick={loadAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ChartBarIcon className="w-5 h-5" />
          <span>Tải lại thống kê</span>
        </button> */}
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatSummaryCard
            label="Tổng báo cáo"
            value={analytics.totalReports}
            icon={DocumentTextIcon}
            gradient="from-blue-500 to-blue-600"
            backgroundGradient="from-blue-500 to-blue-600"
          />
          <StatSummaryCard
            label="Chờ xử lý"
            value={analytics.pendingReports + analytics.openReports}
            icon={ClockIcon}
            gradient="from-amber-500 to-amber-600"
            backgroundGradient="from-amber-500 to-amber-600"
          />
          <StatSummaryCard
            label="Đã giải quyết"
            value={analytics.resolvedReports}
            icon={CheckCircleIcon}
            gradient="from-green-500 to-green-600"
            backgroundGradient="from-green-500 to-green-600"
          />
          <StatSummaryCard
            label="Đã ưu tiên"
            value={analytics.escalatedReports}
            icon={ExclamationTriangleIcon}
            gradient="from-red-500 to-red-600"
            backgroundGradient="from-red-500 to-red-600"
          />
        </div>
      )}

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tìm kiếm
            </label>
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm theo ID, mô tả, người báo cáo..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'ALL' | ReportStatus)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">Tất cả</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="OPEN">Đang mở</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
              <option value="DISMISSED">Đã bỏ qua</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Loại báo cáo
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'ALL' | ReportType)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">Tất cả</option>
              <option value="SAFETY">An toàn</option>
              <option value="BEHAVIOR">Hành vi</option>
              <option value="RIDE_EXPERIENCE">Trải nghiệm</option>
              <option value="PAYMENT">Thanh toán</option>
              <option value="ROUTE">Tuyến đường</option>
              <option value="TECHNICAL">Kỹ thuật</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
        </div>

        {/* Priority Filter */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mức độ ưu tiên
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterPriority('ALL')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterPriority === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Tất cả
            </button>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as ReportPriority[]).map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  filterPriority === priority
                    ? getPriorityColor(priority)
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                {getPriorityIcon(priority)}
                {translatePriority(priority)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Không có báo cáo
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có báo cáo nào'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-slate-900/95">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Người báo cáo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mức độ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900/85 divide-y divide-gray-200 dark:divide-slate-800/80">
                  {filteredReports.map((report) => (
                    <motion.tr
                      key={report.reportId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatReportId(report.reportId)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {translateType(report.reportType)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 dark:text-white line-clamp-2 max-w-xs">
                          {report.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {report.reporterName}
                        </span>
                        {report.sharedRideId && (
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            Ride #{report.sharedRideId}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(
                            report.priority
                          )}`}
                        >
                          {getPriorityIcon(report.priority)}
                          {translatePriority(report.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            report.status
                          )}`}
                        >
                          {translateStatus(report.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(report.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewDetails(report.reportId)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Xem chi tiết"
                          >
                            <EyeIcon className="w-5 h-5" />
                          </button>
                          {report.status !== 'RESOLVED' && report.status !== 'DISMISSED' && (
                            <>
                              {/* Update status only available for ride-specific reports */}
                              {report.sharedRideId && (
                                <button
                                  onClick={() => openUpdateModal(report)}
                                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                  title="Cập nhật trạng thái (chỉ cho báo cáo chuyến đi)"
                                >
                                  <ClockIcon className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => openResolveModal(report)}
                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                title="Giải quyết"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                pageSize={size}
                onPageSizeChange={setSize}
                totalRecords={totalElements}
              />
            </div>
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selected && showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chi tiết báo cáo {formatReportId(selected.reportId)}
                </h2>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowUpdateModal(false);
                    setShowResolveModal(false);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Ride Info - Hiển thị đầu tiên và luôn hiển thị nếu có */}
                {selected.sharedRideId ? (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border-2 border-indigo-300 dark:border-indigo-700">
                    <label className="block text-sm font-semibold text-indigo-900 dark:text-indigo-300 mb-2">
                      ID Chuyến đi bị báo cáo
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center px-4 py-2 rounded-lg text-base font-bold text-indigo-700 dark:text-indigo-200 bg-indigo-100 dark:bg-indigo-800/50 border-2 border-indigo-400 dark:border-indigo-600">
                        #{selected.sharedRideId}
                      </span>
                      {selected.driverName && (
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          Tài xế: <span className="font-semibold">{selected.driverName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      <span className="font-semibold">Lưu ý:</span> Báo cáo này không liên quan đến chuyến đi cụ thể. Chỉ có thể giải quyết trực tiếp.
                    </p>
                  </div>
                )}

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trạng thái
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        selected.status
                      )}`}
                    >
                      {translateStatus(selected.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mức độ ưu tiên
                    </label>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(
                        selected.priority
                      )}`}
                    >
                      {getPriorityIcon(selected.priority)}
                      {translatePriority(selected.priority)}
                    </span>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại báo cáo
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {translateType(selected.reportType)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày tạo
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDateTime(selected.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Reporter Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Người báo cáo
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selected.reporterName} ({selected.reporterEmail})
                    {selected.reporterId && ` - ID: ${formatUserId(selected.reporterId)}`}
                  </p>
                </div>

                {/* Reported User Info */}
                {selected.reportedUserId && selected.reportedUserName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Người bị báo cáo
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {selected.reportedUserName}
                      {selected.reportedUserEmail && ` (${selected.reportedUserEmail})`}
                      {` - ID: ${formatUserId(selected.reportedUserId)}`}
                    </p>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded">
                    {selected.description}
                  </p>
                </div>

                {/* Driver Response */}
                {selected.driverResponse && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                      Phản hồi từ tài xế
                    </label>
                    <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                      {selected.driverResponse}
                    </p>
                    {selected.driverRespondedAt && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                        {formatDateTime(selected.driverRespondedAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* Escalation Info */}
                {selected.escalatedAt && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <label className="block text-sm font-medium text-amber-900 dark:text-amber-300 mb-1">
                      Đã được ưu tiên
                    </label>
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {selected.escalationReason}
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                      {formatDateTime(selected.escalatedAt)}
                    </p>
                  </div>
                )}

                {/* Admin Notes */}
                {selected.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ghi chú admin
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {selected.adminNotes}
                    </p>
                  </div>
                )}

                {/* Resolution Message */}
                {selected.resolutionMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <label className="block text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                      Thông báo giải quyết
                    </label>
                    <p className="text-sm text-green-800 dark:text-green-200 whitespace-pre-wrap">
                      {selected.resolutionMessage}
                    </p>
                    {selected.resolverName && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                        Bởi: {selected.resolverName} -{' '}
                        {formatDateTime(selected.resolvedAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                {selected.status !== 'RESOLVED' && selected.status !== 'DISMISSED' && (
                  <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {/* Update status only available for ride-specific reports */}
                    {selected.sharedRideId && (
                      <button
                        onClick={() => {
                          setUpdateStatus(selected.status);
                          setAdminNotes('');
                          setShowUpdateModal(true);
                        }}
                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        Cập nhật trạng thái
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setResolutionMessage('');
                        setShowResolveModal(true);
                      }}
                      className={`px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors ${
                        selected.sharedRideId ? 'flex-1' : 'w-full'
                      }`}
                    >
                      Giải quyết
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Update Status Modal */}
      {selected && showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Cập nhật trạng thái
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Trạng thái
                </label>
                <select
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value as ReportStatus)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="PENDING">Chờ xử lý</option>
                  <option value="OPEN">Đang mở</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="RESOLVED">Đã giải quyết</option>
                  <option value="DISMISSED">Đã bỏ qua</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ghi chú (tùy chọn)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập ghi chú về báo cáo..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpdateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleUpdateStatus}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Cập nhật'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Resolve Modal */}
      {selected && showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Giải quyết báo cáo
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thông báo giải quyết <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={resolutionMessage}
                  onChange={(e) => setResolutionMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập thông báo giải quyết cho người báo cáo..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowResolveModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleResolve}
                  disabled={actionLoading || !resolutionMessage.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Đang xử lý...' : 'Giải quyết'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

