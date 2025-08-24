// src/components/Login.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const { login, loading, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    login: '',
    password: ''
  });

  // Redirect nếu đã đăng nhập
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.login || !formData.password) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const result = await login(formData);
    if (result.success) {
      // Redirect sẽ được xử lý bởi Navigate component khi isAuthenticated = true
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>🥮 Bánh Pía Quê Mình</h2>
          <p>Đăng nhập để tiếp tục</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login">Email</label>
            <input
              type="text"
              id="login"
              name="login"
              value={formData.login}
              onChange={handleChange}
              placeholder="Nhập email"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              disabled={loading}
              required
            />
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Chưa có tài khoản? 
            <Link to="/register"> Đăng ký ngay</Link>
          </p>
          <p>
            <Link to="/verify-email">Xác thực email</Link>
          </p>
        </div>

        <div className="auth-footer">
          <p>🍰 Bánh pía thơm ngon, chất lượng từ quê hương</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
