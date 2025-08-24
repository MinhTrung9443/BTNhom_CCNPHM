// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

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
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
        
        // Verify token với server
        try {
          await authAPI.testToken();
        } catch (error) {
          // Token không hợp lệ, đăng xuất
          logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext login called with:', credentials); // Debug log
      setLoading(true);
      
      console.log('📡 Calling authAPI.login...'); // Debug log
      const response = await authAPI.login(credentials);
      console.log('📥 API Response:', response); // Debug log
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        toast.success('Đăng nhập thành công!');
        return { success: true, user };
      }
    } catch (error) {
      console.error('❌ Login error:', error); // Debug log
      console.error('❌ Error response:', error.response); // Debug log
      
      const message = error.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
        return { success: true, data: response.data.data };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (verificationData) => {
    try {
      setLoading(true);
      const response = await authAPI.verifyEmail(verificationData);
      
      if (response.data.success) {
        toast.success('Xác thực email thành công!');
        
        // Cập nhật user trong localStorage nếu đã đăng nhập
        if (user) {
          const updatedUser = { ...user, emailVerified: true };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Xác thực thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async (email) => {
    try {
      setLoading(true);
      const response = await authAPI.resendVerification(email);
      
      if (response.data.success) {
        toast.success('Đã gửi lại mã xác thực!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Gửi lại mã thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await authAPI.updateProfile(profileData);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        toast.success('Cập nhật thông tin thành công!');
        return { success: true, user: updatedUser };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (passwordData) => {
    try {
      setLoading(true);
      const response = await authAPI.changePassword(passwordData);
      
      if (response.data.success) {
        toast.success('Đổi mật khẩu thành công!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Đổi mật khẩu thất bại';
      toast.error(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    toast.info('Đã đăng xuất');
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    verifyEmail,
    resendVerification,
    updateProfile,
    changePassword,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
