import toast from 'react-hot-toast';
import { tokenService } from '../services/tokenService';

const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api/v1';
let isRedirectingForAuth = false;

export interface PageResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_records: number;
  };
}

// Get JWT token from localStorage
function getAuthToken(): string | null {
  // Try to get token from localStorage
  // Common keys: 'token', 'accessToken', 'access_token', 'authToken'
  return localStorage.getItem('token')
    || localStorage.getItem('accessToken')
    || localStorage.getItem('access_token')
    || localStorage.getItem('authToken');
}

export async function apiFetch<T = any>(
  endpoint: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  }
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };

  // Add Authorization header if token exists
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method: options?.method || 'GET',
    headers,
  };

  if (options?.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    let errorData: any = { message: 'Request failed' };
    try {
      errorData = await response.json();
    } catch (e) {
      // If response is not JSON, use default message
    }

    // Create error object with status code for better error handling
    const error: any = new Error(errorData.message || `HTTP ${response.status}`);
    error.status = response.status;
    error.data = errorData;

    // Global auth expiry handling
    if ((response.status === 401 || response.status === 403) && !isRedirectingForAuth) {
      isRedirectingForAuth = true;
      
      // Stop token monitoring to prevent multiple notifications
      tokenService.stopMonitoring();
      
      try {
        // Best-effort clear auth data
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      } catch (_) {}

      const msg = errorData?.message || 'Your session has expired. Please sign in again.';
      
      // Show notification with better styling
      toast.error(msg, { 
        id: 'auth-expired',
        duration: 5000,
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          borderRadius: '12px',
          backdropFilter: 'blur(12px)',
        },
      });

      // Redirect to login, avoid redirect loops
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        setTimeout(() => {
          window.location.replace('/login');
        }, 2000); // Give user time to read the notification
      }
    }
    throw error;
  }

  // Handle empty responses (e.g., 204 No Content) safely
  const contentLength = response.headers.get('content-length');
  const contentType = response.headers.get('content-type') || '';
  
  // If it's a 204 No Content or has no content, return undefined
  if (response.status === 204 || contentLength === '0') {
    return undefined as T;
  }
  
  // If content type is not JSON, return undefined
  if (contentType.indexOf('application/json') === -1) {
    return undefined as T;
  }

  // Try to parse JSON, return undefined if it fails
  try {
    return await response.json();
  } catch {
    return undefined as T;
  }
}
