const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081/api/v1';

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
    throw error;
  }

  return response.json();
}
