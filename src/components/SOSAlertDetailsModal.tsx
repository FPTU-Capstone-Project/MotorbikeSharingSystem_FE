import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  ClockIcon,
  CheckCircleIcon,
  FlagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  getSOSAlertById,
  acknowledgeSOSAlert,
  resolveSOSAlert,
  formatSOSStatus,
  getStatusColorClass,
} from '../services/sosService';
import { SOSAlert } from '../types';
import SOSAlertTimeline from './SOSAlertTimeline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface SOSAlertDetailsModalProps {
  alertId: number;
  isOpen: boolean;
  onClose: () => void;
  onAlertUpdated?: () => void;
  isAdmin?: boolean;
}

export default function SOSAlertDetailsModal({
  alertId,
  isOpen,
  onClose,
  onAlertUpdated,
  isAdmin = false,
}: SOSAlertDetailsModalProps) {
  const [alert, setAlert] = useState<SOSAlert | null>(null);
  const [loading, setLoading] = useState(true);
  const [acknowledgeNote, setAcknowledgeNote] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isAcknowledging, setIsAcknowledging] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [showAcknowledgeForm, setShowAcknowledgeForm] = useState(false);
  const [showResolveForm, setShowResolveForm] = useState(false);

  const loadAlert = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSOSAlertById(alertId);
      setAlert(data);
    } catch (error: any) {
      console.error('Failed to load alert:', error);
      toast.error(error?.message || 'Không thể tải thông tin cảnh báo');
    } finally {
      setLoading(false);
    }
  }, [alertId]);

  useEffect(() => {
    if (isOpen) {
      loadAlert();
    }
  }, [isOpen, loadAlert]);

  const handleAcknowledge = async () => {
    if (!alert) return;

    setIsAcknowledging(true);
    try {
      await acknowledgeSOSAlert(Number(alert.id), {
        note: acknowledgeNote.trim() || undefined,
      });
      toast.success('Đã xác nhận cảnh báo SOS');
      setAcknowledgeNote('');
      setShowAcknowledgeForm(false);
      await loadAlert();
      if (onAlertUpdated) onAlertUpdated();
    } catch (error: any) {
      console.error('Failed to acknowledge alert:', error);
      toast.error(error?.message || 'Không thể xác nhận cảnh báo');
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleResolve = async (falseAlarm: boolean) => {
    if (!alert) return;

    setIsResolving(true);
    try {
      await resolveSOSAlert(Number(alert.id), {
        resolutionNotes: resolutionNotes.trim() || undefined,
        falseAlarm,
      });
      toast.success(
        falseAlarm ? 'Đã đánh dấu là báo động giả' : 'Đã giải quyết cảnh báo SOS'
      );
      setResolutionNotes('');
      setShowResolveForm(false);
      await loadAlert();
      if (onAlertUpdated) onAlertUpdated();
    } catch (error: any) {
      console.error('Failed to resolve alert:', error);
      toast.error(error?.message || 'Không thể giải quyết cảnh báo');
    } finally {
      setIsResolving(false);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy, HH:mm:ss', { locale: vi });
    } catch {
      return date;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8"
        >
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : alert ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-700 p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                      <h2 className="text-2xl font-bold text-white">
                        Cảnh báo SOS #{alert.id}
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColorClass(
                          alert.status
                        )}`}
                      >
                        {formatSOSStatus(alert.status)}
                      </span>
                      {alert.escalationCount > 0 && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-300">
                          Leo thang: {alert.escalationCount} lần
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* User Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <UserIcon className="h-5 w-5" />
                      Thông tin người dùng
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Tên:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {alert.userName || `User ${alert.userId}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">User ID:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {alert.userId}
                        </span>
                      </div>
                      {alert.userPhone && (
                        <div className="flex items-center gap-2">
                          <PhoneIcon className="h-4 w-4 text-gray-600" />
                          <span className="font-medium text-gray-900">
                            {alert.userPhone}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <MapPinIcon className="h-5 w-5" />
                      Vị trí
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Latitude:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {alert.currentLat.toFixed(6)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Longitude:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {alert.currentLng.toFixed(6)}
                        </span>
                      </div>
                      <a
                        href={`https://www.google.com/maps?q=${alert.currentLat},${alert.currentLng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-2 text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Xem trên Google Maps →
                      </a>
                    </div>
                  </div>

                  {/* Time Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <ClockIcon className="h-5 w-5" />
                      Thời gian
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-600">Tạo:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {formatDate(alert.createdAt)}
                        </span>
                      </div>
                      {alert.acknowledgedAt && (
                        <div>
                          <span className="text-gray-600">Xác nhận:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {formatDate(alert.acknowledgedAt)}
                          </span>
                        </div>
                      )}
                      {alert.resolvedAt && (
                        <div>
                          <span className="text-gray-600">Giải quyết:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {formatDate(alert.resolvedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contacts */}
                  {alert.contactInfo && alert.contactInfo.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <PhoneIcon className="h-5 w-5" />
                        Liên hệ khẩn cấp
                      </h3>
                      <div className="space-y-2">
                        {alert.contactInfo.map((contact, index) => (
                          <div key={index} className="text-sm">
                            <div className="font-medium text-gray-900">
                              {contact.name}
                              {contact.isPrimary && (
                                <span className="ml-2 text-xs text-yellow-600">
                                  (Chính)
                                </span>
                              )}
                            </div>
                            <div className="text-gray-600">{contact.phone}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {alert.description && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Mô tả:</h3>
                    <p className="text-gray-700">{alert.description}</p>
                  </div>
                )}

                {/* Admin Actions */}
                {isAdmin && alert.status !== 'RESOLVED' && alert.status !== 'FALSE_ALARM' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Hành động quản trị</h3>
                    
                    {/* Acknowledge Section */}
                    {alert.status !== 'ACKNOWLEDGED' && !showAcknowledgeForm && (
                      <button
                        onClick={() => setShowAcknowledgeForm(true)}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-2"
                      >
                        <CheckCircleIcon className="h-5 w-5 inline mr-2" />
                        Xác nhận cảnh báo
                      </button>
                    )}

                    {showAcknowledgeForm && alert.status !== 'ACKNOWLEDGED' && (
                      <div className="space-y-3 mb-4">
                        <textarea
                          value={acknowledgeNote}
                          onChange={(e) => setAcknowledgeNote(e.target.value)}
                          placeholder="Ghi chú xác nhận (tùy chọn)..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          rows={3}
                          disabled={isAcknowledging}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowAcknowledgeForm(false)}
                            disabled={isAcknowledging}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={handleAcknowledge}
                            disabled={isAcknowledging}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                          >
                            {isAcknowledging ? 'Đang xác nhận...' : 'Xác nhận'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Resolve Section */}
                    {alert.status === 'ACKNOWLEDGED' && !showResolveForm && (
                      <button
                        onClick={() => setShowResolveForm(true)}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        <FlagIcon className="h-5 w-5 inline mr-2" />
                        Giải quyết cảnh báo
                      </button>
                    )}

                    {showResolveForm && (
                      <div className="space-y-3">
                        <textarea
                          value={resolutionNotes}
                          onChange={(e) => setResolutionNotes(e.target.value)}
                          placeholder="Ghi chú giải quyết..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                          rows={3}
                          disabled={isResolving}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setShowResolveForm(false)}
                            disabled={isResolving}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            Hủy
                          </button>
                          <button
                            onClick={() => handleResolve(true)}
                            disabled={isResolving}
                            className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                          >
                            Báo giả
                          </button>
                          <button
                            onClick={() => handleResolve(false)}
                            disabled={isResolving}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Đã giải quyết
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Timeline */}
                <div className="border-t border-gray-200 pt-6">
                  <SOSAlertTimeline 
                    alertId={Number(alert.id)} 
                    autoRefresh={alert.status === 'ACTIVE' || alert.status === 'ESCALATED'}
                    refreshInterval={15000}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Không tìm thấy cảnh báo
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
