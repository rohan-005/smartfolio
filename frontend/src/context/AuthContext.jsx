import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';

const AuthContext = createContext();

// Access hook
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto login if token exists
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        const response = await api.get('/auth/me');
        const serverUser = response.data;

        setUser(serverUser);
        localStorage.setItem('user', JSON.stringify(serverUser));
        localStorage.setItem('userRole', serverUser.role);
      }
    } catch (error) {
      console.log(error)
      // Token expired or invalid — clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userRole');
    } finally {
      setLoading(false);
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;

      // Store token & role
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userRole', userData.role);

      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
    
      return {
        success: true,
        isExistingUnverified: response.data.isExistingUnverified
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // Forgot Password Flows
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/otp/forgot-password', { email });
    
      return {
        success: true,
        message: response.data.message || 'Password reset OTP sent',
        email: response.data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send OTP'
      };
    }
  };

  const verifyPasswordResetOTP = async (email, otp) => {
    try {
      const response = await api.post('/otp/verify-password-reset', { email, otp });
    
      return {
        success: true,
        message: response.data.message,
        resetToken: response.data.resetToken,
        email: response.data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'OTP verification failed'
      };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const response = await api.put('/otp/reset-password', { resetToken, password });
    
      return {
        success: true,
        message: response.data.message,
        email: response.data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reset password'
      };
    }
  };

  const resendPasswordResetOTP = async (email) => {
    try {
      const response = await api.post('/otp/resend-password-reset', { email });
    
      return {
        success: true,
        message: response.data.message,
        email: response.data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP'
      };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setUser(null);
  };

  // Update stored user
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('userRole', userData.role);
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP,
    getRole: () => localStorage.getItem('userRole'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
