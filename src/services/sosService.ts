import { apiFetch } from '../utils/api';
import {
  SOSAlert,
  TriggerSosRequest,
  AcknowledgeSosRequest,
  ResolveSosRequest,
  EmergencyContact,
  EmergencyContactRequest,
  SosAlertEvent,
  SosAlertEventType,
} from '../types';

/**
 * SOS API Service
 * Implements all SOS-related endpoints based on backend documentation
 */

// ============================================
// SOS Alert APIs
// ============================================

/**
 * Trigger a new SOS alert
 * POST /api/v1/sos/alerts
 */
export async function triggerSosAlert(request: TriggerSosRequest): Promise<SOSAlert> {
  const response = await apiFetch<any>('/sos/alerts', {
    method: 'POST',
    body: request,
  });
  return transformSosAlertResponse(response);
}

/**
 * Get current user's SOS alerts
 * GET /api/v1/sos/alerts/me
 */
export async function getMySOSAlerts(status?: string): Promise<SOSAlert[]> {
  const queryParams = new URLSearchParams();
  const allStatuses = ['ACTIVE', 'ESCALATED', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM'];
  if (status) {
    queryParams.append('status', status);
  } else {
    allStatuses.forEach((s) => queryParams.append('status', s));
  }
  
  const endpoint = `/sos/alerts/me${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiFetch<any>(endpoint);
  const alerts = Array.isArray(response)
    ? response
    : response?.alerts || response?.data || [];
  return alerts.map(transformSosAlertResponse);
}

/**
 * Get specific SOS alert details
 * GET /api/v1/sos/alerts/{id}
 */
export async function getSOSAlertById(alertId: number): Promise<SOSAlert> {
  const response = await apiFetch<any>(`/sos/alerts/${alertId}`);
  return transformSosAlertResponse(response);
}

/**
 * Get SOS alert timeline events
 * GET /api/v1/sos/alerts/{id}/timeline
 */
export async function getSOSAlertTimeline(alertId: number): Promise<SosAlertEvent[]> {
  const response = await apiFetch<any[]>(`/sos/alerts/${alertId}/timeline`);
  if (!Array.isArray(response)) return [];
  return response.map((event, index) => transformTimelineEvent(alertId, event, index));
}

/**
 * Get all SOS alerts (Admin only)
 * GET /api/v1/sos/alerts
 */
export interface GetSOSAlertsParams {
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

export interface SOSAlertsResponse {
  alerts: SOSAlert[];
  totalPages: number;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
}

export async function getAllSOSAlerts(params?: GetSOSAlertsParams): Promise<SOSAlertsResponse> {
  const queryParams = new URLSearchParams();
  
  const allStatuses = ['ACTIVE', 'ESCALATED', 'ACKNOWLEDGED', 'RESOLVED', 'FALSE_ALARM'];
  if (params?.status) {
    queryParams.append('status', params.status);
  } else {
    allStatuses.forEach((s) => queryParams.append('status', s));
  }
  if (params?.page !== undefined) {
    queryParams.append('page', String(params.page));
  }
  if (params?.pageSize !== undefined) {
    queryParams.append('pageSize', String(params.pageSize));
  }
  if (params?.sortBy) {
    queryParams.append('sortBy', params.sortBy);
  }
  if (params?.sortDir) {
    queryParams.append('sortDir', params.sortDir);
  }

  const endpoint = `/sos/alerts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await apiFetch<any>(endpoint);
  const alerts = Array.isArray(response)
    ? response
    : response?.alerts || response?.data || [];

  const totalRecords = response?.totalRecords ?? alerts.length;
  const pageSize = response?.pageSize ?? params?.pageSize ?? (alerts.length || 10);
  const totalPages = response?.totalPages ?? Math.max(1, Math.ceil(totalRecords / pageSize));

  return {
    alerts: alerts.map(transformSosAlertResponse),
    totalPages,
    totalRecords,
    currentPage: response?.currentPage ?? params?.page ?? 0,
    pageSize,
  };
}

/**
 * Acknowledge SOS alert (Admin only)
 * POST /api/v1/sos/alerts/{id}/acknowledge
 */
export async function acknowledgeSOSAlert(
  alertId: number,
  request?: AcknowledgeSosRequest
): Promise<SOSAlert> {
  const response = await apiFetch<any>(`/sos/alerts/${alertId}/acknowledge`, {
    method: 'POST',
    body: request || {},
  });
  return transformSosAlertResponse(response);
}

/**
 * Resolve SOS alert (Admin only)
 * POST /api/v1/sos/alerts/{id}/resolve
 */
export async function resolveSOSAlert(
  alertId: number,
  request?: ResolveSosRequest
): Promise<SOSAlert> {
  const response = await apiFetch<any>(`/sos/alerts/${alertId}/resolve`, {
    method: 'POST',
    body: request || {},
  });
  return transformSosAlertResponse(response);
}

// ============================================
// Emergency Contact APIs
// ============================================

/**
 * Get user's emergency contacts
 * GET /api/v1/sos/contacts
 */
export async function getEmergencyContacts(): Promise<EmergencyContact[]> {
  return apiFetch<EmergencyContact[]>('/sos/contacts');
}

/**
 * Create emergency contact
 * POST /api/v1/sos/contacts
 */
export async function createEmergencyContact(
  request: EmergencyContactRequest
): Promise<EmergencyContact> {
  return apiFetch<EmergencyContact>('/sos/contacts', {
    method: 'POST',
    body: request,
  });
}

/**
 * Update emergency contact
 * PUT /api/v1/sos/contacts/{id}
 */
export async function updateEmergencyContact(
  contactId: number,
  request: EmergencyContactRequest
): Promise<EmergencyContact> {
  return apiFetch<EmergencyContact>(`/sos/contacts/${contactId}`, {
    method: 'PUT',
    body: request,
  });
}

/**
 * Delete emergency contact
 * DELETE /api/v1/sos/contacts/{id}
 */
export async function deleteEmergencyContact(contactId: number): Promise<void> {
  return apiFetch<void>(`/sos/contacts/${contactId}`, {
    method: 'DELETE',
  });
}

/**
 * Set emergency contact as primary
 * POST /api/v1/sos/contacts/{id}/primary
 */
export async function setContactAsPrimary(contactId: number): Promise<EmergencyContact> {
  return apiFetch<EmergencyContact>(`/sos/contacts/${contactId}/primary`, {
    method: 'POST',
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Get user's current location
 */
export async function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Format SOS status for display
 */
export function formatSOSStatus(status: string): string {
  const statusMap: Record<string, string> = {
    ACTIVE: 'Đang hoạt động',
    ESCALATED: 'Đã báo cáo',
    ACKNOWLEDGED: 'Đã xác nhận',
    RESOLVED: 'Đã giải quyết',
    FALSE_ALARM: 'Báo động giả',
  };
  return statusMap[status] || status;
}

/**
 * Format event type for display
 */
export function formatEventType(eventType: string): string {
  const eventMap: Record<string, string> = {
    'CREATED': 'Tạo cảnh báo',
    'ORIGINATOR_NOTIFIED': 'Thông báo người gửi',
    'CONTACT_NOTIFIED': 'Thông báo liên hệ khẩn cấp',
    'ADMIN_NOTIFIED': 'Thông báo quản trị viên',
    'CAMPUS_SECURITY_NOTIFIED': 'Thông báo an ninh trường',
    'ESCALATED': 'Đã báo cáo',
    'ACKNOWLEDGED': 'Đã xác nhận',
    'NOTE_ADDED': 'Thêm ghi chú',
    'RESOLVED': 'Đã giải quyết',
    'FALLBACK_CONTACT_USED': 'Sử dụng liên hệ dự phòng',
    'DISPATCH_REQUESTED': 'Yêu cầu điều phối',
  };
  return eventMap[eventType] || eventType;
}

/**
 * Get status color class
 */
export function getStatusColorClass(status: string): string {
  const colorMap: Record<string, string> = {
    'ACTIVE': 'bg-red-100 text-red-800 border-red-300',
    'ESCALATED': 'bg-orange-100 text-orange-800 border-orange-300',
    'ACKNOWLEDGED': 'bg-blue-100 text-blue-800 border-blue-300',
    'RESOLVED': 'bg-green-100 text-green-800 border-green-300',
    'FALSE_ALARM': 'bg-gray-100 text-gray-800 border-gray-300',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
}

/**
 * Get event icon color
 */
export function getEventIconColor(eventType: string): string {
  const colorMap: Record<string, string> = {
    'CREATED': 'text-blue-600',
    'ORIGINATOR_NOTIFIED': 'text-blue-500',
    'CONTACT_NOTIFIED': 'text-purple-600',
    'ADMIN_NOTIFIED': 'text-indigo-600',
    'CAMPUS_SECURITY_NOTIFIED': 'text-red-600',
    'ESCALATED': 'text-orange-600',
    'ACKNOWLEDGED': 'text-blue-600',
    'NOTE_ADDED': 'text-gray-600',
    'RESOLVED': 'text-green-600',
    'FALLBACK_CONTACT_USED': 'text-yellow-600',
    'DISPATCH_REQUESTED': 'text-purple-600',
  };
  return colorMap[eventType] || 'text-gray-600';
}

function parseJson<T = any>(value: unknown): T | undefined {
  if (!value) return undefined;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }
  return value as T;
}

function transformTimelineEvent(
  alertId: number,
  event: any,
  index: number
): SosAlertEvent {
  const metadata = parseJson<Record<string, any>>(event?.metadata);
  const timestamp = event?.createdAt || event?.timestamp || new Date().toISOString();
  return {
    id: Number(event?.eventId ?? event?.id ?? index),
    alertId,
    eventType: (event?.eventType || 'CREATED') as SosAlertEventType,
    description: event?.description || '',
    metadata: metadata || undefined,
    timestamp,
  };
}

function transformSosAlertResponse(alert: any): SOSAlert {
  if (!alert) {
    return {
      id: '0',
      userId: '',
      triggeredByUserId: '',
      currentLat: 0,
      currentLng: 0,
      status: 'ACTIVE',
      fallbackContactUsed: false,
      autoCallTriggered: false,
      campusSecurityNotified: false,
      escalationCount: 0,
      createdAt: new Date().toISOString(),
    } as SOSAlert;
  }

  const id = alert.sosId ?? alert.id ?? alert.alertId ?? 0;
  const triggerUserId = alert.triggeredBy ?? alert.userId ?? alert.triggeredByUserId ?? '';
  const timeline = Array.isArray(alert.timeline)
    ? alert.timeline.map((event: any, idx: number) =>
        transformTimelineEvent(Number(id), event, idx)
      )
    : undefined;

  return {
    id: String(id),
    userId: triggerUserId ? String(triggerUserId) : '',
    triggeredByUserId: triggerUserId ? String(triggerUserId) : '',
    sharedRideId: alert.sharedRideId ? String(alert.sharedRideId) : undefined,
    currentLat: alert.currentLat ?? 0,
    currentLng: alert.currentLng ?? 0,
    description: alert.description || undefined,
    status: (alert.status || 'ACTIVE') as any,
    contactInfo: parseJson(alert.contactInfo) || alert.contactInfo,
    rideSnapshot: parseJson(alert.rideSnapshot) || alert.rideSnapshot,
    fallbackContactUsed: Boolean(alert.fallbackContactUsed),
    autoCallTriggered: Boolean(alert.autoCallTriggered),
    campusSecurityNotified: Boolean(alert.campusSecurityNotified),
    acknowledgementDeadline: alert.acknowledgementDeadline || alert.ackDeadline,
    acknowledgedAt: alert.acknowledgedAt,
    acknowledgedByUserId: alert.acknowledgedBy ? String(alert.acknowledgedBy) : undefined,
    acknowledgedByName: alert.acknowledgedByName,
    resolvedAt: alert.resolvedAt,
    resolvedByUserId: alert.resolvedBy ? String(alert.resolvedBy) : undefined,
    resolvedByName: alert.resolvedByName,
    resolutionNotes: alert.resolutionNotes,
    lastEscalatedAt: alert.lastEscalatedAt,
    nextEscalationAt: alert.nextEscalationAt,
    escalationCount: alert.escalationCount ?? 0,
    createdAt: alert.createdAt || new Date().toISOString(),
    updatedAt: alert.updatedAt,
    userName: alert.triggeredByName || alert.userName,
    userPhone: alert.userPhone,
    location: {
      lat: alert.currentLat ?? 0,
      lng: alert.currentLng ?? 0,
      address: alert.location?.address || alert.description || undefined,
    },
    rideId: alert.sharedRideId ? String(alert.sharedRideId) : undefined,
    resolvedBy: alert.resolvedByName || (alert.resolvedBy ? String(alert.resolvedBy) : undefined),
    timeline,
  } as SOSAlert;
}
