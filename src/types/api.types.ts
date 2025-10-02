export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  empty: boolean;
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
