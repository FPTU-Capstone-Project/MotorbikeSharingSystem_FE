import { httpClient } from './http-client';
import { API_ENDPOINTS } from '../config/api.config';
import type {
  StudentVerification,
  StudentVerificationDetail,
  DriverVerification,
  DriverKYCDetail,
  DriverVerificationStats,
  PaginatedResponse,
  VerificationQueryParams,
  ApproveStudentRequest,
  RejectStudentRequest,
  BulkApproveStudentsRequest,
  ApproveDriverDocsRequest,
  ApproveDriverLicenseRequest,
  ApproveDriverVehicleRequest,
  RejectDriverRequest,
  UpdateBackgroundCheckRequest,
  VerificationHistory
} from '../types/verification.types';

/**
 * Verification API Service
 * Handles all student and driver verification operations
 */
export class VerificationAPI {
  // ==================== STUDENT VERIFICATION ====================
  
  /**
   * Get pending student verifications with pagination and filtering
   */
  static async getPendingStudents(
    params?: VerificationQueryParams
  ): Promise<PaginatedResponse<StudentVerification>> {
    return httpClient.get<PaginatedResponse<StudentVerification>>(
      API_ENDPOINTS.VERIFICATION.STUDENTS.PENDING,
      { params }
    );
  }

  /**
   * Get student verification details by ID
   */
  static async getStudentDetails(id: number): Promise<StudentVerificationDetail> {
    return httpClient.get<StudentVerificationDetail>(
      API_ENDPOINTS.VERIFICATION.STUDENTS.BY_ID(id)
    );
  }

  /**
   * Get student verification history
   */
  static async getStudentHistory(
    params?: VerificationQueryParams
  ): Promise<PaginatedResponse<VerificationHistory>> {
    return httpClient.get<PaginatedResponse<VerificationHistory>>(
      API_ENDPOINTS.VERIFICATION.STUDENTS.HISTORY,
      { params }
    );
  }

  /**
   * Approve student verification
   */
  static async approveStudent(
    id: number,
    data?: ApproveStudentRequest
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.VERIFICATION.STUDENTS.APPROVE(id),
      data
    );
  }

  /**
   * Reject student verification
   */
  static async rejectStudent(
    id: number,
    data: RejectStudentRequest
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.VERIFICATION.STUDENTS.REJECT(id),
      data
    );
  }

  /**
   * Bulk approve multiple student verifications
   */
  static async bulkApproveStudents(
    data: BulkApproveStudentsRequest
  ): Promise<{ success: boolean; approved: number; failed: number }> {
    return httpClient.post<{ success: boolean; approved: number; failed: number }>(
      API_ENDPOINTS.VERIFICATION.STUDENTS.BULK_APPROVE,
      data
    );
  }

  // ==================== DRIVER VERIFICATION ====================

  /**
   * Get pending driver verifications
   */
  static async getPendingDrivers(
    params?: VerificationQueryParams
  ): Promise<PaginatedResponse<DriverVerification>> {
    return httpClient.get<PaginatedResponse<DriverVerification>>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.PENDING,
      { params }
    );
  }

  /**
   * Get driver KYC (Know Your Customer) details
   */
  static async getDriverKYC(id: number): Promise<DriverKYCDetail> {
    return httpClient.get<DriverKYCDetail>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.KYC(id)
    );
  }

  /**
   * Get driver verification statistics
   */
  static async getDriverStats(): Promise<DriverVerificationStats> {
    return httpClient.get<DriverVerificationStats>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.STATS
    );
  }

  /**
   * Approve driver documents
   */
  static async approveDriverDocs(
    id: number,
    data?: ApproveDriverDocsRequest
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.APPROVE_DOCS(id),
      data
    );
  }

  /**
   * Approve driver license
   */
  static async approveDriverLicense(
    id: number,
    data?: ApproveDriverLicenseRequest
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.APPROVE_LICENSE(id),
      data
    );
  }

  /**
   * Approve driver vehicle
   */
  static async approveDriverVehicle(
    id: number,
    data: ApproveDriverVehicleRequest
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.APPROVE_VEHICLE(id),
      data
    );
  }

  /**
   * Reject driver verification
   */
  static async rejectDriver(
    id: number,
    data: RejectDriverRequest
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.REJECT(id),
      data
    );
  }

  /**
   * Update driver background check
   */
  static async updateBackgroundCheck(
    id: number,
    data: UpdateBackgroundCheckRequest
  ): Promise<{ success: boolean; message: string }> {
    return httpClient.put<{ success: boolean; message: string }>(
      API_ENDPOINTS.VERIFICATION.DRIVERS.BACKGROUND_CHECK(id),
      data
    );
  }
}
