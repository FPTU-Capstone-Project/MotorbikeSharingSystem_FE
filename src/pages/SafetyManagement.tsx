import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon,
  EyeIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { SOSAlert } from '../types';
import toast from 'react-hot-toast';
import StatSummaryCard from '../components/StatSummaryCard';
import { formatUserId } from '../utils/formatters';
import {
  getSafetyDashboardStats,
  SafetyDashboardStats,
} from '../services/safetyService';
import {
  getAllSOSAlerts,
  formatSOSStatus,
  getStatusColorClass,
} from '../services/sosService';
import Pagination from '../components/Pagination';
import SOSAlertDetailsModal from '../components/SOSAlertDetailsModal';

export default function SafetyManagement() {
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>([]);
  const [dashboardStats, setDashboardStats] = useState<SafetyDashboardStats | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingAlerts, setLoadingAlerts] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Load dashboard stats
  const loadDashboardStats = useCallback(async () => {
    try {
      const stats = await getSafetyDashboardStats();
      setDashboardStats(stats);
    } catch (error: any) {
      console.error('Failed to load dashboard stats:', error);
      toast.error(error?.message || 'Không tải được thống kê dashboard');
    }
  }, []);

  // Load alerts list
  const loadAlerts = useCallback(async () => {
    try {
      setLoadingAlerts(true);
      
      const params = {
        status: filterStatus === 'all' ? undefined : filterStatus,
        page,
        pageSize,
        sortBy: 'createdAt',
        sortDir: 'desc' as const,
      };

      const response = await getAllSOSAlerts(params);
      setSOSAlerts(response.alerts);
      setTotalPages(response.totalPages);
      setTotalRecords(response.totalRecords);
    } catch (error: any) {
      console.error('Failed to load alerts:', error);
      toast.error(error?.message || 'Không tải được danh sách báo động');
    } finally {
      setLoadingAlerts(false);
    }
  }, [filterStatus, page, pageSize]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadDashboardStats(), loadAlerts()]);
      setLoading(false);
    };
    loadData();
  }, [loadDashboardStats, loadAlerts]);

  // Reload alerts when filter/page changes
  useEffect(() => {
    if (!loading) {
      loadAlerts();
    }
  }, [filterStatus, page, pageSize, loading, loadAlerts]);

  // Background refresh to simulate realtime updates
  useEffect(() => {
    const interval = setInterval(() => {
      loadDashboardStats();
      loadAlerts();
    }, 10000);
    return () => clearInterval(interval);
  }, [loadDashboardStats, loadAlerts]);

  const activeAlerts = useMemo(() => 
    sosAlerts?.filter(alert => alert.status === 'ACTIVE' || alert.status === 'ESCALATED') || [], 
    [sosAlerts]
  );

  const handleAlertUpdated = () => {
    loadDashboardStats();
    loadAlerts();
  };

  const summaryCards = useMemo(() => dashboardStats ? [
    {
      title: 'Báo động đang mở',
      value: dashboardStats.activeAlertsCount,
      icon: ExclamationTriangleIcon,
      iconGradient: 'from-rose-600 to-red-600',
      backgroundGradient: 'from-rose-50 to-red-100',
      description: 'Cần điều phối xử lý ngay',
    },
    {
      title: 'Đã xử lý hôm nay',
      value: dashboardStats.resolvedTodayCount,
      icon: CheckCircleIcon,
      iconGradient: 'from-emerald-600 to-teal-600',
      backgroundGradient: 'from-emerald-50 to-teal-100',
      description: 'Hoàn tất trong 24 giờ qua',
    },
    {
      title: 'Thời gian phản hồi TB',
      value: dashboardStats.averageResponseTimeMinutes > 0 
        ? `${dashboardStats.averageResponseTimeMinutes.toFixed(1)} phút` 
        : '—',
      icon: ClockIcon,
      iconGradient: 'from-blue-600 to-indigo-600',
      backgroundGradient: 'from-blue-50 to-indigo-100',
      description: dashboardStats.averageResponseTimeMinutes > 0 
        ? 'Tính theo các sự cố gần nhất' 
        : 'Chưa có báo động nào xử lý',
    },
    {
      title: 'Tài xế đã kiểm duyệt',
      value: `${dashboardStats.driverVerificationPercentage.toFixed(0)}%`,
      icon: ShieldCheckIcon,
      iconGradient: 'from-purple-600 to-fuchsia-600',
      backgroundGradient: 'from-purple-50 to-fuchsia-100',
      description: 'Đã hoàn tất kiểm tra an toàn',
    },
  ] : [], [dashboardStats]);

  return (
    <div className="space-y-6 text-gray-900 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý an toàn</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi báo động SOS, trạng thái xác thực tài xế và sự cố an toàn
          </p>
        </div>
      </div>

      {/* Safety Metrics */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card animate-pulse h-full bg-white dark:bg-slate-900">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
          {summaryCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <StatSummaryCard
                label={card.title}
                value={card.value}
                icon={card.icon}
                gradient={card.iconGradient}
                backgroundGradient={card.backgroundGradient}
                detail={card.description}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Active Alerts - Priority Section */}
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-lg p-6 border border-red-200 dark:border-red-500/50 bg-red-50 dark:bg-red-900/30 overflow-hidden"
        >
          <div className="relative flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
            <h2 className="text-lg font-semibold text-red-800">Báo động khẩn cấp đang mở</h2>
          </div>
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div key={alert.id} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-gray-900">{alert.userName || `User ${alert.userId}`}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        {alert.location?.address || `${alert.currentLat.toFixed(4)}, ${alert.currentLng.toFixed(4)}`}
                      </p>
                      <p className="text-sm text-red-600">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedAlertId(Number(alert.id))}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      Chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card bg-white dark:bg-slate-900 dark:text-slate-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="ESCALATED">Đã báo cáo</option>
            <option value="ACKNOWLEDGED">Đã xác nhận</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="FALSE_ALARM">Báo động giả</option>
          </select>
        </div>
      </motion.div>

      {/* SOS Alerts Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Thông tin báo động
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Người gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-slate-800">
              {sosAlerts && sosAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-slate-100">#{alert.id}</div>
                      <div className="text-sm text-gray-600 dark:text-slate-300 max-w-xs truncate">
                        {alert.description || 'Không có mô tả'}
                      </div>
                      {alert.sharedRideId && (
                        <div className="text-xs text-blue-600">Chuyến: {alert.sharedRideId}</div>
                      )}
                      {alert.escalationCount > 0 && (
                        <div className="text-xs text-orange-600">
                          Đã báo cáo: {alert.escalationCount} lần
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                          {alert.userName || `User ${alert.userId}`}
                        </div>
                        <div className="text-sm text-gray-500">ID: {formatUserId(alert.userId)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 dark:text-slate-100 truncate">
                          {alert.location?.address || 'Không có địa chỉ'}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">
                          {alert.currentLat.toFixed(4)}, {alert.currentLng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColorClass(alert.status)}`}>
                      {formatSOSStatus(alert.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 dark:text-slate-100">
                        {new Date(alert.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-slate-400">
                        {new Date(alert.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {alert.resolvedAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Xử lý: {new Date(alert.resolvedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setSelectedAlertId(Number(alert.id))}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded flex items-center gap-1"
                    >
                      <EyeIcon className="h-4 w-4" />
                      <span>Chi tiết</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {loadingAlerts ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : (!sosAlerts || sosAlerts.length === 0) ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy báo động SOS phù hợp.</p>
          </div>
        ) : null}
        
        {/* Pagination */}
        {!loadingAlerts && totalPages > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalRecords={totalRecords}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(newSize) => {
                setPage(0);
                setPageSize(newSize);
              }}
              loading={loadingAlerts}
              pageSizeOptions={[5, 10, 20, 50]}
            />
          </div>
        )}
      </motion.div>

      {/* Driver Verification Section */}
      {dashboardStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card bg-white dark:bg-slate-900 dark:text-slate-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Xác thực an toàn tài xế</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-green-50 dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-400/40">
              <div className="text-3xl font-bold text-green-600">
                {dashboardStats.approvedDriversCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-300 mt-1">Tài xế đã duyệt</div>
              <div className="text-xs text-green-600 mt-2">Đã kiểm tra lý lịch</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 dark:bg-slate-800 rounded-lg border border-yellow-200 dark:border-yellow-400/40">
              <div className="text-3xl font-bold text-yellow-600">
                {dashboardStats.pendingDriversCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-300 mt-1">Đang chờ duyệt</div>
              <div className="text-xs text-yellow-600 mt-2">Chờ xét duyệt hồ sơ</div>
            </div>
            <div className="text-center p-6 bg-red-50 dark:bg-slate-800 rounded-lg border border-red-200 dark:border-red-400/40">
              <div className="text-3xl font-bold text-red-600">
                {dashboardStats.rejectedDriversCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-slate-300 mt-1">Bị từ chối</div>
              <div className="text-xs text-red-600 mt-2">Không đạt yêu cầu</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlertId !== null && (
        <SOSAlertDetailsModal
          alertId={selectedAlertId}
          isOpen={true}
          onClose={() => setSelectedAlertId(null)}
          onAlertUpdated={handleAlertUpdated}
          isAdmin={true}
        />
      )}
    </div>
  );
}
