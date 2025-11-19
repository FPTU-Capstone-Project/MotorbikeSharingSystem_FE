import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExclamationTriangleIcon,
  XMarkIcon,
  MapPinIcon,
  PhoneIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  triggerSosAlert,
  getCurrentLocation,
  getEmergencyContacts,
} from '../services/sosService';
import { TriggerSosRequest } from '../types';

interface SOSTriggerButtonProps {
  rideId?: number;
  className?: string;
  onAlertTriggered?: () => void;
}

const SOS_HOLD_DURATION = 5000; // 5 seconds as per backend config

export default function SOSTriggerButton({
  rideId,
  className = '',
  onAlertTriggered,
}: SOSTriggerButtonProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isTriggering, setIsTriggering] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [hasContacts, setHasContacts] = useState(true);

  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check if user has emergency contacts
  useEffect(() => {
    const checkContacts = async () => {
      try {
        const contacts = await getEmergencyContacts();
        setHasContacts(contacts.length > 0);
      } catch (error) {
        console.error('Failed to check emergency contacts:', error);
      }
    };
    checkContacts();
  }, []);

  const startHold = useCallback(() => {
    setIsHolding(true);
    startTimeRef.current = Date.now();

    // Start progress animation
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min((elapsed / SOS_HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
    }, 50);

    // Set timer to trigger after hold duration
    holdTimerRef.current = setTimeout(() => {
      setIsHolding(false);
      setHoldProgress(0);
      handleTriggerSOS();
    }, SOS_HOLD_DURATION);
  }, []);

  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setIsHolding(false);
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  const handleTriggerSOS = async () => {
    try {
      // Get current location
      const currentLocation = await getCurrentLocation();
      setLocation(currentLocation);
      setShowConfirmation(true);
    } catch (error: any) {
      console.error('Failed to get location:', error);
      toast.error('Không thể lấy vị trí hiện tại. Vui lòng bật định vị.');
    }
  };

  const confirmTrigger = async () => {
    if (!location) {
      toast.error('Không có thông tin vị trí');
      return;
    }

    if (!hasContacts) {
      toast.error('Bạn chưa có liên hệ khẩn cấp. Vui lòng thêm ít nhất một liên hệ trước.');
      setShowConfirmation(false);
      return;
    }

    setIsTriggering(true);

    try {
      const request: TriggerSosRequest = {
        sharedRideId: rideId,
        currentLat: location.lat,
        currentLng: location.lng,
        description: description.trim() || undefined,
        forceFallbackCall: false,
      };

      await triggerSosAlert(request);
      
      toast.success(
        'Đã kích hoạt cảnh báo SOS! Liên hệ khẩn cấp và quản trị viên đã được thông báo.',
        { duration: 5000 }
      );

      setShowConfirmation(false);
      setDescription('');
      
      if (onAlertTriggered) {
        onAlertTriggered();
      }
    } catch (error: any) {
      console.error('Failed to trigger SOS alert:', error);
      toast.error(error?.message || 'Không thể kích hoạt cảnh báo SOS. Vui lòng thử lại.');
    } finally {
      setIsTriggering(false);
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmation(false);
    setDescription('');
    setLocation(null);
  };

  return (
    <>
      {/* SOS Button */}
      <motion.button
        onMouseDown={startHold}
        onMouseUp={cancelHold}
        onMouseLeave={cancelHold}
        onTouchStart={startHold}
        onTouchEnd={cancelHold}
        className={`relative ${className}`}
        whileTap={{ scale: 0.95 }}
      >
        <div
          className={`
            relative overflow-hidden rounded-full w-20 h-20
            bg-gradient-to-br from-red-500 to-red-700
            shadow-lg hover:shadow-xl
            transition-all duration-200
            ${isHolding ? 'ring-4 ring-red-300 ring-opacity-50' : ''}
          `}
        >
          {/* Progress Circle */}
          {isHolding && (
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="white"
                strokeWidth="4"
                fill="none"
                strokeDasharray={`${(holdProgress / 100) * 226} 226`}
                className="transition-all duration-50"
              />
            </svg>
          )}

          {/* Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <ExclamationTriangleIcon className="h-10 w-10 text-white" />
          </div>

          {/* Pulse animation when holding */}
          {isHolding && (
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-full"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>

        {/* Label */}
        <div className="mt-2 text-center">
          <span className="text-sm font-semibold text-red-600">
            {isHolding ? 'Đang giữ...' : 'SOS'}
          </span>
          {isHolding && (
            <div className="text-xs text-gray-500 mt-1">
              Giữ trong {Math.ceil((SOS_HOLD_DURATION - (Date.now() - startTimeRef.current)) / 1000)}s
            </div>
          )}
        </div>
      </motion.button>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={cancelConfirmation}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Xác nhận SOS
                    </h2>
                    <p className="text-sm text-gray-500">
                      Cảnh báo khẩn cấp
                    </p>
                  </div>
                </div>
                <button
                  onClick={cancelConfirmation}
                  disabled={isTriggering}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Warning Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <p className="text-red-800 text-sm">
                  ⚠️ Bạn sắp kích hoạt cảnh báo SOS. Liên hệ khẩn cấp và quản trị viên sẽ được thông báo ngay lập tức.
                </p>
              </div>

              {/* Location Info */}
              {location && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <MapPinIcon className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">Vị trí hiện tại</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {hasContacts && (
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <PhoneIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">
                        Liên hệ khẩn cấp sẽ được thông báo
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả tình huống (tùy chọn)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Tài xế gặp sự cố, cần hỗ trợ khẩn cấp..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isTriggering}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={cancelConfirmation}
                  disabled={isTriggering}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={confirmTrigger}
                  disabled={isTriggering}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTriggering ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Đang gửi...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      <span>Xác nhận SOS</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
