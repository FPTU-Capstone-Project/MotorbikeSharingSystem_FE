/**
 * API Configuration - Auto-detect environment
 */

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

// Production API URL
const PRODUCTION_API_URL = 'https://api.mssus.it.com/api/v1';

// Determine API base URL - always use production API as the reliable fallback
const getBaseUrl = (): string => {
  // Check environment variable - must be non-empty and start with http
  const envUrl = process.env.REACT_APP_API_BASE_URL?.trim();
  if (envUrl && envUrl.startsWith('http')) {
    return envUrl;
  }
  // Always fallback to production API
  return PRODUCTION_API_URL;
};

const BASE_URL = getBaseUrl();

const API_CONFIG: ApiConfig = {
  baseURL: BASE_URL,
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
};

export const getApiConfig = (): ApiConfig => API_CONFIG;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  ADMIN_WALLET: {
    SEARCH: '/admin/wallet/search',
    ADJUSTMENT: '/admin/wallet/adjustment',
    PROMO: '/admin/wallet/promo',
    RECONCILIATION: '/admin/wallet/reconciliation',
    FREEZE: (userId: number) => `/admin/wallet/${userId}/freeze`,
  },
  REPORTS: {
    DASHBOARD: '/reports/wallet/dashboard',
    TOPUP_TRENDS: '/reports/wallet/topup-trends',
    COMMISSION: '/reports/wallet/commission',
  },
  USER_REPORTS: {
    LIST: '/user-reports',
    DETAILS: (id: number) => `/user-reports/${id}`,
    UPDATE_STATUS: (id: number) => `/user-reports/${id}`,
    RESOLVE: (id: number) => `/user-reports/${id}/resolve`,
    ANALYTICS: '/user-reports/analytics',
    MY_REPORTS: '/user-reports/my-reports',
    DRIVER_RESPONSE: (id: number) => `/user-reports/${id}/driver-response`,
    START_CHAT: (id: number) => `/user-reports/${id}/start-chat`,
  },
  VERIFICATION: {
    STUDENTS: {
      PENDING: '/verification/students/pending',
      BY_ID: (id: number) => `/verification/students/${id}`,
      APPROVE: (id: number) => `/verification/students/${id}/approve`,
      REJECT: (id: number) => `/verification/students/${id}/reject`,
      HISTORY: '/verification/students/history',
      BULK_APPROVE: '/verification/students/bulk-approve',
    },
    DRIVERS: {
      PENDING: '/verification/drivers/pending',
      KYC: (id: number) => `/verification/drivers/${id}/kyc`,
      APPROVE_DOCS: (id: number) => `/verification/drivers/${id}/approve-docs`,
      APPROVE_LICENSE: (id: number) => `/verification/drivers/${id}/approve-license`,
      APPROVE_VEHICLE: (id: number) => `/verification/drivers/${id}/approve-vehicle`,
      REJECT: (id: number) => `/verification/drivers/${id}/reject`,
      BACKGROUND_CHECK: (id: number) => `/verification/drivers/${id}/background-check`,
      STATS: '/verification/drivers/stats',
    },
  },
  VEHICLES: {
    BASE: '/vehicles',
    BY_ID: (id: number) => `/vehicles/${id}`,
    BY_DRIVER: (driverId: number) => `/vehicles/driver/${driverId}`,
    BY_STATUS: (status: string) => `/vehicles/status/${status}`,
  },
  TRANSACTIONS: {
    ALL: '/transaction/all',
    BY_USER: (userId: number) => `/transaction/user/${userId}`,
    BY_GROUP: (groupId: string) => `/transaction/group/${groupId}`,
  },
  USERS: {
    ALL: '/admin/users',
    BY_ID: (userId: number) => `/admin/users/${userId}`,
    SUSPEND: (userId: number) => `/admin/users/${userId}/suspend`,
    ACTIVATE: (userId: number) => `/admin/users/${userId}/activate`,
  },
  NOTIFICATIONS: {
    LIST: '/notifications',
    BY_ID: (id: number) => `/notifications/${id}`,
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id: number) => `/notifications/${id}`,
    DELETE_ALL: '/notifications',
  },
  LOCATIONS: {
    POIS: '/locations/pois',
  },
} as const;

export const CACHE_CONFIG = {
  SHORT: 30000,
  MEDIUM: 300000,
  LONG: 900000,
  KEYS: {
    DASHBOARD: 'dashboard_stats',
    WALLET_SEARCH: 'wallet_search',
    VERIFICATION_PENDING: 'verification_pending',
    DRIVER_STATS: 'driver_stats',
  },
} as const;
