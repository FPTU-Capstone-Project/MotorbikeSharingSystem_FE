/**
 * API Configuration - Switch between local and production
 */

export enum ApiEnvironment {
  LOCAL = 'local',
  DEPLOY = 'deploy'
}

// Toggle between environments by commenting/uncommenting
export const CURRENT_ENV: ApiEnvironment = ApiEnvironment.LOCAL;
// export const CURRENT_ENV: ApiEnvironment = ApiEnvironment.DEPLOY;

interface ApiConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

const API_CONFIGS: Record<ApiEnvironment, ApiConfig> = {
  [ApiEnvironment.LOCAL]: {
    baseURL: 'http://localhost:8081/api/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  [ApiEnvironment.DEPLOY]: {
    baseURL: 'https://your-production-domain.com/api/v1',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
};

export const getApiConfig = (): ApiConfig => API_CONFIGS[CURRENT_ENV];

export const API_ENDPOINTS = {
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
