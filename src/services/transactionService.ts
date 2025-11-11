import { apiFetch, PageResponse } from '../utils/api';
import { API_ENDPOINTS } from '../config/api.config';

// =====================
// TRANSACTION TYPES
// =====================

export interface TransactionResponse {
  txnId: number;
  groupId: string;
  type: string;
  direction: 'IN' | 'OUT';
  actorKind: 'USER' | 'SYSTEM';
  actorUserId: number;
  actorUsername: string;
  systemWallet?: string;
  amount: number;
  currency: string;
  bookingId?: number;
  riderUserId?: number;
  riderUsername?: string;
  driverUserId?: number;
  driverUsername?: string;
  pspRef?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'SUCCESS';
  beforeAvail?: number;
  afterAvail?: number;
  beforePending?: number;
  afterPending?: number;
  description?: string;
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
  direction?: 'IN' | 'OUT';
  actorKind?: 'USER' | 'SYSTEM';
  dateFrom?: string;
  dateTo?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  totalRevenue: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingTransactions: number;
  failedTransactions: number;
  completedTransactions: number;
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
   * Get transaction statistics
   */
  getTransactionStats: async (): Promise<TransactionStats> => {
    try {
      // Get all transactions to calculate stats
      const response = await transactionService.getAllTransactions({ size: 1000 });
      const transactions = response.data;

      const stats: TransactionStats = {
        totalTransactions: transactions.length,
        totalAmount: 0,
        totalRevenue: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        completedTransactions: 0,
      };

      transactions.forEach(transaction => {
        stats.totalAmount += transaction.amount;
        
        // Count by status
        switch (transaction.status) {
          case 'PENDING':
            stats.pendingTransactions++;
            break;
          case 'FAILED':
          case 'CANCELLED':
            stats.failedTransactions++;
            break;
          case 'COMPLETED':
            stats.completedTransactions++;
            break;
        }

        // Count by direction and type
        if (transaction.direction === 'IN') {
          if (transaction.type === 'TOPUP' || transaction.type === 'RIDE_CAPTURE') {
            stats.totalDeposits += transaction.amount;
          }
          if (transaction.type === 'RIDE_CAPTURE') {
            stats.totalRevenue += transaction.amount;
          }
        } else if (transaction.direction === 'OUT') {
          if (transaction.type === 'PAYOUT' || transaction.type === 'RIDE_HOLD') {
            stats.totalWithdrawals += transaction.amount;
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Error calculating transaction stats:', error);
      return {
        totalTransactions: 0,
        totalAmount: 0,
        totalRevenue: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
        completedTransactions: 0,
      };
    }
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
      'TOPUP': 'Wallet Top-up',
      'RIDE_HOLD': 'Ride Payment Hold',
      'RIDE_CAPTURE': 'Ride Payment',
      'RIDE_CANCEL': 'Ride Cancellation',
      'PAYOUT': 'Driver Payout',
      'RIDE_REFUND': 'Ride Refund',
      'REFUND': 'Refund',
      'PROMO_CREDIT': 'Promotional Credit',
      'ADJUSTMENT': 'Wallet Adjustment',
      'COMMISSION': 'Commission',
    };
    return typeMap[type] || type;
  },

  /**
   * Get transaction status display name and color
   */
  getTransactionStatusDisplay: (status: string): { text: string; color: string } => {
    const statusMap: { [key: string]: { text: string; color: string } } = {
      'PENDING': { text: 'Pending', color: 'text-yellow-600' },
      'COMPLETED': { text: 'Completed', color: 'text-green-600' },
      'SUCCESS': { text: 'Success', color: 'text-green-600' },
      'FAILED': { text: 'Failed', color: 'text-red-600' },
      'CANCELLED': { text: 'Cancelled', color: 'text-gray-600' },
    };
    return statusMap[status] || { text: status, color: 'text-gray-600' };
  },

  /**
   * Get transaction direction display
   */
  getTransactionDirectionDisplay: (direction: string): { text: string; color: string; icon: string } => {
    if (direction === 'IN') {
      return { text: 'Credit', color: 'text-green-600', icon: '↗' };
    } else {
      return { text: 'Debit', color: 'text-red-600', icon: '↘' };
    }
  },
};
