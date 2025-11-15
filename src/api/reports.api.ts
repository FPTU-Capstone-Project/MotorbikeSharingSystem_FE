import { httpClient } from './http-client';
import { API_ENDPOINTS, CACHE_CONFIG } from '../config/api.config';
import type {
  DashboardResponse,
  PageResponse,
  UserReportSummary,
  UserReportDetails,
  ReportAnalytics,
  UpdateReportStatusRequest,
  ResolveReportRequest,
  DriverResponseRequest,
  StartReportChatRequest,
  MessageResponse,
  PaginationParams,
  ReportStatus,
  ReportType,
} from '../types/api.types';

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

export class UserReportsAPI {
  /**
   * Get all user reports with filters (Admin only)
   */
  static async getReports(
    params: PaginationParams & {
      status?: ReportStatus;
      reportType?: ReportType;
    } = {}
  ): Promise<PageResponse<UserReportSummary>> {
    return httpClient.get<PageResponse<UserReportSummary>>(
      API_ENDPOINTS.USER_REPORTS.LIST,
      params,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Get report details by ID (Admin only)
   */
  static async getReportDetails(reportId: number): Promise<UserReportDetails> {
    return httpClient.get<UserReportDetails>(
      API_ENDPOINTS.USER_REPORTS.DETAILS(reportId),
      undefined,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Update report status (Admin only)
   */
  static async updateReportStatus(
    reportId: number,
    data: UpdateReportStatusRequest
  ): Promise<UserReportDetails> {
    return httpClient.patch<UserReportDetails>(
      API_ENDPOINTS.USER_REPORTS.UPDATE_STATUS(reportId),
      data,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Resolve a report (Admin only)
   */
  static async resolveReport(
    reportId: number,
    data: ResolveReportRequest
  ): Promise<UserReportDetails> {
    return httpClient.post<UserReportDetails>(
      API_ENDPOINTS.USER_REPORTS.RESOLVE(reportId),
      data,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Get report analytics (Admin only)
   */
  static async getAnalytics(): Promise<ReportAnalytics> {
    return httpClient.get<ReportAnalytics>(
      API_ENDPOINTS.USER_REPORTS.ANALYTICS,
      undefined,
      {
        enableCache: true,
        cacheDuration: CACHE_CONFIG.MEDIUM,
      }
    );
  }

  /**
   * Get user's own reports
   */
  static async getMyReports(
    params: PaginationParams = {}
  ): Promise<PageResponse<UserReportSummary>> {
    return httpClient.get<PageResponse<UserReportSummary>>(
      API_ENDPOINTS.USER_REPORTS.MY_REPORTS,
      params,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Submit driver response to a report
   */
  static async submitDriverResponse(
    reportId: number,
    data: DriverResponseRequest
  ): Promise<UserReportDetails> {
    return httpClient.post<UserReportDetails>(
      API_ENDPOINTS.USER_REPORTS.DRIVER_RESPONSE(reportId),
      data,
      {
        enableCache: false,
      }
    );
  }

  /**
   * Start a chat conversation related to a report (Admin only)
   */
  static async startChat(
    reportId: number,
    data: StartReportChatRequest
  ): Promise<MessageResponse> {
    return httpClient.post<MessageResponse>(
      API_ENDPOINTS.USER_REPORTS.START_CHAT(reportId),
      data,
      {
        enableCache: false,
      }
    );
  }
}
