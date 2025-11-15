import { apiFetch, PageResponse } from '../utils/api';
import { API_ENDPOINTS } from '../config/api.config';

// =====================
// TRANSACTION TYPES
// =====================

export interface TransactionResponse {
  txnId: number;
  groupId: string;
  type: string;
  direction: 'IN' | 'OUT' | 'INTERNAL';
  actorKind: 'USER' | 'SYSTEM' | 'PSP';
  actorUserId?: number;
  actorUsername?: string;
  systemWallet?: string;
  amount: number;
  currency: string;
  sharedRideId?: number;
  sharedRideRequestId?: number;
  pspRef?: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REVERSED' | 'COMPLETED' | 'CANCELLED';
  beforeAvail?: number;
  afterAvail?: number;
  beforePending?: number;
  afterPending?: number;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionFilters {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  type?: string;
  status?: string;
  direction?: 'IN' | 'OUT' | 'INTERNAL';
  actorKind?: 'USER' | 'SYSTEM';
  dateFrom?: string;
  dateTo?: string;
}

// =====================
// TRANSACTION SERVICE
// =====================

export const transactionService = {
  /**
   * Get all transactions with pagination and filtering
   */
  getAllTransactions: (filters: TransactionFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    if (filters.type) params.append('type', filters.type);
    if (filters.status) params.append('status', filters.status);
    if (filters.direction) params.append('direction', filters.direction);
    if (filters.actorKind) params.append('actorKind', filters.actorKind);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    
    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.TRANSACTIONS.ALL}?${queryString}` : API_ENDPOINTS.TRANSACTIONS.ALL;
    
    return apiFetch<PageResponse<TransactionResponse>>(url);
  },

  /**
   * Get transactions by user ID
   */
  getUserTransactions: (userId: number, filters: TransactionFilters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.size !== undefined) params.append('size', filters.size.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortDir) params.append('sortDir', filters.sortDir);
    
    const queryString = params.toString();
    const url = queryString 
      ? `${API_ENDPOINTS.TRANSACTIONS.BY_USER(userId)}?${queryString}` 
      : API_ENDPOINTS.TRANSACTIONS.BY_USER(userId);
    
    return apiFetch<PageResponse<TransactionResponse>>(url);
  },

  /**
   * Get transactions by group ID
   */
  getGroupTransactions: (groupId: string) => {
    return apiFetch<TransactionResponse[]>(API_ENDPOINTS.TRANSACTIONS.BY_GROUP(groupId));
  },

  /**
   * Format transaction amount for display
   */
  formatAmount: (amount: number | null | undefined, currency: string = 'VND'): string => {
    if (amount === null || amount === undefined || !isFinite(Number(amount))) {
      return '-';
    }
    const value = Number(amount);
    if (currency === 'VND') {
      return `${value.toLocaleString()}đ`;
    }
    return `${value.toLocaleString()} ${currency}`;
  },

  /**
   * Get transaction type display name
   */
  getTransactionTypeDisplay: (type: string): string => {
    const typeMap: { [key: string]: string } = {
      TOPUP: 'Nạp ví',
      HOLD_CREATE: 'Tạo lệnh treo tiền',
      HOLD_RELEASE: 'Hoàn lệnh treo tiền',
      CAPTURE_FARE: 'Thanh toán chuyến',
      PAYOUT: 'Rút tiền khỏi ví',
      ADJUSTMENT: 'Điều chỉnh',
      REFUND: 'Hoàn tiền',
    };
    return typeMap[type] || type;
  },

  /**
   * Get transaction status display name and color
   */
  getTransactionStatusDisplay: (status: string): { text: string; color: string } => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      PENDING: { text: 'Đang xử lý', color: 'text-yellow-600' },
      SUCCESS: { text: 'Thành công', color: 'text-green-600' },
      COMPLETED: { text: 'Hoàn tất', color: 'text-green-600' },
      FAILED: { text: 'Thất bại', color: 'text-red-600' },
      REVERSED: { text: 'Đã đảo ngược', color: 'text-amber-600' },
      CANCELLED: { text: 'Đã hủy', color: 'text-gray-600' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-600' };
  },

  /**
   * Get transaction direction display
   */
  getTransactionDirectionDisplay: (direction: string): { text: string; color: string; icon: string } => {
    if (direction === 'IN') {
      return { text: 'Tiền vào', color: 'text-green-600', icon: '↗' };
    }
    if (direction === 'OUT') {
      return { text: 'Tiền ra', color: 'text-red-600', icon: '↘' };
    }
    return { text: 'Điều chuyển', color: 'text-blue-600', icon: '↔' };
  },
};
