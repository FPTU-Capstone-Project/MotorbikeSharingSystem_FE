import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  PhoneIcon,
  MapPinIcon,
  CheckCircleIcon,
  XMarkIcon,
  ClockIcon,
  UserIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { SOSAlert } from '../types';
import toast from 'react-hot-toast';
import StatSummaryCard from '../components/StatSummaryCard';

const mockSOSAlerts: SOSAlert[] = [
  {
    id: 'sos_001',
    userId: 'user_001',
    rideId: 'ride_001',
    location: {
      lat: 21.0285,
      lng: 105.8542,
      address: 'Gần Đại học FPT Hà Nội, Hòa Lạc',
    },
    status: 'active',
    description: 'Báo tai nạn - cần hỗ trợ khẩn cấp',
    createdAt: '2024-01-20T08:30:00Z',
  },
  {
    id: 'sos_002',
    userId: 'user_002',
    location: {
      lat: 21.0245,
      lng: 105.8412,
      address: 'Khu vực tòa Keangnam Landmark, Hà Nội',
    },
    status: 'resolved',
    description: 'Xe gặp sự cố - đã hỗ trợ xong',
    createdAt: '2024-01-19T15:45:00Z',
    resolvedAt: '2024-01-19T16:20:00Z',
    resolvedBy: 'admin_001',
  },
  {
    id: 'sos_003',
    userId: 'driver_001',
    rideId: 'ride_003',
    location: {
      lat: 21.0278,
      lng: 105.8342,
      address: 'Times City, Hà Nội - Cổng chính',
    },
    status: 'false_alarm',
    description: 'Kích hoạt nhầm - báo động giả',
    createdAt: '2024-01-19T12:15:00Z',
    resolvedAt: '2024-01-19T12:25:00Z',
    resolvedBy: 'admin_002',
  },
];

const userNames: { [key: string]: string } = {
  user_001: 'Nguyễn Anh Tuấn',
  user_002: 'Trần Gia Hân',
  driver_001: 'Phạm Đức Minh',
};

export default function SafetyManagement() {
  const [sosAlerts, setSOSAlerts] = useState<SOSAlert[]>(mockSOSAlerts);
  const [filterStatus, setFilterStatus] = useState<'all' | SOSAlert['status']>('all');
  const [selectedAlert, setSelectedAlert] = useState<SOSAlert | null>(null);

  const filteredAlerts = sosAlerts.filter(alert => 
    filterStatus === 'all' || alert.status === filterStatus
  );

  const handleResolveAlert = (alertId: string) => {
    setSOSAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'resolved',
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'admin_current'
            }
          : alert
      )
    );
    toast.success('Đã đánh dấu báo động SOS là đã xử lý');
  };

  const handleMarkFalseAlarm = (alertId: string) => {
    setSOSAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { 
              ...alert, 
              status: 'false_alarm',
              resolvedAt: new Date().toISOString(),
              resolvedBy: 'admin_current'
            }
          : alert
      )
    );
    toast.success('Đã đánh dấu báo động là báo giả');
  };

  const getStatusBadge = (status: SOSAlert['status']) => {
    const styles = {
      active: 'bg-red-100 text-red-800 animate-pulse',
      resolved: 'bg-green-100 text-green-800',
      false_alarm: 'bg-gray-100 text-gray-800',
    };
    return styles[status];
  };

  const getStatusIcon = (status: SOSAlert['status']) => {
    switch (status) {
      case 'active':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'resolved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'false_alarm':
        return <XMarkIcon className="h-5 w-5 text-gray-500" />;
      default:
        return null;
    }
  };

  const activeAlertsCount = sosAlerts.filter(alert => alert.status === 'active').length;
  const resolvedTodayCount = sosAlerts.filter(alert =>
    alert.status === 'resolved' &&
    alert.resolvedAt &&
    new Date(alert.resolvedAt).toDateString() === new Date().toDateString()
  ).length;
  const resolvedAlertsWithTime = sosAlerts.filter(alert => alert.resolvedAt);
  const averageResponseMinutes = resolvedAlertsWithTime.length
    ? resolvedAlertsWithTime.reduce((total, alert) => {
        const created = new Date(alert.createdAt).getTime();
        const resolved = new Date(alert.resolvedAt!).getTime();
        return total + Math.max(resolved - created, 0);
      }, 0) /
      resolvedAlertsWithTime.length /
      60000
    : 0;
  const statusLabels: Record<SOSAlert['status'], string> = {
    active: 'Đang khẩn cấp',
    resolved: 'Đã xử lý',
    false_alarm: 'Báo giả',
  };

  const summaryCards = [
    {
      title: 'Báo động đang mở',
      value: activeAlertsCount,
      icon: ExclamationTriangleIcon,
      iconGradient: 'from-rose-600 to-red-600',
      backgroundGradient: 'from-rose-50 to-red-100',
      description: 'Cần điều phối xử lý ngay',
    },
    {
      title: 'Đã xử lý hôm nay',
      value: resolvedTodayCount,
      icon: CheckCircleIcon,
      iconGradient: 'from-emerald-600 to-teal-600',
      backgroundGradient: 'from-emerald-50 to-teal-100',
      description: 'Hoàn tất trong 24 giờ qua',
    },
    {
      title: 'Thời gian phản hồi TB',
      value: resolvedAlertsWithTime.length ? `${averageResponseMinutes.toFixed(1)} phút` : '—',
      icon: ClockIcon,
      iconGradient: 'from-blue-600 to-indigo-600',
      backgroundGradient: 'from-blue-50 to-indigo-100',
      description: resolvedAlertsWithTime.length ? 'Tính theo các sự cố gần nhất' : 'Chưa có báo động nào xử lý',
    },
    {
      title: 'Tài xế đã kiểm duyệt',
      value: '85%',
      icon: ShieldCheckIcon,
      iconGradient: 'from-purple-600 to-fuchsia-600',
      backgroundGradient: 'from-purple-50 to-fuchsia-100',
      description: 'Đã hoàn tất kiểm tra an toàn',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý an toàn</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi báo động SOS, trạng thái xác thực tài xế và sự cố an toàn
          </p>
        </div>
        <button className="btn-primary flex items-center mt-4 sm:mt-0">
          <PhoneIcon className="h-5 w-5 mr-2" />
          Danh bạ khẩn cấp
        </button>
      </div>

      {/* Safety Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
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

      {/* Active Alerts - Priority Section */}
      {sosAlerts.filter(alert => alert.status === 'active').length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative rounded-lg p-6 border border-red-200 bg-red-50 dark:border-transparent dark:bg-transparent overflow-hidden"
        >
          {/* Dark-only mesh red gradient background */}
          <div className="hidden dark:block absolute inset-0 -z-0 mesh-gradient-danger animate-mesh" />
          <div className="relative flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-white mr-3" />
            <h2 className="text-lg font-semibold text-red-800 dark:text-white">Báo động khẩn cấp đang mở</h2>
          </div>
          <div className="space-y-3">
            {sosAlerts.filter(alert => alert.status === 'active').map(alert => (
              <div key={alert.id} className="bg-white dark:surface-1 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-slate-100">{userNames[alert.userId]}</p>
                      <p className="text-sm text-gray-600 dark:text-slate-300">{alert.location.address}</p>
                      <p className="text-sm text-red-600 dark:text-rose-200">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="btn-secondary text-sm">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      Xem bản đồ
                    </button>
                    <button
                      onClick={() => handleResolveAlert(alert.id)}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      Đã xử lý
                    </button>
                    <button
                      onClick={() => handleMarkFalseAlarm(alert.id)}
                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                    >
                      Báo giả
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
        className="card"
      >
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <select
            className="input-field"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang khẩn cấp</option>
            <option value="resolved">Đã xử lý</option>
            <option value="false_alarm">Báo giả</option>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin báo động
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người gửi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vị trí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAlerts.map((alert) => (
                <tr key={alert.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{alert.id}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {alert.description}
                      </div>
                      {alert.rideId && (
                        <div className="text-xs text-blue-600">Chuyến: {alert.rideId}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <UserIcon className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {userNames[alert.userId]}
                        </div>
                        <div className="text-sm text-gray-500">ID: {alert.userId}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate">
                          {alert.location.address}
                        </div>
                        <div className="text-xs text-gray-500">
                          {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(alert.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(alert.status)}`}>
                        {statusLabels[alert.status]}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {new Date(alert.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {alert.resolvedAt && (
                        <div className="text-xs text-green-600 mt-1">
                          Đã xử lý lúc: {new Date(alert.resolvedAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedAlert(alert)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {alert.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleResolveAlert(alert.id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                          >
                            <CheckCircleIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMarkFalseAlarm(alert.id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          >
                            <XMarkIcon className="h-4 w-4" />
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
        
        {filteredAlerts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Không tìm thấy báo động SOS phù hợp tiêu chí lọc.</p>
          </div>
        )}
      </motion.div>

      {/* Driver Verification Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Xác thực an toàn tài xế</h3>
          <button className="btn-secondary">Quản lý kiểm duyệt</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">127</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Tài xế đã duyệt</div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-2">Đã kiểm tra lý lịch</div>
          </div>
          <div className="text-center p-6 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">23</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Đang chờ duyệt</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">Chờ xét duyệt hồ sơ</div>
          </div>
          <div className="text-center p-6 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">5</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">Bị từ chối</div>
            <div className="text-xs text-red-600 dark:text-red-400 mt-2">Không đạt yêu cầu</div>
          </div>
        </div>
      </motion.div>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chi tiết báo động SOS - #{selectedAlert.id}
                </h3>
                <button
                  onClick={() => setSelectedAlert(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="px-6 py-4 space-y-6">
              {/* Alert Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin báo động</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <div className="flex items-center mt-1">
                      {getStatusIcon(selectedAlert.status)}
                      <span className="ml-2 font-semibold">
                        {statusLabels[selectedAlert.status]}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Khởi tạo</p>
                    <p className="font-semibold">
                      {new Date(selectedAlert.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">Mô tả</p>
                  <p className="font-medium text-gray-900 mt-1">{selectedAlert.description}</p>
                </div>
              </div>

              {/* User Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Thông tin người gửi</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold text-gray-900">{userNames[selectedAlert.userId]}</p>
                  <p className="text-sm text-gray-600">Mã người dùng: {selectedAlert.userId}</p>
                  {selectedAlert.rideId && (
                    <p className="text-sm text-blue-600">Chuyến liên quan: {selectedAlert.rideId}</p>
                  )}
                </div>
              </div>

              {/* Location Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Vị trí</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900">{selectedAlert.location.address}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Tọa độ: {selectedAlert.location.lat}, {selectedAlert.location.lng}
                  </p>
                  <button className="btn-primary mt-3 text-sm">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    Mở trên bản đồ
                  </button>
                </div>
              </div>

              {/* Resolution Info */}
              {selectedAlert.resolvedAt && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Thông tin xử lý</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Thời gian xử lý:</p>
                    <p className="font-semibold">
                      {new Date(selectedAlert.resolvedAt).toLocaleString('vi-VN')}
                    </p>
                    {selectedAlert.resolvedBy && (
                      <p className="text-sm text-gray-600 mt-1">
                        Người xử lý: {selectedAlert.resolvedBy}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              {selectedAlert.status === 'active' && (
                <>
                  <button
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    Đánh dấu đã xử lý
                  </button>
                  <button
                    onClick={() => {
                      handleMarkFalseAlarm(selectedAlert.id);
                      setSelectedAlert(null);
                    }}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Báo giả
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedAlert(null)}
                className="btn-secondary"
              >
                Đóng
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
