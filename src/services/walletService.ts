import { httpClient } from '../api/http-client';
import { getApiConfig } from '../config/api.config';

// =====================
// WALLET TYPES
// =====================

export interface WalletResponse {
  walletId: number;
  userId: number;
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TopUpInitRequest {
  amount: number;
  paymentMethod: string;
}

export interface TopUpInitResponse {
  topUpRef: string;
  amount: number;
  status: string;
  paymentUrl?: string;
  expiresAt?: string;
}

export interface PayoutInitRequest {
  mode?: 'MANUAL' | 'AUTOMATIC';
  amount: number;
  bankAccountNumber: string;
  bankName: string;
  accountHolderName: string;
  bankBin: string;
  categories?: string[];
}

export interface PayoutInitResponse {
  payoutRef: string;
  amount: number;
  status: string;
  estimatedCompletionTime?: string;
  maskedAccountNumber: string;
}

export interface DriverEarningsResponse {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  totalTrips: number;
  periodStart?: string;
  periodEnd?: string;
}

export interface PendingPayoutResponse {
  payoutRef: string;
  amount: number;
  bankName: string;
  maskedAccountNumber: string;
  accountHolderName: string;
  userEmail: string;
  userId: number;
  status: string;
  requestedAt: string;
}

export interface PayoutProcessResponse {
  payoutRef: string;
  amount: number;
  status: string;
  evidenceUrl?: string;
  notes?: string;
  processedAt: string;
}

// =====================
// WALLET SERVICE
// =====================

export const walletService = {
  /**
   * Get wallet balance
   * GET /api/v1/wallet/balance
   */
  getBalance: async (): Promise<WalletResponse> => {
    return httpClient.get<WalletResponse>('/wallet/balance');
  },

  /**
   * Initiate top-up
   * POST /api/v1/wallet/topup/init
   */
  initiateTopUp: async (request: TopUpInitRequest): Promise<TopUpInitResponse> => {
    return httpClient.post<TopUpInitResponse>('/wallet/topup/init', request);
  },

  /**
   * Initiate payout
   * POST /api/v1/wallet/payout/init
   */
  initiatePayout: async (request: PayoutInitRequest): Promise<PayoutInitResponse> => {
    return httpClient.post<PayoutInitResponse>('/wallet/payout/init', request);
  },

  /**
   * Get driver earnings
   * GET /api/v1/wallet/earnings
   */
  getDriverEarnings: async (): Promise<DriverEarningsResponse> => {
    return httpClient.get<DriverEarningsResponse>('/wallet/earnings');
  },

  /**
   * List pending payouts (Admin only)
   * GET /api/v1/wallet/payout/pending
   */
  getPendingPayouts: async (): Promise<PendingPayoutResponse[]> => {
    return httpClient.get<PendingPayoutResponse[]>('/wallet/payout/pending');
  },

  /**
   * Mark payout as processing (Admin only)
   * PUT /api/v1/wallet/payout/{payoutRef}/process
   */
  processPayout: async (payoutRef: string): Promise<PayoutProcessResponse> => {
    return httpClient.put<PayoutProcessResponse>(`/wallet/payout/${payoutRef}/process`);
  },

  /**
   * Complete payout with evidence (Admin only)
   * PUT /api/v1/wallet/payout/{payoutRef}/complete
   */
  completePayout: async (
    payoutRef: string,
    evidenceFile: File,
    notes?: string
  ): Promise<PayoutProcessResponse> => {
    const formData = new FormData();
    formData.append('evidenceFile', evidenceFile);
    if (notes) {
      formData.append('notes', notes);
    }

    const config = getApiConfig();
    const url = `${config.baseURL}/wallet/payout/${payoutRef}/complete`;
    const token = httpClient.getAuthToken();

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  /**
   * Fail payout with reason (Admin only)
   * PUT /api/v1/wallet/payout/{payoutRef}/fail
   */
  failPayout: async (payoutRef: string, reason: string): Promise<PayoutProcessResponse> => {
    const config = getApiConfig();
    const url = `${config.baseURL}/wallet/payout/${payoutRef}/fail?reason=${encodeURIComponent(reason)}`;
    const token = httpClient.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },
};

