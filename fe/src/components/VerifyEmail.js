// src/components/VerifyEmail.js
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Auth.css';

const VerifyEmail = () => {
  const { verifyEmail, resendVerification, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    otp: ''
  });
  const [isVerified, setIsVerified] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.otp) {
      alert('Vui lòng nhập email và mã OTP');
      return;
    }

    const result = await verifyEmail(formData);
    if (result.success) {
      setIsVerified(true);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      alert('Vui lòng nhập email');
      return;
    }

    await resendVerification(formData.email);
  };

  if (isVerified) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h2>✅ Xác thực thành công!</h2>
            <p>Email của bạn đã được xác thực</p>
          </div>

          <div className="success-content">
            <div className="success-icon">🎉</div>
            <p>Chúc mừng! Tài khoản của bạn đã được kích hoạt.</p>
            <p>Bây giờ bạn có thể đăng nhập và khám phá các sản phẩm bánh pía thơm ngon.</p>
          </div>

          <div className="auth-links">
            <Link to="/login" className="auth-button">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>📧 Xác thực Email</h2>
          <p>Nhập mã OTP đã được gửi đến email của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email đã đăng ký"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="otp">Mã OTP</label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Nhập mã OTP 6 số"
              disabled={loading}
              maxLength="6"
              required
            />
            <small className="form-hint">
              Mã OTP có hiệu lực trong 10 phút
            </small>
          </div>

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Đang xác thực...' : 'Xác thực'}
          </button>
        </form>

        <div className="auth-actions">
          <button 
            type="button" 
            className="resend-button"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? 'Đang gửi...' : 'Gửi lại mã'}
          </button>
        </div>

        <div className="auth-links">
          <p>
            <Link to="/login">← Quay lại đăng nhập</Link>
          </p>
          <p>
            Chưa có tài khoản? 
            <Link to="/register"> Đăng ký ngay</Link>
          </p>
        </div>

        <div className="auth-footer">
          <p>🍰 Bánh pía thơm ngon, chất lượng từ quê hương</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
