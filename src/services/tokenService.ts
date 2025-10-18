import toast from 'react-hot-toast';
import { AuthAPI } from '../api/auth.api';

export interface TokenInfo {
  token: string;
  expiresAt: number;
  refreshToken?: string;
}

export class TokenService {
  private static instance: TokenService;
  private tokenCheckInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;
  private listeners: Set<() => void> = new Set();
  private isInitialized = false;

  private constructor() {}

  static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  /**
   * Initialize token monitoring
   */
  initialize(): void {
    if (this.isInitialized) {
      return; // Prevent multiple initializations
    }
    
    this.isInitialized = true;
    this.startTokenMonitoring();
    
    // Also initialize on page load/refresh
    if (typeof window !== 'undefined') {
      window.addEventListener('load', () => {
        if (!this.isInitialized) {
          this.initialize();
        }
      });
    }
  }

  /**
   * Start monitoring token expiration
   */
  private startTokenMonitoring(): void {
    // Only start monitoring if there's actually a token
    const token = this.getStoredToken();
    if (!token) {
      console.log('No token found, skipping token monitoring');
      return;
    }

    // Check token every 30 seconds
    this.tokenCheckInterval = setInterval(() => {
      this.checkTokenExpiration();
    }, 30000);

    // Also check immediately
    this.checkTokenExpiration();
  }

  /**
   * Stop token monitoring
   */
  stopMonitoring(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
    this.isInitialized = false;
    this.listeners.clear();
  }

  /**
   * Add a listener for token updates
   */
  addListener(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of token updates
   */
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback());
  }

  /**
   * Check if token is expired or about to expire
   */
  private checkTokenExpiration(): void {
    const token = this.getStoredToken();
    if (!token) {
      return;
    }

    try {
      const tokenData = this.parseJWT(token);
      if (!tokenData || !tokenData.exp) {
        this.handleTokenExpiration('Invalid token format');
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = tokenData.exp;
      const timeUntilExpiry = expiresAt - now;

      // If token expires in less than 5 minutes, try to refresh (only if refresh token exists)
      if (timeUntilExpiry < 300) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          this.attemptTokenRefresh();
        } else {
          // No refresh token available, handle expiration
          this.handleTokenExpiration('No refresh token available');
        }
      }

      // If token is already expired
      if (timeUntilExpiry <= 0) {
        this.handleTokenExpiration('Token has expired');
      }
    } catch (error) {
      console.error('Error checking token expiration:', error);
      this.handleTokenExpiration('Token validation failed');
    }
  }

  /**
   * Attempt to refresh the token
   */
  private async attemptTokenRefresh(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;

    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      if (!this.refreshPromise) {
        this.refreshPromise = this.performTokenRefresh(refreshToken);
      }

      const newToken = await this.refreshPromise;
      
      // Update stored token
      this.updateStoredToken(newToken);
      
      // Notify listeners of token update
      this.notifyListeners();
      
      toast.success('Session refreshed successfully');
    } catch (error) {
      // Only log error if it's not a "no refresh token" error
      if (!(error instanceof Error && error.message?.includes('No refresh token available'))) {
        console.error('Token refresh failed:', error);
      }
      this.handleTokenExpiration('Session refresh failed');
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  /**
   * Perform the actual token refresh
   */
  private async performTokenRefresh(refreshToken: string): Promise<string> {
    const response = await AuthAPI.refreshToken();
    return response.access_token;
  }

  /**
   * Handle token expiration
   */
  private handleTokenExpiration(reason: string): void {
    this.stopMonitoring();
    
    // Clear all auth data
    AuthAPI.clearAuth();
    
    // Show notification
    toast.error(
      `Session expired: ${reason}. Please sign in again.`,
      {
        duration: 5000,
        id: 'token-expired',
      }
    );

    // Navigate to login page
    setTimeout(() => {
      if (window.location.pathname !== '/login') {
        window.location.replace('/login');
      }
    }, 2000);
  }

  /**
   * Get stored token from localStorage
   */
  private getStoredToken(): string | null {
    return localStorage.getItem('access_token') ||
           localStorage.getItem('token') ||
           localStorage.getItem('accessToken') ||
           localStorage.getItem('authToken');
  }

  /**
   * Update stored token
   */
  private updateStoredToken(token: string): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('token', token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('authToken', token);
  }

  /**
   * Parse JWT token
   */
  private parseJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error parsing JWT:', error);
      return null;
    }
  }

  /**
   * Get token expiration time
   */
  getTokenExpirationTime(): number | null {
    const token = this.getStoredToken();
    if (!token) return null;

    try {
      const tokenData = this.parseJWT(token);
      return tokenData?.exp ? tokenData.exp * 1000 : null;
    } catch {
      return null;
    }
  }

  /**
   * Get time until token expires (in seconds)
   */
  getTimeUntilExpiry(): number | null {
    const expirationTime = this.getTokenExpirationTime();
    if (!expirationTime) return null;

    const now = Date.now();
    const timeUntilExpiry = Math.floor((expirationTime - now) / 1000);
    return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
  }

  /**
   * Check if token is valid
   */
  isTokenValid(): boolean {
    const timeUntilExpiry = this.getTimeUntilExpiry();
    return timeUntilExpiry !== null && timeUntilExpiry > 0;
  }
}

export const tokenService = TokenService.getInstance();
