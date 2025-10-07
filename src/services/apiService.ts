import { apiFetch, PageResponse } from '../utils/api';
import {
  User,
  Ride,
  Transaction,
  SOSAlert,
  DashboardStats
} from '../types';

// =====================
// AUTH ENDPOINTS
// =====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phoneNumber: string;
  fullName: string;
  studentId?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export const authService = {
  login: (data: LoginRequest) =>
    apiFetch<AuthResponse>('/auth/login', { method: 'POST', body: data }),

  register: (data: RegisterRequest) =>
    apiFetch<AuthResponse>('/auth/register', { method: 'POST', body: data }),

  logout: () =>
    apiFetch('/auth/logout', { method: 'POST' }),

  refreshToken: (refreshToken: string) =>
    apiFetch<AuthResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken }
    }),

  verifyEmail: (token: string) =>
    apiFetch('/auth/verify-email', { method: 'POST', body: { token } }),
};

// =====================
// USER ENDPOINTS
// =====================

export const userService = {
  // Get all users (admin)
  getUsers: (page = 0, size = 10, role?: string, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    return apiFetch<PageResponse<User>>(`/users?${params}`);
  },

  // Get user by ID
  getUserById: (id: string) =>
    apiFetch<User>(`/users/${id}`),

  // Get current user profile
  getCurrentUser: () =>
    apiFetch<User>('/profile'),

  // Update user profile
  updateProfile: (data: Partial<User>) =>
    apiFetch<User>('/profile', { method: 'PUT', body: data }),

  // Upgrade to driver
  upgradeToDriver: () =>
    apiFetch('/profile/upgrade-to-driver', { method: 'POST' }),

  // Update user status (admin)
  updateUserStatus: (userId: string, status: string) =>
    apiFetch(`/users/${userId}/status`, {
      method: 'PUT',
      body: { status }
    }),

  // Delete user (admin)
  deleteUser: (userId: string) =>
    apiFetch(`/users/${userId}`, { method: 'DELETE' }),
};

// =====================
// WALLET ENDPOINTS
// =====================

export interface WalletBalance {
  userId: number;
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  currency: string;
}

export interface TopUpRequest {
  amount: number;
  returnUrl?: string;
  cancelUrl?: string;
}

export const walletService = {
  getBalance: () =>
    apiFetch<WalletBalance>('/wallet/balance'),

  getTransactions: (page = 0, size = 10) =>
    apiFetch<PageResponse<Transaction>>(`/wallet/transactions?page=${page}&size=${size}`),

  createTopUp: (data: TopUpRequest) =>
    apiFetch('/wallet/topup', { method: 'POST', body: data }),

  getAllTransactions: (page = 0, size = 10, type?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (type) params.append('type', type);
    return apiFetch<PageResponse<Transaction>>(`/admin/transactions?${params}`);
  },
};

// =====================
// RIDE ENDPOINTS
// =====================

export interface CreateRideRequest {
  pickupLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  dropoffLocation: {
    latitude: number;
    longitude: number;
    address: string;
  };
  scheduledTime?: string;
  maxPassengers?: number;
  pricePerSeat?: number;
}

export const rideService = {
  // Get all rides (admin)
  getAllRides: (page = 0, size = 10, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    return apiFetch<PageResponse<Ride>>(`/admin/rides?${params}`);
  },

  // Get ride by ID
  getRideById: (id: string) =>
    apiFetch<Ride>(`/rides/${id}`),

  // Create new ride request
  createRide: (data: CreateRideRequest) =>
    apiFetch<Ride>('/rides', { method: 'POST', body: data }),

  // Get user's rides
  getMyRides: (page = 0, size = 10) =>
    apiFetch<PageResponse<Ride>>(`/rides/my-rides?page=${page}&size=${size}`),

  // Cancel ride
  cancelRide: (rideId: string, reason?: string) =>
    apiFetch(`/rides/${rideId}/cancel`, {
      method: 'POST',
      body: { reason }
    }),

  // Complete ride
  completeRide: (rideId: string) =>
    apiFetch(`/rides/${rideId}/complete`, { method: 'POST' }),

  // Rate ride
  rateRide: (rideId: string, rating: number, comment?: string) =>
    apiFetch(`/rides/${rideId}/rate`, {
      method: 'POST',
      body: { rating, comment }
    }),
};

// =====================
// VEHICLE ENDPOINTS
// =====================

export interface Vehicle {
  id: number;
  driverId: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicleType: string;
  registrationDocument?: string;
  insuranceDocument?: string;
  photos: string[];
  isVerified: boolean;
  verificationStatus: string;
  createdAt: string;
}

export interface CreateVehicleRequest {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  vehicleType: string;
}

export const vehicleService = {
  // Admin: Get all vehicles with pagination and sorting
  getAllVehicles: (page = 0, size = 10, sortBy: string = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') =>
    apiFetch<PageResponse<any>>(`/vehicles?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),

  // Admin: Get vehicles by status with pagination
  getVehiclesByStatus: (status: string, page = 0, size = 10, sortBy: string = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') =>
    apiFetch<PageResponse<any>>(`/vehicles/status/${encodeURIComponent(status)}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`),
  getMyVehicles: () =>
    apiFetch<Vehicle[]>('/vehicles/my-vehicles'),

  getVehicleById: (id: number) =>
    apiFetch<Vehicle>(`/vehicles/${id}`),

  createVehicle: (data: CreateVehicleRequest) =>
    apiFetch<Vehicle>('/vehicles', { method: 'POST', body: data }),

  updateVehicle: (id: number, data: Partial<CreateVehicleRequest>) =>
    apiFetch<Vehicle>(`/vehicles/${id}`, { method: 'PUT', body: data }),

  deleteVehicle: (id: number) =>
    apiFetch(`/vehicles/${id}`, { method: 'DELETE' }),

  uploadVehiclePhoto: (vehicleId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch<{ url: string }>(`/vehicles/${vehicleId}/photos`, {
      method: 'POST',
      body: formData
    });
  },
};

// =====================
// SOS ALERT ENDPOINTS
// =====================

export interface CreateSOSRequest {
  latitude: number;
  longitude: number;
  description?: string;
  rideId?: string;
}

export const sosService = {
  // Get all SOS alerts (admin)
  getAllAlerts: (page = 0, size = 10, status?: string) => {
    const params = new URLSearchParams({ page: page.toString(), size: size.toString() });
    if (status) params.append('status', status);
    return apiFetch<PageResponse<SOSAlert>>(`/admin/sos-alerts?${params}`);
  },

  // Get alert by ID
  getAlertById: (id: string) =>
    apiFetch<SOSAlert>(`/sos-alerts/${id}`),

  // Create SOS alert
  createAlert: (data: CreateSOSRequest) =>
    apiFetch<SOSAlert>('/sos-alerts', { method: 'POST', body: data }),

  // Resolve SOS alert (admin)
  resolveAlert: (id: string, notes?: string) =>
    apiFetch(`/admin/sos-alerts/${id}/resolve`, {
      method: 'POST',
      body: { notes }
    }),

  // Escalate SOS alert (admin)
  escalateAlert: (id: string, notes?: string) =>
    apiFetch(`/admin/sos-alerts/${id}/escalate`, {
      method: 'POST',
      body: { notes }
    }),
};

// =====================
// OTP ENDPOINTS
// =====================

export interface SendOTPRequest {
  phoneNumber: string;
  purpose: 'VERIFICATION' | 'PASSWORD_RESET';
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  code: string;
  purpose: 'VERIFICATION' | 'PASSWORD_RESET';
}

export const otpService = {
  sendOTP: (data: SendOTPRequest) =>
    apiFetch('/otp/send', { method: 'POST', body: data }),

  verifyOTP: (data: VerifyOTPRequest) =>
    apiFetch('/otp/verify', { method: 'POST', body: data }),
};

// =====================
// DASHBOARD/REPORTS ENDPOINTS
// =====================

export const reportService = {
  getDashboardStats: () =>
    apiFetch<DashboardStats>('/report/dashboard'),

  getRevenueReport: (startDate: string, endDate: string) =>
    apiFetch(`/report/revenue?startDate=${startDate}&endDate=${endDate}`),

  getUserGrowthReport: (period: 'week' | 'month' | 'year') =>
    apiFetch(`/report/user-growth?period=${period}`),

  getRideStatistics: (period: 'week' | 'month' | 'year') =>
    apiFetch(`/report/ride-statistics?period=${period}`),
};

// =====================
// PAYOS PAYMENT ENDPOINTS
// =====================

export const paymentService = {
  createTopUpLink: (amount: number) =>
    apiFetch<{ checkoutUrl: string; orderId: string }>(
      '/payos/create-topup-link',
      { method: 'POST', body: { amount } }
    ),

  getPaymentStatus: (orderId: string) =>
    apiFetch(`/payos/payment-status/${orderId}`),
};
