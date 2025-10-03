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

  return apiFetch<PageResponse<VerificationItem>>(`/verification?${query.toString()}`);
}

export async function approveVerification(verificationId: number, userId: number, type: string, notes?: string) {
  console.log('User info:', { verificationId, userId, type });
  try {
    let endpoint;
    let body = { notes };
    
    if (type === 'STUDENT_ID') {
      endpoint = `/verification/students/${userId}/approve`;
    } else if (type === 'DRIVER_LICENSE') {
      endpoint = `/verification/drivers/${userId}/approve-license`;
    } else if (type === 'DRIVER_DOCUMENTS') {
      endpoint = `/verification/drivers/${userId}/approve-docs`;
    } else if (type === 'VEHICLE_REGISTRATION') {
      endpoint = `/verification/drivers/${userId}/approve-vehicle`;
    } else {
      throw new Error(`Unknown verification type: ${type}`);
    }
    
    console.log('Calling approve API:', endpoint);
    console.log('Request body:', body);
    
    const result = await apiFetch(endpoint, {
      method: 'POST',
      body,
    });
    console.log('Approve result:', result);
    return result;
  } catch (error) {
    console.error('Approve error:', error);
    throw error;
  }
}

export async function rejectVerification(verificationId: number, userId: number, type: string, rejectionReason: string, notes?: string) {
  console.log('User info:', { verificationId, userId, type });
  try {
    let endpoint;
    let body = { rejectionReason, notes };
    
    if (type === 'STUDENT_ID') {
      endpoint = `/verification/students/${userId}/reject`;
    } else if (type === 'DRIVER_LICENSE' || type === 'DRIVER_DOCUMENTS' || type === 'VEHICLE_REGISTRATION') {
      endpoint = `/verification/drivers/${userId}/reject`;
    } else {
      throw new Error(`Unknown verification type: ${type}`);
    }
    
    console.log('Calling reject API:', endpoint);
    console.log('Request body:', body);
    
    const result = await apiFetch(endpoint, {
      method: 'POST',
      body,
    });
    console.log('Reject result:', result);
    return result;
  } catch (error) {
    console.error('Reject error:', error);
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





