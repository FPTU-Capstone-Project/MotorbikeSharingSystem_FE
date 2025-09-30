import apiClient from './api';

export interface StudentVerification {
  verification_id: number;
  user_id: number;
  full_name: string;
  email: string;
  phone: string;
  student_id: string;
  status: 'pending' | 'approved' | 'rejected';
  document_url?: string;
  document_type?: string;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
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

export interface MessageResponse {
  message: string;
  timestamp: string;
}

class VerificationService {
  /**
   * Get pending student verifications
   */
  async getPendingStudentVerifications(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'createdAt',
    sortDir: string = 'desc'
  ): Promise<PageResponse<StudentVerification>> {
    const response = await apiClient.get('/verification/students/pending', {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  }

  /**
   * Get all student verifications (for history/filtering)
   */
  async getStudentVerificationHistory(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'verifiedAt',
    sortDir: string = 'desc'
  ): Promise<PageResponse<StudentVerification>> {
    const response = await apiClient.get('/verification/students/history', {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  }

  /**
   * Get student verification details by ID
   */
  async getStudentVerificationById(userId: number): Promise<StudentVerification> {
    const response = await apiClient.get(`/verification/students/${userId}`);
    return response.data;
  }

  /**
   * Approve student verification
   */
  async approveStudentVerification(
    userId: number,
    request: VerificationDecisionRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.post(
      `/verification/students/${userId}/approve`,
      request
    );
    return response.data;
  }

  /**
   * Reject student verification
   */
  async rejectStudentVerification(
    userId: number,
    request: VerificationDecisionRequest
  ): Promise<MessageResponse> {
    const response = await apiClient.post(
      `/verification/students/${userId}/reject`,
      request
    );
    return response.data;
  }

  /**
   * Bulk approve student verifications
   */
  async bulkApproveStudentVerifications(userIds: number[]): Promise<MessageResponse> {
    const response = await apiClient.post('/verification/students/bulk-approve', {
      user_ids: userIds,
      notes: 'Bulk approval by admin',
    });
    return response.data;
  }
}

export const verificationService = new VerificationService();
export default verificationService;
