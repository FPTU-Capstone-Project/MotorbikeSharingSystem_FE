import type { DashboardResponse } from '../types/api.types';

export const MOCK_DASHBOARD: DashboardResponse = {
  totalActiveWallets: 2847,
  totalSystemBalance: '15847500000',
  todayTopUps: '4850000',
  todayPayouts: '3250000',
  pendingTransactions: 12,
  averageWalletBalance: '5567000',
  topUpCount: 147,
  payoutCount: 89,
  generatedAt: new Date().toISOString(),
};
