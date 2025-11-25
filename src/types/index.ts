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

export interface ChatMessage {
  id: string
  senderId: string
  recipientId: string
  content: string
  timestamp: string
  status: 'sent' | 'delivered' | 'read'
  attachments?: Array<{
    id: string
    name: string
    url: string
    type: string
  }>
  metadata?: {
    important?: boolean
    automated?: boolean
  }
}

export interface ChatThread {
  userId: string
  lastMessageAt: string
  unreadCount: number
  messages: ChatMessage[]
  tags?: string[]
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

// SOS Alert Types - Based on backend implementation
export type SosAlertStatus = 'ACTIVE' | 'ESCALATED' | 'ACKNOWLEDGED' | 'RESOLVED' | 'FALSE_ALARM';

export type SosAlertEventType = 
  | 'CREATED'
  | 'ORIGINATOR_NOTIFIED'
  | 'CONTACT_NOTIFIED'
  | 'ADMIN_NOTIFIED'
  | 'CAMPUS_SECURITY_NOTIFIED'
  | 'ESCALATED'
  | 'ACKNOWLEDGED'
  | 'NOTE_ADDED'
  | 'RESOLVED'
  | 'FALLBACK_CONTACT_USED'
  | 'DISPATCH_REQUESTED';

export interface EmergencyContact {
  id: number;
  userId: number;
  name: string;
  phone: string;
  relationship?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface SosAlertEvent {
  id: number;
  alertId: number;
  eventType: SosAlertEventType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  triggeredByUserId: string;
  sharedRideId?: string;
  currentLat: number;
  currentLng: number;
  description?: string;
  status: SosAlertStatus;
  contactInfo?: EmergencyContact[];
  rideSnapshot?: any;
  fallbackContactUsed: boolean;
  autoCallTriggered: boolean;
  campusSecurityNotified: boolean;
  acknowledgementDeadline?: string;
  acknowledgedAt?: string;
  acknowledgedByUserId?: string;
  acknowledgedByName?: string;
  resolvedAt?: string;
  resolvedByUserId?: string;
  resolvedByName?: string;
  resolutionNotes?: string;
  lastEscalatedAt?: string;
  nextEscalationAt?: string;
  escalationCount: number;
  createdAt: string;
  updatedAt?: string;
  
  // Helper fields from backend
  userName?: string;
  userPhone?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  timeline?: SosAlertEvent[];
  riderPhone?: string;
  driverPhone?: string;
  
  // Legacy compatibility
  rideId?: string;
  resolvedBy?: string;
}

export interface TriggerSosRequest {
  sharedRideId?: number;
  currentLat: number;
  currentLng: number;
  description?: string;
  rideSnapshot?: any;
  forceFallbackCall?: boolean;
}

export interface AcknowledgeSosRequest {
  note?: string;
}

export interface ResolveSosRequest {
  resolutionNotes?: string;
  falseAlarm?: boolean;
}

export interface EmergencyContactRequest {
  name: string;
  phone: string;
  relationship?: string;
  isPrimary?: boolean;
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
  userStatus: string
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
export interface ProfileVerification {
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

// Transaction Verification
export interface TransactionVerification {
  id: number
  transactionId: number
  userId: number
  verificationType: 'PAYMENT_VERIFICATION' | 'REFUND_VERIFICATION' | 'DISPUTE_RESOLUTION'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  amount: number
  currency: string
  paymentMethod: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'WALLET' | 'CASH'
  transactionReference?: string
  bankReference?: string
  verificationNotes?: string
  rejectionReason?: string
  verifiedBy?: string
  verifiedAt?: string
  createdAt: string
  updatedAt?: string
  documents?: {
    receiptUrl?: string
    bankStatementUrl?: string
    disputeEvidenceUrl?: string
  }
  metadata?: Record<string, any>
}

// User Management Types
export interface RiderProfile {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  rider_id: number
  emergency_contact: string
  total_rides: number
  total_spent: number
  preferred_payment_method: 'WALLET' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH'
  created_at: string
  suspended_at?: string
  activated_at?: string
}

export interface DriverProfile {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'REJECTED' | 'PENDING'
  driver_id: number
  license_number: string
  license_verified_at: string
  rating_avg: number
  total_shared_rides: number
  total_earned: number
  commission_rate: number
  is_available: boolean
  max_passengers: number
  created_at: string
  suspended_at?: string
  activated_at?: string
}

export interface UserManagementItem {
  email: string
  phone: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  user_id: number
  full_name: string
  student_id: string
  user_type: 'USER' | 'ADMIN' | 'MODERATOR'
  profile_photo_url: string
  email_verified: boolean
  phone_verified: boolean
  created_at: string
  updated_at: string
  rider_profile?: RiderProfile
  driver_profile?: DriverProfile
}

export * from './routes.types';
