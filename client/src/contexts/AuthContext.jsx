import { createContext, useContext, useState, useEffect } from 'react';
import {
  authAPI,
  clearAuthData,
  getStoredToken,
  handleAuthError,
} from '../services/auth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import toast from 'react-hot-toast';

// Create context without exporting it individually
const AuthContext = createContext();

// Custom hook
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken, removeToken] = useLocalStorage('token', null);

  useEffect(() => {
    initializeAuth();
  }, [token]);

  const initializeAuth = async () => {
    if (token) {
      try {
        console.log('Initializing auth with token');
        const userData = await authAPI.verifyToken(token);
        setUser(userData);
      } catch (error) {
        console.error('Token verification failed:', error);
        handleAuthError(error);
        removeToken();
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setLoading(true);
      const response = await authAPI.login(credentials);

      setToken(response.token);
      setUser(response.user);

      toast.success('Welcome back!');
      return response;
    } catch (error) {
      const handledError = handleAuthError(error);
      toast.error(handledError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);

      setToken(response.token);
      setUser(response.user);

      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      const handledError = handleAuthError(error);
      toast.error(handledError.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await authAPI.logout(token);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
      setUser(null);
      clearAuthData();
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const userData = await authAPI.verifyToken(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isPremium: user?.subscription?.status === 'active',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export everything at once
export { AuthContext, useAuth, AuthProvider };
