import { apiFetch, PageResponse } from "../utils/api";
import { UserManagementItem } from "../types";
import { API_ENDPOINTS } from "../config/api.config";

export async function getAllUsers(
  page = 0,
  size = 10,
  sortBy = 'createdAt',
  sortDir = 'desc'
): Promise<PageResponse<UserManagementItem>> {
  const query = new URLSearchParams();
  query.set('page', String(page));
  query.set('size', String(size));
  query.set('sort', `${sortBy},${sortDir}`);

  const endpoint = `${API_ENDPOINTS.USERS.ALL}?${query.toString()}`;
  return apiFetch<PageResponse<UserManagementItem>>(endpoint);
}


export async function suspendUser(userId: number): Promise<void> {
  const endpoint = API_ENDPOINTS.USERS.SUSPEND(userId);
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  console.log('Suspending user with endpoint:', endpoint, 'userId:', userId, 'token exists:', !!token);
  return apiFetch<void>(endpoint, {
    method: 'PATCH',
  });
}

export async function activateUser(userId: number): Promise<void> {
  const endpoint = API_ENDPOINTS.USERS.ACTIVATE(userId);
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('access_token');
  console.log('Activating user with endpoint:', endpoint, 'userId:', userId, 'token exists:', !!token);
  return apiFetch<void>(endpoint, {
    method: 'PATCH',
  });
}

export interface CreateUserPayload {
  email: string;
  userType: 'USER' | 'ADMIN';
}

export async function createUser(payload: CreateUserPayload) {
  return apiFetch<UserManagementItem>(API_ENDPOINTS.USERS.ALL, {
    method: 'POST',
    body: payload,
  });
}
