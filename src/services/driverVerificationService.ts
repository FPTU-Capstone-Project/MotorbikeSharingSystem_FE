import apiClient from './api';

export interface DriverKycResponse {
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  student_id: string;
  license_number?: string;
  license_status?: 'pending' | 'approved' | 'rejected';
  license_document_url?: string;
  vehicle_registration_status?: 'pending' | 'approved' | 'rejected';
  vehicle_registration_url?: string;
  background_check_status?: 'pending' | 'approved' | 'rejected' | 'not_started';
  background_check_notes?: string;
  driver_status: 'pending' | 'active' | 'suspended' | 'rejected';
  total_rides?: number;
  rating_average?: number;
  created_at: string;
  updated_at?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
}

export interface DriverStatsResponse {
  total_drivers: number;
  pending_verifications: number;
  active_drivers: number;
  rejected_drivers: number;
  suspended_drivers: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface VerificationDecisionRequest {
  notes?: string;
  reason?: string;
}

export interface BackgroundCheckRequest {
  status: 'approved' | 'rejected';
  notes?: string;
  criminal_record_clear?: boolean;
  driving_record_clear?: boolean;
}

export interface MessageResponse {
  message: string;
  timestamp: string;
}

class DriverVerificationService {
  /**
   * Get pending driver verifications
   */
  async getPendingDriverVerifications(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<PageResponse<DriverKycResponse>> {
    const response = await apiClient.get('/verification/drivers/pending', {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  }

  /**
   * Get driver KYC details by ID
   */
  async getDriverKycById(driverId: number): Promise<DriverKycResponse> {
    const response = await apiClient.get(`/verification/drivers/${driverId}/kyc`);
    return response.data;
  }

  /**
   * Approve driver documents
   */
  async approveDriverDocuments(
    driverId: number,
    request: VerificationDecisionRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.post(
      `/verification/drivers/${driverId}/approve-docs`,
      request
    );
    return response.data;
  }

  /**
   * Approve driver license
   */
  async approveDriverLicense(
    driverId: number,
    request: VerificationDecisionRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.post(
      `/verification/drivers/${driverId}/approve-license`,
      request
    );
    return response.data;
  }

  /**
   * Approve driver vehicle
   */
  async approveDriverVehicle(
    driverId: number,
    request: VerificationDecisionRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.post(
      `/verification/drivers/${driverId}/approve-vehicle`,
      request
    );
    return response.data;
  }

  /**
   * Reject driver verification
   */
  async rejectDriverVerification(
    driverId: number,
    request: VerificationDecisionRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.post(
      `/verification/drivers/${driverId}/reject`,
      request
    );
    return response.data;
  }

  /**
   * Update background check
   */
  async updateBackgroundCheck(
    driverId: number,
    request: BackgroundCheckRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.put(
      `/verification/drivers/${driverId}/background-check`,
      request
    );
    return response.data;
  }

  /**
   * Get driver verification statistics
   */
  async getDriverVerificationStats(): Promise<DriverStatsResponse> {
    const response = await apiClient.get('/verification/drivers/stats');
    return response.data;
  }
}

export const driverVerificationService = new DriverVerificationService();
export default driverVerificationService;
