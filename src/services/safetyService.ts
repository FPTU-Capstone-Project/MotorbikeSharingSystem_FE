import { apiFetch } from '../utils/api';
import { SOSAlert } from '../types';

export interface SafetyDashboardStats {
  activeAlertsCount: number;
  resolvedTodayCount: number;
  averageResponseTimeMinutes: number;
  totalAlertsCount: number;
  approvedDriversCount: number;
  pendingDriversCount: number;
  rejectedDriversCount: number;
  driverVerificationPercentage: number;
  escalatedAlertsCount: number;
  falseAlarmCount: number;
  acknowledgedAlertsCount: number;
}

export interface SafetyAlertsListResponse {
  alerts: SOSAlert[];
  totalPages: number;
  totalRecords: number;
  currentPage: number;
  pageSize: number;
}

export interface SafetyAlertsListParams {
  status?: 'ACTIVE' | 'RESOLVED' | 'FALSE_ALARM' | 'ACKNOWLEDGED' | 'ESCALATED';
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

/**
 * Get safety dashboard statistics
 */
export async function getSafetyDashboardStats(): Promise<SafetyDashboardStats> {
  return apiFetch<SafetyDashboardStats>('/safety/dashboard/stats');
}

/**
 * Get paginated list of SOS alerts
 */
export async function getSafetyAlertsList(params?: SafetyAlertsListParams): Promise<SafetyAlertsListResponse> {
  const queryParams = new URLSearchParams();
  
  if (params?.status) {
    queryParams.append('status', params.status);
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

  const queryString = queryParams.toString();
  const endpoint = `/safety/alerts${queryString ? `?${queryString}` : ''}`;
  
  const response = await apiFetch<SafetyAlertsListResponse>(endpoint);
  
  // Transform backend response to match frontend types
  return {
    ...response,
    alerts: response.alerts.map(transformSosAlert),
  };
}

/**
 * Mark SOS alert as resolved
 */
export async function markAlertAsResolved(alertId: number, notes?: string): Promise<void> {
  const queryParams = new URLSearchParams();
  if (notes) {
    queryParams.append('notes', notes);
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/safety/alerts/${alertId}/resolve${queryString ? `?${queryString}` : ''}`;
  
  await apiFetch(endpoint, {
    method: 'POST',
  });
}

/**
 * Mark SOS alert as false alarm
 */
export async function markAlertAsFalseAlarm(alertId: number, notes?: string): Promise<void> {
  await apiFetch(`/safety/alerts/${alertId}/false-alarm`, {
    method: 'POST',
    body: notes ? { notes } : undefined,
  });
}

/**
 * Transform backend SOS alert response to frontend SOSAlert type
 */
function transformSosAlert(backendAlert: any): SOSAlert {
  // Parse location from backend format
  const location = {
    lat: backendAlert.currentLat || 0,
    lng: backendAlert.currentLng || 0,
    address: backendAlert.description || 'Vị trí không xác định',
  };

  return {
    id: String(backendAlert.sosId || backendAlert.id),
    userId: String(backendAlert.triggeredBy || backendAlert.userId || ''),
    triggeredByUserId: String(backendAlert.triggeredBy || backendAlert.userId || ''),
    currentLat: backendAlert.currentLat || 0,
    currentLng: backendAlert.currentLng || 0,
    sharedRideId: backendAlert.sharedRideId ? String(backendAlert.sharedRideId) : undefined,
    description: backendAlert.description,
    status: backendAlert.status || 'ACTIVE',
    contactInfo: backendAlert.contactInfo,
    rideSnapshot: backendAlert.rideSnapshot,
    fallbackContactUsed: backendAlert.fallbackContactUsed || false,
    autoCallTriggered: backendAlert.autoCallTriggered || false,
    campusSecurityNotified: backendAlert.campusSecurityNotified || false,
    acknowledgementDeadline: backendAlert.acknowledgementDeadline,
    acknowledgedAt: backendAlert.acknowledgedAt,
    acknowledgedByUserId: backendAlert.acknowledgedBy ? String(backendAlert.acknowledgedBy) : undefined,
    acknowledgedByName: backendAlert.acknowledgedByName,
    resolvedAt: backendAlert.resolvedAt,
    resolvedByUserId: backendAlert.resolvedBy ? String(backendAlert.resolvedBy) : undefined,
    resolvedByName: backendAlert.resolvedByName,
    resolutionNotes: backendAlert.resolutionNotes,
    lastEscalatedAt: backendAlert.lastEscalatedAt,
    nextEscalationAt: backendAlert.nextEscalationAt,
    escalationCount: backendAlert.escalationCount || 0,
    createdAt: backendAlert.createdAt || new Date().toISOString(),
    updatedAt: backendAlert.updatedAt,
    userName: backendAlert.triggeredByName || backendAlert.userName,
    userPhone: backendAlert.userPhone,
    location,
    // Legacy compatibility
    rideId: backendAlert.sharedRideId ? String(backendAlert.sharedRideId) : undefined,
    resolvedBy: backendAlert.resolvedByName || (backendAlert.resolvedBy ? String(backendAlert.resolvedBy) : undefined),
  };
}

