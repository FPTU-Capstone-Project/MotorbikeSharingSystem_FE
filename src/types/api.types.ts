export interface PageResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_records: number;
  };
  // Legacy support (for backward compatibility)
  content?: T[];
  pageNumber?: number;
  pageSize?: number;
  totalElements?: number;
  totalPages?: number;
  last?: boolean;
  first?: boolean;
  empty?: boolean;
}

export interface MessageResponse {
  message: string;
  timestamp?: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
  path?: string;
}

export interface DashboardResponse {
  totalActiveWallets: number;
  totalSystemBalance: string;
  todayTopUps: string;
  todayPayouts: string;
  pendingTransactions: number;
  averageWalletBalance: string;
  topUpCount: number;
  payoutCount: number;
  generatedAt: string;
}

export interface WalletResponse {
  userId: number;
  email: string;
  role: string;
  balance: string;
  availableBalance: string;
  heldAmount: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}

// User Report Types
export type ReportType = 'SAFETY' | 'BEHAVIOR' | 'RIDE_EXPERIENCE' | 'PAYMENT' | 'ROUTE' | 'TECHNICAL' | 'OTHER';
export type ReportStatus = 'PENDING' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'DISMISSED';
export type ReportPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface UserReportSummary {
  reportId: number;
  reportType: ReportType;
  status: ReportStatus;
  priority: ReportPriority;
  description: string;
  reporterId: number;
  reporterName: string;
  sharedRideId?: number;
  driverId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserReportDetails extends UserReportSummary {
  reporterEmail: string;
  reportedUserId?: number;
  reportedUserName?: string;
  reportedUserEmail?: string;
  resolverId?: number;
  resolverName?: string;
  resolutionMessage?: string;
  driverName?: string;
  adminNotes?: string;
  driverResponse?: string;
  driverRespondedAt?: string;
  escalatedAt?: string;
  escalationReason?: string;
  resolvedAt?: string;
}

export interface ReportAnalytics {
  totalReports: number;
  pendingReports: number;
  openReports: number;
  inProgressReports: number;
  resolvedReports: number;
  dismissedReports: number;
  escalatedReports: number;
  reportsByType: Record<string, number>;
  reportsByPriority: Record<string, number>;
  reportsByStatus: Record<string, number>;
  averageResolutionTimeHours: number;
  reportsToday: number;
  reportsThisWeek: number;
  reportsThisMonth: number;
  topReportedDrivers: DriverReportStats[];
}

export interface DriverReportStats {
  driverId: number;
  driverName: string;
  reportCount: number;
  criticalReports: number;
}

export interface UpdateReportStatusRequest {
  status: ReportStatus;
  adminNotes?: string;
}

export interface ResolveReportRequest {
  resolutionMessage: string;
}

export interface DriverResponseRequest {
  driverResponse: string;
}

export interface StartReportChatRequest {
  targetUserId: number;
  initialMessage?: string;
}

// Chat Types
export type MessageType = 'TEXT' | 'IMAGE' | 'SYSTEM';
export type ConversationType = 'RIDE_REQUEST' | 'REPORT';

export interface ChatMessageResponse {
  messageId: number;
  senderId: number;
  senderName: string;
  senderPhotoUrl?: string;
  receiverId: number;
  receiverName: string;
  receiverPhotoUrl?: string;
  conversationId: string;
  conversationType: ConversationType;
  rideRequestId?: number;
  reportId?: number;
  messageType: MessageType;
  content: string;
  metadata?: string;
  isRead: boolean;
  readAt?: string;
  sentAt: string;
}

export interface SendMessageRequest {
  receiverId: number;
  reportId?: number;
  rideRequestId?: number;
  messageType?: MessageType;
  content: string;
}