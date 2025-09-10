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