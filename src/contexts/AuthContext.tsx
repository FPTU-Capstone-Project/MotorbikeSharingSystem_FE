import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../utils/api';
import { userService } from '../services/apiService';
import { tokenService } from '../services/tokenService';

interface User {
  userId: number;
  email: string;
  fullName: string;
  userType: string;
  activeProfile?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getTimeUntilExpiry: () => number | null;
  isTokenValid: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and fetch current user profile on mount
  useEffect(() => {
    const initAuthState = async () => {
      const candidateToken = localStorage.getItem('token')
        || localStorage.getItem('accessToken')
        || localStorage.getItem('access_token');
      const storedToken = candidateToken && candidateToken !== 'undefined' ? candidateToken : null;
      const storedUser = localStorage.getItem('user');

      if (storedToken) {
        setToken(storedToken);
        
        // Initialize token monitoring globally
        tokenService.initialize();
        
        // Optimistically set stored user if available to avoid UI flash
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch (error) {
            console.error('Không thể phân tích người dùng đã lưu:', error);
            localStorage.removeItem('user');
          }
        }

        // Always try to refresh the user profile from backend
        try {
          const profile = await userService.getCurrentUser();
          const fullUserData: User = {
            userId: (profile as any).userId ?? (profile as any).id ?? user?.userId ?? 0,
            email: (profile as any).email ?? user?.email ?? '',
            fullName: (profile as any).fullName ?? (profile as any).name ?? user?.fullName ?? 'User',
            userType: (profile as any).userType ?? (profile as any).role ?? user?.userType ?? 'ADMIN',
            activeProfile: (profile as any).activeProfile ?? user?.activeProfile,
          };
          setUser(fullUserData);
          localStorage.setItem('user', JSON.stringify(fullUserData));
        } catch (error) {
          // If fetching profile fails (expired token, etc.), keep optimistic user or logout later when an authed request fails
          console.warn('Không thể tải hồ sơ người dùng hiện tại:', error);
        }
      } else {
        // No token found, ensure monitoring is stopped
        tokenService.stopMonitoring();
      }
      setIsLoading(false);
    };

    initAuthState();
    
    // Cleanup function to stop token monitoring
    return () => {
      // Don't stop monitoring here as it should be global
      // tokenService.stopMonitoring();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    try {
      // Call backend login API
      const response = await apiFetch<any>('/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
          targetProfile: 'rider', // Admin can be any profile
        },
      });

      // Extract token(s)
      const accessToken = response.accessToken ?? response.access_token;
      const refreshToken = response.refreshToken ?? response.refresh_token;
      if (!accessToken || typeof accessToken !== 'string' || accessToken === 'undefined') {
        throw new Error('Invalid access token from server');
      }
      setToken(accessToken);

      // Store in localStorage (multiple keys for compatibility)
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('authToken', accessToken);
      
      // Store refresh token (multiple keys for compatibility)
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('refresh_token', refreshToken);
      }

      // Initialize token monitoring after successful login
      tokenService.initialize();

      // Fetch full user profile after login to populate UI with accurate data
      try {
        const profile = await userService.getCurrentUser();
        const fullUserData: User = {
          userId: (profile as any).userId ?? (profile as any).id,
          email: (profile as any).email ?? email,
          fullName: (profile as any).fullName ?? (profile as any).name ?? 'User',
          userType: (profile as any).userType ?? (profile as any).role,
          activeProfile: (profile as any).activeProfile,
        };
        setUser(fullUserData);
        localStorage.setItem('user', JSON.stringify(fullUserData));
      } catch (profileError) {
        console.warn('Không thể tải hồ sơ sau khi đăng nhập, sử dụng thông tin tối thiểu:', profileError);
        const minimalUser: User = {
          userId: response.userId ?? (response as any).user_id ?? 0,
          email,
          fullName: 'Admin User',
          userType: response.userType ?? (response as any).user_type ?? 'ADMIN',
          activeProfile: response.activeProfile ?? (response as any).active_profile,
        };
        setUser(minimalUser);
        localStorage.setItem('user', JSON.stringify(minimalUser));
      }
    } catch (error: any) {
      console.error('Lỗi đăng nhập:', error);
      throw error;
    }
  };

  const logout = () => {
    // Stop token monitoring
    tokenService.stopMonitoring();
    
    // Clear state
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');

    // Optional: Call backend logout API
    try {
      apiFetch('/auth/logout', { method: 'POST' }).catch(() => {
        // Ignore logout API errors
      });
    } catch (error) {
      console.warn('Lỗi gọi API đăng xuất:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    getTimeUntilExpiry: () => tokenService.getTimeUntilExpiry(),
    isTokenValid: () => tokenService.isTokenValid(),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
