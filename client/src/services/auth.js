import api from './api';

export const authAPI = {
  // Login user
  login: async (credentials) => {
    try {
      console.log('Attempting login with:', {
        email: credentials.email,
        hasPassword: !!credentials.password,
      });

      const response = await api.post('/auth/login', credentials, {
        timeout: 15000, // 15 second timeout for login
      });

      console.log('Login successful:', {
        userId: response.data.user?.id,
        email: response.data.user?.email,
      });

      return response.data;
    } catch (error) {
      console.error('Login API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
      });

      if (error.code === 'ECONNABORTED') {
        throw new Error('Login request timeout. Please check your connection.');
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      if (error.response?.status === 401) {
        throw new Error('Invalid email or password');
      }

      if (error.response?.status === 500) {
        throw new Error('Server error. Please try again later.');
      }

      throw new Error(
        'Login failed. Please check your connection and try again.'
      );
    }
  },

  // Register new user
  register: async (userData) => {
    try {
      console.log('Attempting registration with:', {
        name: userData.name,
        email: userData.email,
        hasPassword: !!userData.password,
      });

      const response = await api.post('/auth/register', userData, {
        timeout: 20000, // 20 second timeout for registration
      });

      console.log('Registration successful:', {
        userId: response.data.user?.id,
        email: response.data.user?.email,
      });

      return response.data;
    } catch (error) {
      console.error('Registration API Error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        code: error.code,
      });

      if (error.code === 'ECONNABORTED') {
        throw new Error(
          'Registration request timeout. Please check your connection.'
        );
      }

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      if (error.response?.status === 400) {
        throw new Error('User already exists with this email');
      }

      if (error.response?.status === 500) {
        throw new Error('Server error during registration. Please try again.');
      }

      if (error.response?.status === 422) {
        throw new Error('Invalid data provided. Please check your input.');
      }

      throw new Error(
        'Registration failed. Please check your connection and try again.'
      );
    }
  },

  // Logout user
  logout: async (token) => {
    try {
      console.log('Attempting logout');

      const response = await api.post(
        '/auth/logout',
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      console.log('Logout successful');
      return response.data;
    } catch (error) {
      console.error('Logout API Error:', {
        message: error.message,
        status: error.response?.status,
      });

      // Even if logout fails, we still want to proceed with client-side cleanup
      throw new Error(
        'Logout completed (server communication may have failed)'
      );
    }
  },

  // Verify token validity
  verifyToken: async (token) => {
    try {
      console.log('Verifying token');

      const response = await api.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });

      console.log('Token verification successful:', {
        userId: response.data.user?.id,
      });

      return response.data.user;
    } catch (error) {
      console.error('Token Verification Error:', {
        message: error.message,
        status: error.response?.status,
      });

      if (error.response?.status === 401) {
        throw new Error('Session expired. Please login again.');
      }

      throw new Error('Token verification failed');
    }
  },

  // Forgot password
  forgotPassword: async (email) => {
    try {
      console.log('Sending forgot password request for:', email);

      const response = await api.post(
        '/auth/forgot-password',
        { email },
        {
          timeout: 15000,
        }
      );

      console.log('Forgot password request successful');
      return response.data;
    } catch (error) {
      console.error('Forgot Password API Error:', {
        message: error.message,
        status: error.response?.status,
      });

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      throw new Error('Failed to send password reset email. Please try again.');
    }
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    try {
      console.log('Resetting password with token');

      const response = await api.post(
        '/auth/reset-password',
        { token, newPassword },
        {
          timeout: 15000,
        }
      );

      console.log('Password reset successful');
      return response.data;
    } catch (error) {
      console.error('Reset Password API Error:', {
        message: error.message,
        status: error.response?.status,
      });

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }

      if (error.response?.status === 400) {
        throw new Error('Invalid or expired reset token');
      }

      throw new Error('Password reset failed. Please try again.');
    }
  },

  // Refresh token (if implementing token refresh)
  refreshToken: async () => {
    try {
      console.log('Refreshing token');

      const response = await api.post(
        '/auth/refresh',
        {},
        {
          timeout: 10000,
        }
      );

      console.log('Token refresh successful');
      return response.data;
    } catch (error) {
      console.error('Token Refresh Error:', {
        message: error.message,
        status: error.response?.status,
      });

      throw new Error('Session refresh failed. Please login again.');
    }
  },

  // Get CSRF token (if using CSRF protection)
  getCSRFToken: async () => {
    try {
      console.log('Fetching CSRF token');

      const response = await api.get('/auth/csrf-token', {
        timeout: 10000,
      });

      console.log('CSRF token fetched successfully');
      return response.data.csrfToken;
    } catch (error) {
      console.error('CSRF Token Error:', {
        message: error.message,
        status: error.response?.status,
      });

      throw new Error('Failed to get security token');
    }
  },

  // Check server health
  checkServerHealth: async () => {
    try {
      console.log('Checking server health');

      const response = await api.get('/health', {
        timeout: 5000,
      });

      console.log('Server health check successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('Server Health Check Error:', {
        message: error.message,
        status: error.response?.status,
      });

      throw new Error('Server is not responding. Please try again later.');
    }
  },
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

// Utility function to get stored token
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

// Utility function to clear authentication data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  console.log('Auth data cleared from localStorage');
};

// Utility function to handle authentication errors
export const handleAuthError = (error) => {
  console.error('Authentication Error Handler:', error);

  if (error.message.includes('expired') || error.message.includes('invalid')) {
    clearAuthData();
    window.location.href = '/login?error=session_expired';
  }

  return error;
};

export default authAPI;
