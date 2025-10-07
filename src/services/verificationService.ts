import { apiFetch, PageResponse } from '../utils/api';
import { DriverKycItemDTO, VerificationItem } from '../types';

//  verification APIs
export async function fetchAllVerifications(
  page = 0,
  size = 10,
  params?: { type?: VerificationItem['type']; status?: VerificationItem['status'] }
): Promise<PageResponse<VerificationItem>> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('size', String(size));
  query.set('sortBy', 'createdAt');
  query.set('sortDir', 'desc');
  if (params?.type) query.set('type', params.type);
  if (params?.status) query.set('status', params.status);

  return apiFetch<PageResponse<VerificationItem>>(`/verification/all?${query.toString()}`);
}

export async function approveVerification(verificationId: number, userId: number, type: string, notes?: string) {
  console.log('User info:', { verificationId, userId, type });
  try {
    // Backend expects VerificationDecisionRequest { userId, verificationType, notes? }
    const body = {
      userId,
      verificationType: type,
      notes: notes || undefined,
    } as const;

    const endpoint = `/verification/approve`;
    console.log('Calling approve API:', endpoint);
    console.log('Request body:', body);

    const result = await apiFetch(endpoint, {
      method: 'POST',
      body,
    });
    console.log('Approve result:', result);
    return result;
  } catch (error: any) {
    console.error('Approve error:', error);
    // Provide more detailed error message
    if (error?.status === 500) {
      throw new Error('Server error: ' + (error?.data?.message || 'Internal server error'));
    } else if (error?.status === 403) {
      throw new Error('Forbidden - You do not have permission to approve');
    } else if (error?.status === 404) {
      throw new Error('Verification not found');
    } else if (error?.status === 401) {
      throw new Error('Unauthorized - Please login again');
    }
    throw error;
  }
}

export async function rejectVerification(verificationId: number, userId: number, type: string, rejectionReason: string, notes?: string) {
  console.log('User info:', { verificationId, userId, type });
  try {
    // Backend expects VerificationDecisionRequest { userId, verificationType, rejectionReason, notes? }
    const body = {
      userId,
      verificationType: type,
      rejectionReason: rejectionReason.trim() || 'Not specified',
      notes: notes || undefined,
    } as const;

    const endpoint = `/verification/reject`;
    console.log('Calling reject API:', endpoint);
    console.log('Request body:', body);

    const result = await apiFetch(endpoint, {
      method: 'POST',
      body,
    });
    console.log('Reject result:', result);
    return result;
  } catch (error: any) {
    console.error('Reject error:', error);
    // Provide more detailed error message
    if (error?.status === 500) {
      throw new Error('Server error: ' + (error?.data?.message || 'Internal server error'));
    } else if (error?.status === 404) {
      throw new Error('Verification not found');
    } else if (error?.status === 401) {
      throw new Error('Unauthorized - Please login again');
    } else if (error?.status === 403) {
      throw new Error('Forbidden - You do not have permission to reject');
    } else if (error?.status === 400) {
      throw new Error('Bad request: ' + (error?.data?.message || 'Invalid request'));
    }
    throw error;
  }
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





