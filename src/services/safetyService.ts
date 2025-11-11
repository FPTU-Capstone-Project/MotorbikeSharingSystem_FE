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
  // Map backend status to frontend status
  const statusMap: Record<string, SOSAlert['status']> = {
    'ACTIVE': 'active',
    'RESOLVED': 'resolved',
    'FALSE_ALARM': 'false_alarm',
    'ACKNOWLEDGED': 'resolved', // Treat acknowledged as resolved for frontend
    'ESCALATED': 'active', // Treat escalated as active for frontend
  };

  // Parse location from backend format
  let location = {
    lat: backendAlert.currentLat || 0,
    lng: backendAlert.currentLng || 0,
    address: backendAlert.description || 'Vị trí không xác định',
  };

  // Try to parse address from description or contactInfo if available
  if (backendAlert.contactInfo) {
    try {
      const contactInfo = JSON.parse(backendAlert.contactInfo);
      // Extract address if available in contact info
    } catch (e) {
      // Ignore parse errors
    }
  }

  return {
    id: String(backendAlert.sosId),
    userId: String(backendAlert.triggeredBy || ''),
    rideId: backendAlert.sharedRideId ? String(backendAlert.sharedRideId) : undefined,
    location,
    status: statusMap[backendAlert.status] || 'active',
    description: backendAlert.description || 'Báo động SOS',
    createdAt: backendAlert.createdAt || new Date().toISOString(),
    resolvedAt: backendAlert.resolvedAt || undefined,
    resolvedBy: backendAlert.resolvedByName || (backendAlert.resolvedBy ? String(backendAlert.resolvedBy) : undefined),
    // Store user name if available from backend
    userName: backendAlert.triggeredByName,
  };
}

