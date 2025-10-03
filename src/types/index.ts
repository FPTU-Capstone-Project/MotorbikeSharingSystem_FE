export interface User {
  id: string
  email: string
  name: string
  role: 'student' | 'driver' | 'admin'
  isVerified: boolean
  studentId?: string
  phoneNumber: string
  emergencyContact?: {
    name: string
    phone: string
  }
  avatar?: string
  createdAt: string
  lastActive: string
  status: 'active' | 'inactive' | 'suspended'
}

export interface Driver extends User {
  role: 'driver'
  licenseNumber: string
  vehicleInfo: {
    brand: string
    model: string
    plateNumber: string
    color: string
  }
  rating: number
  totalRides: number
  earnings: number
  isAvailable: boolean
  backgroundCheckStatus: 'pending' | 'approved' | 'rejected'
  trainingCompleted: boolean
}

export interface Ride {
  id: string
  riderId: string
  driverId: string
  pickupLocation: {
    lat: number
    lng: number
    address: string
  }
  destination: {
    lat: number
    lng: number
    address: string
  }
  status: 'pending' | 'accepted' | 'ongoing' | 'completed' | 'cancelled'
  type: 'solo' | 'shared'
  fare: number
  distance: number
  duration: number
  createdAt: string
  completedAt?: string
  rating?: number
  feedback?: string
  sharedWith?: string[]
  paymentStatus: 'pending' | 'completed' | 'failed'
}

export interface Payment {
  id: string
  userId: string
  type: 'deposit' | 'ride_payment' | 'withdrawal'
  amount: number
  status: 'pending' | 'completed' | 'failed'
  method: 'wallet' | 'card' | 'bank_transfer'
  description: string
  createdAt: string
  rideId?: string
}

export interface SOSAlert {
  id: string
  userId: string
  rideId?: string
  location: {
    lat: number
    lng: number
    address: string
  }
  status: 'active' | 'resolved' | 'false_alarm'
  description?: string
  createdAt: string
  resolvedAt?: string
  resolvedBy?: string
}

export interface Analytics {
  totalUsers: number
  totalDrivers: number
  totalRides: number
  totalRevenue: number
  activeRides: number
  pendingVerifications: number
  activeSOSAlerts: number
  dailyGrowth: {
    users: number
    rides: number
    revenue: number
  }
  monthlyStats: {
    month: string
    users: number
    rides: number
    revenue: number
  }[]
  rideStatusDistribution: {
    completed: number
    ongoing: number
    cancelled: number
  }
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  isRead: boolean
  createdAt: string
  userId?: string
  rideId?: string
}

export interface Vehicle {
  id: string
  driverId: string
  plateNumber: string
  model: string
  color: string
  year: number
  insuranceExpiry: string
  status: 'active' | 'inactive' | 'maintenance'
  createdAt: string
  updatedAt: string
}

export interface VehicleVerification {
  id: string
  driverId: string
  vehicleId: string
  driverName: string
  driverEmail: string
  driverPhone: string
  plateNumber: string
  model: string
  color: string
  year: number
  insuranceExpiry: string
  status: 'pending' | 'approved' | 'rejected'
  verificationType: 'vehicle_registration' | 'insurance' | 'vehicle_photos'
  documents: {
    registrationUrl?: string
    insuranceUrl?: string
    frontPhotoUrl?: string
    sidePhotoUrl?: string
    platePhotoUrl?: string
  }
  submittedAt: string
  verifiedAt?: string
  verifiedBy?: string
  rejectionReason?: string
}

// Backend DTOs
export interface VerificationItem {
  verification_id: number;
  user_id: number;
  type: 'STUDENT_ID' | 'DRIVER_LICENSE' | 'DRIVER_DOCUMENTS' | 'VEHICLE_REGISTRATION' | 'BACKGROUND_CHECK';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  document_url?: string;
  document_type?: 'IMAGE' | 'PDF';
  metadata?: string;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  expires_at?: string;
  created_at: string;
}

export interface DriverKycItemDTO {
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  driverStatus: string;
  verifications: Array<{
    verificationId: number;
    type: 'DRIVER_DOCUMENTS' | 'DRIVER_LICENSE' | 'VEHICLE_REGISTRATION' | 'BACKGROUND_CHECK' | 'STUDENT_ID';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    documentUrl?: string;
    documentType?: string;
    rejectionReason?: string;
    verifiedBy?: string;
    verifiedAt?: string;
    createdAt?: string;
  }>;
  createdAt?: string;
}


export interface FileUpload {
  id: string
  userId: string
  fileType: 'license' | 'identity_card' | 'passport' | 'vehicle_registration' | 'insurance' | 'profile_photo'
  fileUrl: string
  fileName: string
  fileSize: number
  uploadedAt: string
  status: 'active' | 'deleted'
}

export interface Verification {
  id: string
  userId: string
  verificationType: 'STUDENT_ID' | 'DRIVER_LICENSE' | 'BACKGROUND_CHECK' | 'VEHICLE_REGISTRATION'
  status: 'pending' | 'approved' | 'rejected'
  documentUrls: string[]
  submittedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
}

// Transaction type (alias for Payment for backend compatibility)
export type Transaction = Payment

// Dashboard Statistics
export interface DashboardStats {
  totalUsers: number
  totalDrivers: number
  totalRides: number
  totalRevenue: number
  activeRides: number
  pendingVerifications: number
  activeSOSAlerts: number
  recentTransactions?: Transaction[]
  userGrowth?: {
    period: string
    count: number
  }[]
  rideStatistics?: {
    completed: number
    ongoing: number
    cancelled: number
  }
}