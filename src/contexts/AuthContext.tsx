import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '../utils/api';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
      || localStorage.getItem('accessToken')
      || localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Call backend login API
      const response = await apiFetch<{
        userId: number;
        userType: string;
        activeProfile?: string;
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
      }>('/auth/login', {
        method: 'POST',
        body: {
          email,
          password,
          targetProfile: 'rider', // Admin can be any profile
        },
      });

      // Extract user data from response
      const userData: User = {
        userId: response.userId,
        email: email,
        fullName: 'Admin User', // Backend doesn't return name in login response
        userType: response.userType,
        activeProfile: response.activeProfile,
      };

      // Save to state and localStorage
      setToken(response.accessToken);
      setUser(userData);

      // Store in localStorage (multiple keys for compatibility)
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Optionally fetch full user profile after login
      //try {
      //   const profile = await apiFetch<any>('/me');
      //   const fullUserData: User = {
      //     userId: profile.userId || userData.userId,
      //     email: profile.email || userData.email,
      //     fullName: profile.fullName || userData.fullName,
      //     userType: profile.userType || userData.userType,
      //     activeProfile: profile.activeProfile || userData.activeProfile,
      //   };
      //   setUser(fullUserData);
      //   localStorage.setItem('user', JSON.stringify(fullUserData));
      // } catch (profileError) {
      //   console.warn('Failed to fetch profile, using login data:', profileError);
      // }
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear state
    setUser(null);
    setToken(null);

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Optional: Call backend logout API
    try {
      apiFetch('/auth/logout', { method: 'POST' }).catch(() => {
        // Ignore logout API errors
      });
    } catch (error) {
      console.warn('Logout API call failed:', error);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
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
