const BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface PageResponse<T> {
  data: T[];
  pagination: {
    page: number;
    page_size: number;
    total_pages: number;
    total_records: number;
  };
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

  const config: RequestInit = {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  };

  if (options?.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}
