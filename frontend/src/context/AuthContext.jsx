import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/axiosConfig';

const AuthContext = createContext();

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

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        // Verify token is still valid
        const response = await api.get('/auth/me');
        // Use the authoritative user returned by the server
        const serverUser = response.data;
        setUser(serverUser);
        localStorage.setItem('user', JSON.stringify(serverUser));
      }
    } catch (error) {
      // Token is invalid, clear storage
      console.log(error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, ...userData } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

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

  // Forgot Password Functions
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/otp/forgot-password', { email });
      
      return {
        success: true,
        message: response.data.message || 'Password reset OTP sent successfully',
        email: response.data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send password reset OTP'
      };
    }
  };

  const verifyPasswordResetOTP = async (email, otp) => {
    try {
      const response = await api.post('/otp/verify-password-reset', { email, otp });
      
      return {
        success: true,
        message: response.data.message || 'OTP verified successfully',
        resetToken: response.data.resetToken,
        email: response.data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify OTP'
      };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const response = await api.put('/otp/reset-password', { resetToken, password });
      
      return {
        success: true,
        message: response.data.message || 'Password reset successfully',
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
        message: response.data.message || 'OTP resent successfully',
        email: response.data.email
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend OTP'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    // Forgot password functions
    forgotPassword,
    verifyPasswordResetOTP,
    resetPassword,
    resendPasswordResetOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};