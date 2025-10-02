import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthAPI } from '../api/auth.api';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    user_id: string | null;
    user_type: string | null;
    email: string | null;
    full_name: string | null;
  } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthContextType['user']>(null);

  const checkTokenExpiry = useCallback(() => {
    const token = AuthAPI.getAccessToken();
    if (!token) {
      handleLogout();
      return;
    }

    try {
      // Decode JWT token to check expiry
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiryTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      // If token expired or will expire in next 5 minutes, logout
      if (expiryTime < currentTime + 5 * 60 * 1000) {
        console.warn('Token expired or about to expire');
        handleLogout();
      }
    } catch (error) {
      console.error('Token expiry check error:', error);
      handleLogout();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check authentication on mount and set up token expiry check
  useEffect(() => {
    checkAuthStatus();
    
    // Check token expiry every minute
    const interval = setInterval(checkTokenExpiry, 60000);
    
    return () => clearInterval(interval);
  }, [checkTokenExpiry]);

  const checkAuthStatus = () => {
    try {
      const authenticated = AuthAPI.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        const currentUser = AuthAPI.getCurrentUser();
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await AuthAPI.login({ email, password });
      
      // Check if user is admin or staff
      if (response.user_type !== 'ADMIN') {
        AuthAPI.clearAuth();
        throw new Error('Access denied. Admin/Staff only.');
      }
      
      const currentUser = AuthAPI.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error;
    }
  };

  const handleLogout = async () => {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      // Reload page to clear any cached data
      window.location.href = '/login';
    }
  };

  const checkAuth = () => {
    return AuthAPI.isAuthenticated();
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login: handleLogin,
        logout: handleLogout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
