import { getApiConfig } from '../config/api.config';

interface RequestConfig {
  params?: Record<string, any>;
  enableCache?: boolean;
  cacheDuration?: number;
  retryAttempts?: number;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class HttpClient {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private authToken: string | null = null;

  constructor() {
    this.authToken = localStorage.getItem('authToken');
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const config = getApiConfig();
    const url = new URL(`${config.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private getCacheKey(url: string, method: string): string {
    return `${method}:${url}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, duration: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + duration,
    });
  }

  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    const keys = Array.from(this.cache.keys());
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }

  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  private async fetchWithRetry<T>(url: string, config: RequestInit, retryAttempts: number, isRetry = false): Promise<T> {
    const apiConfig = getApiConfig();
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), apiConfig.timeout);

        const response = await fetch(url, {
          ...config,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && !isRetry) {
          // Don't refresh if this is already a refresh token request
          if (url.includes('/auth/refresh')) {
            const errorData = await response.json().catch(() => ({
              message: response.statusText,
            }));
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
          }

          // Try to refresh token
          try {
            const newToken = await this.refreshTokenIfNeeded();
            if (newToken) {
              // Retry the original request with new token
              const newHeaders = {
                ...config.headers as Record<string, string>,
                'Authorization': `Bearer ${newToken}`,
              };
              return this.fetchWithRetry<T>(url, { ...config, headers: newHeaders }, retryAttempts, true);
            }
          } catch (refreshError) {
            console.error('Làm mới token thất bại:', refreshError);
            // If refresh fails, clear auth and throw error
            this.clearAuth();
            throw new Error('Session expired. Please login again.');
          }
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: response.statusText,
          }));
          if (response.status >= 400 && response.status < 500) {
            throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
          }
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('4'))) {
          throw error;
        }
        if (attempt < retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, apiConfig.retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  private async refreshTokenIfNeeded(): Promise<string | null> {
    // If already refreshing, wait for the existing promise
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    // Check if refresh token exists
    const refreshToken = localStorage.getItem('refreshToken') || 
                         localStorage.getItem('refresh_token');
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const newToken = await this.refreshPromise;
      this.isRefreshing = false;
      this.refreshPromise = null;
      return newToken;
    } catch (error) {
      this.isRefreshing = false;
      this.refreshPromise = null;
      throw error;
    }
  }

  private async performTokenRefresh(refreshToken: string): Promise<string> {
    const config = getApiConfig();
    const url = `${config.baseURL}/auth/refresh`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(errorData.message || 'Token refresh failed');
    }

    const data = await response.json();
    const newAccessToken = data.access_token || data.accessToken;
    
    if (!newAccessToken) {
      throw new Error('No access token in refresh response');
    }

    // Update stored tokens
    this.setAuthToken(newAccessToken);
    localStorage.setItem('access_token', newAccessToken);
    localStorage.setItem('token', newAccessToken);
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('authToken', newAccessToken);
    
    // Update refresh token if provided
    if (data.refresh_token || data.refreshToken) {
      const newRefreshToken = data.refresh_token || data.refreshToken;
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('refresh_token', newRefreshToken);
    }

    return newAccessToken;
  }

  private clearAuth(): void {
    this.setAuthToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
  }

  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const {
      params,
      enableCache = false,
      cacheDuration = 60000,
      retryAttempts = getApiConfig().retryAttempts,
      ...fetchConfig
    } = config;

    const url = this.buildUrl(endpoint, params);
    const method = fetchConfig.method || 'GET';
    const cacheKey = this.getCacheKey(url, method);

    if (method === 'GET' && enableCache) {
      const cachedData = this.getFromCache<T>(cacheKey);
      if (cachedData) return cachedData;

      const pending = this.pendingRequests.get(cacheKey);
      if (pending) return pending;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...fetchConfig.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const requestPromise = this.fetchWithRetry<T>(url, { ...fetchConfig, method, headers }, retryAttempts);

    if (method === 'GET' && enableCache) {
      this.pendingRequests.set(cacheKey, requestPromise);
    }

    try {
      const data = await requestPromise;
      if (method === 'GET' && enableCache) {
        this.setCache(cacheKey, data, cacheDuration);
      }
      return data;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>, config?: Omit<RequestConfig, 'params'>): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'POST', body: JSON.stringify(data) });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PUT', body: JSON.stringify(data) });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'PATCH', body: JSON.stringify(data) });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export const httpClient = new HttpClient();
export { HttpClient };
