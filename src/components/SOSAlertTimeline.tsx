import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BellIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
  FlagIcon,
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { getSOSAlertTimeline, formatEventType, getEventIconColor } from '../services/sosService';
import { SosAlertEvent } from '../types';
import toast from 'react-hot-toast';

interface SOSAlertTimelineProps {
  alertId: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export default function SOSAlertTimeline({
  alertId,
  autoRefresh = false,
  refreshInterval = 15000,
}: SOSAlertTimelineProps) {
  const [events, setEvents] = useState<SosAlertEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTimeline = useCallback(async () => {
    try {
      const data = await getSOSAlertTimeline(alertId);
      setEvents(data);
    } catch (error: any) {
      console.error('Failed to load timeline:', error);
      if (loading) {
        toast.error(error?.message || 'Không thể tải lịch sử sự kiện');
      }
    } finally {
      setLoading(false);
    }
  }, [alertId, loading]);

  useEffect(() => {
    loadTimeline();
  }, [loadTimeline]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(loadTimeline, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, loadTimeline]);

  const getEventIcon = (eventType: string) => {
    const iconClass = "h-5 w-5";
    switch (eventType) {
      case 'CREATED':
        return <FlagIcon className={iconClass} />;
      case 'ORIGINATOR_NOTIFIED':
        return <BellIcon className={iconClass} />;
      case 'CONTACT_NOTIFIED':
        return <PhoneIcon className={iconClass} />;
      case 'ADMIN_NOTIFIED':
        return <UserGroupIcon className={iconClass} />;
      case 'CAMPUS_SECURITY_NOTIFIED':
        return <ShieldCheckIcon className={iconClass} />;
      case 'ESCALATED':
        return <ExclamationTriangleIcon className={iconClass} />;
      case 'ACKNOWLEDGED':
        return <CheckCircleIcon className={iconClass} />;
      case 'NOTE_ADDED':
        return <ChatBubbleLeftIcon className={iconClass} />;
      case 'RESOLVED':
        return <CheckCircleIcon className={iconClass} />;
      case 'FALLBACK_CONTACT_USED':
        return <PhoneIcon className={iconClass} />;
      case 'DISPATCH_REQUESTED':
        return <BellIcon className={iconClass} />;
      default:
        return <BellIcon className={iconClass} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), 'dd MMM yyyy, HH:mm:ss', { locale: vi });
    } catch {
      return timestamp;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có sự kiện nào
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Lịch sử sự kiện
        </h3>
        <span className="text-sm text-gray-500">
          {events.length} sự kiện
        </span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative flex gap-4"
            >
              {/* Icon */}
              <div
                className={`
                  relative z-10 flex-shrink-0 w-12 h-12 rounded-full
                  flex items-center justify-center
                  bg-white border-2 shadow-sm
                  ${getEventIconColor(event.eventType).replace('text-', 'border-')}
                `}
              >
                <div className={getEventIconColor(event.eventType)}>
                  {getEventIcon(event.eventType)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Event type and time */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">
                      {formatEventType(event.eventType)}
                    </h4>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600">
                    {event.description}
                  </p>

                  {/* Metadata */}
                  {event.metadata && Object.keys(event.metadata).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <details className="group">
                        <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700">
                          Chi tiết
                        </summary>
                        <div className="mt-2 bg-gray-50 rounded p-2">
                          <pre className="text-xs text-gray-600 overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </div>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline Footer */}
      {autoRefresh && (
        <div className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Tự động cập nhật mỗi {refreshInterval / 1000} giây
          </p>
        </div>
      )}
    </div>
  );
}
