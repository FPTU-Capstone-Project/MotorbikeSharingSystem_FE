import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ClockIcon,
  MapPinIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getMySOSAlerts, formatSOSStatus, getStatusColorClass } from '../services/sosService';
import { SOSAlert } from '../types';
import SOSTriggerButton from '../components/SOSTriggerButton';
import SOSAlertDetailsModal from '../components/SOSAlertDetailsModal';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function MySOSAlerts() {
  const [alerts, setAlerts] = useState<SOSAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedAlertId, setSelectedAlertId] = useState<number | null>(null);

  const loadAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const data = await getMySOSAlerts(status);
      setAlerts(data);
    } catch (error: any) {
      console.error('Failed to load alerts:', error);
      toast.error(error?.message || 'Không thể tải danh sách cảnh báo SOS');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const activeAlert = useMemo(() =>
    alerts.find(alert => alert.status === 'ACTIVE' || alert.status === 'ESCALATED'),
    [alerts]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      loadAlerts();
    }, activeAlert ? 10000 : 30000);
    return () => clearInterval(interval);
  }, [loadAlerts, activeAlert]);

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd MMM yyyy, HH:mm', { locale: vi });
    } catch {
      return date;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ESCALATED':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'ACKNOWLEDGED':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'RESOLVED':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'FALSE_ALARM':
        return <XMarkIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Cảnh báo SOS của tôi
              </h1>
              <p className="text-gray-600">
                Quản lý và theo dõi các cảnh báo khẩn cấp của bạn
              </p>
            </div>

            {/* SOS Trigger Button */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="text-center">
                <SOSTriggerButton
                  onAlertTriggered={loadAlerts}
                  className="mx-auto"
                />
                <p className="text-xs text-gray-500 mt-2 max-w-xs">
                  Giữ nút trong 5 giây để kích hoạt cảnh báo khẩn cấp
                </p>
              </div>
            </div>
          </div>

          {/* Active Alert Warning */}
          {activeAlert && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-500/50 rounded-lg animate-pulse">
              <div className="flex items-start gap-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-red-900 mb-1">
                    Bạn có cảnh báo SOS đang hoạt động
                  </h3>
                  <p className="text-sm text-red-700">
                    Liên hệ khẩn cấp và quản trị viên đã được thông báo. Trợ giúp đang trên đường đến.
                  </p>
                  <button
                    onClick={() => setSelectedAlertId(Number(activeAlert.id))}
                    className="mt-2 text-sm font-medium text-red-600 hover:text-red-700 underline"
                  >
                    Xem chi tiết →
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc theo trạng thái
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Tất cả</option>
            <option value="ACTIVE">Đang hoạt động</option>
            <option value="ESCALATED">Đã báo cáo</option>
            <option value="ACKNOWLEDGED">Đã xác nhận</option>
            <option value="RESOLVED">Đã giải quyết</option>
            <option value="FALSE_ALARM">Báo động giả</option>
          </select>
        </div>

        {/* Alerts List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ExclamationTriangleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có cảnh báo SOS
            </h3>
            <p className="text-gray-600">
              Bạn chưa có cảnh báo SOS nào. Hy vọng bạn sẽ không bao giờ cần sử dụng tính năng này.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(alert.status)}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Cảnh báo SOS #{alert.id}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(alert.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColorClass(
                        alert.status
                      )}`}
                    >
                      {formatSOSStatus(alert.status)}
                    </span>
                  </div>

                  {/* Description */}
                  {alert.description && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{alert.description}</p>
                    </div>
                  )}

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Location */}
                    <div className="flex items-start gap-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Vị trí</p>
                        <p className="text-xs text-gray-500">
                          {alert.location?.address || `${alert.currentLat.toFixed(4)}, ${alert.currentLng.toFixed(4)}`}
                        </p>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="flex items-start gap-2">
                      <ClockIcon className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">Trạng thái</p>
                        {alert.acknowledgedAt && (
                          <p className="text-xs text-gray-500">
                            Xác nhận: {formatDate(alert.acknowledgedAt)}
                          </p>
                        )}
                        {alert.resolvedAt && (
                          <p className="text-xs text-gray-500">
                            Giải quyết: {formatDate(alert.resolvedAt)}
                          </p>
                        )}
                        {!alert.acknowledgedAt && !alert.resolvedAt && (
                          <p className="text-xs text-gray-500">Đang xử lý...</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Escalation Info */}
                  {alert.escalationCount > 0 && (
                    <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-800">
                        ⚠️ Đã báo cáo {alert.escalationCount} lần
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedAlertId(Number(alert.id))}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Lưu ý quan trọng</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Chỉ sử dụng tính năng SOS trong trường hợp khẩn cấp thực sự</li>
            <li>• Liên hệ khẩn cấp của bạn sẽ được thông báo ngay lập tức</li>
            <li>• Quản trị viên sẽ theo dõi và hỗ trợ bạn trong thời gian sớm nhất</li>
            <li>• Bạn có thể quản lý liên hệ khẩn cấp trong phần Cài đặt</li>
          </ul>
        </div>

        {/* Alert Details Modal */}
        {selectedAlertId !== null && (
          <SOSAlertDetailsModal
            alertId={selectedAlertId}
            isOpen={true}
            onClose={() => setSelectedAlertId(null)}
            onAlertUpdated={loadAlerts}
            isAdmin={false}
          />
        )}
      </motion.div>
    </div>
  );
}
