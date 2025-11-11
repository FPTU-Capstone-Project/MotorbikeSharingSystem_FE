import { httpClient } from './http-client';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * Auth Types
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user_id: number;
  user_type: 'ADMIN' | 'USER';
  email: string;
  full_name: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * Authentication API Service
 * Handles login, logout, and token management for admin/staff
 */
export class AuthAPI {
  /**
   * Login with email and password (Admin/Staff only)
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );

    // Store tokens and user info in localStorage
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('user_id', response.user_id.toString());
      localStorage.setItem('user_type', response.user_type);
      localStorage.setItem('email', response.email);
      localStorage.setItem('full_name', response.full_name);

      // Set token in http client for subsequent requests
      httpClient.setAuthToken(response.access_token);
    }

    return response;
  }

  /**
   * Logout and clear tokens
   */
  static async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT, { 
          refresh_token: refreshToken 
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage and auth token
      AuthAPI.clearAuth();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<RefreshTokenResponse> {
    // Try multiple keys for compatibility
    const refreshToken = localStorage.getItem('refreshToken') || 
                         localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Backend expects refreshToken (camelCase) in request body
    const response = await httpClient.post<RefreshTokenResponse>(
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken: refreshToken }
    );

    // Update tokens
    if (response.access_token) {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('accessToken', response.access_token);
      localStorage.setItem('authToken', response.access_token);
      
      // Update refresh token if provided
      if (response.refresh_token) {
        localStorage.setItem('refreshToken', response.refresh_token);
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      httpClient.setAuthToken(response.access_token);
    }

    return response;
  }

  /**
   * Clear authentication data
   */
  static clearAuth(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_type');
    localStorage.removeItem('email');
    localStorage.removeItem('full_name');
    localStorage.removeItem('user');
    httpClient.setAuthToken(null);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Check if user is admin
   */
  static isAdmin(): boolean {
    return localStorage.getItem('user_type') === 'ADMIN';
  }

  /**
   * Get stored access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Get current user info
   */
  static getCurrentUser() {
    return {
      user_id: localStorage.getItem('user_id'),
      user_type: localStorage.getItem('user_type'),
      email: localStorage.getItem('email'),
      full_name: localStorage.getItem('full_name'),
    };
  }

  /**
   * Initialize auth from localStorage on app start
   */
  static initializeAuth(): void {
    const token = localStorage.getItem('access_token');
    if (token) {
      httpClient.setAuthToken(token);
    }
  }
}
