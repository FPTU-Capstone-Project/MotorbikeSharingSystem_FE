import { httpClient } from './http-client';
import { API_ENDPOINTS, CACHE_CONFIG } from '../config/api.config';
import type { DashboardResponse } from '../types/api.types';

export class ReportsAPI {
  static async getDashboard(): Promise<DashboardResponse> {
    return httpClient.get<DashboardResponse>(
      API_ENDPOINTS.REPORTS.DASHBOARD,
      undefined,
      {
        enableCache: true,
        cacheDuration: CACHE_CONFIG.SHORT,
      }
    );
  }
}
