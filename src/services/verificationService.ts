import { apiFetch, PageResponse } from '../utils/api';
import { DriverKycItemDTO, VerificationItem } from '../types';

// Types aligned with backend controller/dtos
export interface VerificationDecisionRequest {
  userId: number;
  verificationType: string; // 'STUDENT_ID' | 'DRIVER_LICENSE' | ...
  rejectionReason?: string;
  notes?: string;
}

export interface BulkApprovalRequest {
  verificationIds: number[];
  notes?: string;
}

export interface MessageResponse { message: string }
export interface BulkOperationResponse {
  totalRequested: number;
  successfulCount: number;
  failedCount: number;
  successfulIds: number[];
  failedItems: Array<{ id: number; reason: string }>;
  message: string;
}

//  verification APIs
export async function fetchAllVerifications(
  page = 0,
  size = 10,
  params?: { type?: VerificationItem['type']; status?: VerificationItem['status']; search?: string }
): Promise<PageResponse<VerificationItem>> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('size', String(size));
  query.set('sortBy', 'verificationId');
  query.set('sortDir', 'desc');
  // Backend doesn't support type, status, search parameters yet
  // TODO: Update backend to support these filters

  return apiFetch<PageResponse<VerificationItem>>(`/verification/all?${query.toString()}`);
}

export async function approveVerification(verificationId: number, userId: number, type: string, notes?: string) {
  console.log('Approving verification:', { verificationId, userId, type, notes });
  try {
    // Backend expects VerificationDecisionRequest { userId, verificationType, notes? }
    const body: VerificationDecisionRequest = {
      userId: userId,
      verificationType: type.toUpperCase(), // Ensure uppercase for enum matching
      notes: notes || undefined,
    };

    const endpoint = `/verification/approve`;
    console.log('POST', endpoint, JSON.stringify(body, null, 2));

    const result = await apiFetch<MessageResponse>(endpoint, {
      method: 'POST',
      body,
    });
    console.log('✓ Approve successful:', result);
    return result;
  } catch (error: any) {
    console.error('✗ Approve failed:', {
      status: error?.status,
      message: error?.message,
      data: error?.data
    });

    // Provide more detailed error message
    if (error?.status === 500) {
      const serverMsg = error?.data?.message || error?.data?.error || 'Internal server error';
      throw new Error(`Server error: ${serverMsg}`);
    } else if (error?.status === 403) {
      throw new Error('Forbidden - You do not have permission to approve');
    } else if (error?.status === 404) {
      const msg = error?.data?.message || 'Verification not found';
      throw new Error(msg);
    } else if (error?.status === 401) {
      throw new Error('Unauthorized - Please login again');
    } else if (error?.status === 400) {
      const msg = error?.data?.message || 'Invalid request';
      throw new Error(`Bad request: ${msg}`);
    }
    throw new Error(error?.message || 'Unknown error occurred');
  }
}

export async function rejectVerification(verificationId: number, userId: number, type: string, rejectionReason: string, notes?: string) {
  console.log('Rejecting verification:', { verificationId, userId, type, rejectionReason, notes });
  try {
    // Backend expects VerificationDecisionRequest { userId, verificationType, rejectionReason, notes? }
    const body: VerificationDecisionRequest = {
      userId: userId,
      verificationType: type.toUpperCase(), // Ensure uppercase for enum matching
      rejectionReason: rejectionReason.trim() || 'Not specified',
      notes: notes || undefined,
    };

    const endpoint = `/verification/reject`;
    console.log('POST', endpoint, JSON.stringify(body, null, 2));

    const result = await apiFetch<MessageResponse>(endpoint, {
      method: 'POST',
      body,
    });
    console.log('✓ Reject successful:', result);
    return result;
  } catch (error: any) {
    console.error('✗ Reject failed:', {
      status: error?.status,
      message: error?.message,
      data: error?.data
    });

    // Provide more detailed error message
    if (error?.status === 500) {
      const serverMsg = error?.data?.message || error?.data?.error || 'Internal server error';
      throw new Error(`Server error: ${serverMsg}`);
    } else if (error?.status === 404) {
      const msg = error?.data?.message || 'Verification not found';
      throw new Error(msg);
    } else if (error?.status === 401) {
      throw new Error('Unauthorized - Please login again');
    } else if (error?.status === 403) {
      throw new Error('Forbidden - You do not have permission to reject');
    } else if (error?.status === 400) {
      const msg = error?.data?.message || 'Invalid request';
      throw new Error(`Bad request: ${msg}`);
    }
    throw new Error(error?.message || 'Unknown error occurred');
  }
}

// Bulk approve
export async function bulkApproveVerifications(verificationIds: number[], notes?: string): Promise<BulkOperationResponse> {
  const body: BulkApprovalRequest = {
    verificationIds,
    notes: notes || undefined,
  };
  return apiFetch<BulkOperationResponse>(`/verification/bulk-approve`, {
    method: 'POST',
    body,
  });
}

export async function approveStudent(userId: number, notes?: string) {
  return apiFetch(`/verification/students/${userId}/approve`, {
    method: 'POST',
    body: { notes },
  });
}

export async function rejectStudent(userId: number, rejectionReason: string, notes?: string) {
  return apiFetch(`/verification/students/${userId}/reject`, {
    method: 'POST',
    body: { rejectionReason, notes },
  });
}

// Driver KYC APIs
export async function fetchPendingDriverKycs(page = 0, size = 10) {
  return apiFetch<PageResponse<DriverKycItemDTO>>(
    `/verification/drivers/pending?page=${page}&size=${size}&sortBy=createdAt&sortDir=desc`
  );
}

export async function approveDriverVehicle(driverId: number, notes?: string) {
  return apiFetch(`/verification/drivers/${driverId}/approve-vehicle`, {
    method: 'POST',
    body: { notes },
  });
}

export async function rejectDriver(driverId: number, rejectionReason: string, notes?: string) {
  return apiFetch(`/verification/drivers/${driverId}/reject`, {
    method: 'POST',
    body: { rejectionReason, notes },
  });
}





