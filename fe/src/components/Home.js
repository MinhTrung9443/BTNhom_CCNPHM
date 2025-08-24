// src/components/Home.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="header-content">
          <h1>🥮 Bánh Pía Quê Mình</h1>
          <nav className="header-nav">
            {isAuthenticated ? (
              <div className="user-menu">
                <span>Xin chào, {user?.fullName}!</span>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={logout} className="logout-btn">Đăng xuất</button>
              </div>
            ) : (
              <div className="auth-nav">
                <Link to="/login" className="nav-link">Đăng nhập</Link>
                <Link to="/register" className="nav-link register-link">Đăng ký</Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Bánh Pía Truyền Thống</h2>
          <p>Hương vị quê hương đậm đà, được làm từ những nguyên liệu tươi ngon nhất</p>
          {!isAuthenticated && (
            <div className="hero-actions">
              <Link to="/register" className="cta-button">Đăng ký ngay</Link>
              <Link to="/login" className="cta-button secondary">Đăng nhập</Link>
            </div>
          )}
        </div>
      </section>

      {/* Products Section */}
      <section className="products-section">
        <div className="container">
          <h3>Sản Phẩm Nổi Bật</h3>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-image">🥮</div>
              <h4>Bánh Pía Đậu Xanh</h4>
              <p>Bánh pía truyền thống với nhân đậu xanh thơm ngon</p>
              <div className="product-price">120.000đ</div>
            </div>

            <div className="product-card">
              <div className="product-image">🥮</div>
              <h4>Bánh Pía Sầu Riêng</h4>
              <p>Bánh pía nhân sầu riêng đặc biệt, hương vị độc đáo</p>
              <div className="product-price">150.000đ</div>
            </div>

            <div className="product-card">
              <div className="product-image">🥮</div>
              <h4>Bánh Pía Thập Cẩm</h4>
              <p>Kết hợp nhiều loại nhân, phong phú hương vị</p>
              <div className="product-price">130.000đ</div>
            </div>

            <div className="product-card">
              <div className="product-image">🥮</div>
              <h4>Bánh Pía Dừa</h4>
              <p>Bánh pía nhân dừa tươi, vị ngọt thanh mát</p>
              <div className="product-price">110.000đ</div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">
        <div className="container">
          <h3>Về Chúng Tôi</h3>
          <div className="about-content">
            <div className="about-text">
              <p>
                Bánh Pía Quê Mình là thương hiệu bánh pía truyền thống với hơn 20 năm kinh nghiệm. 
                Chúng tôi cam kết mang đến những sản phẩm chất lượng cao, giữ nguyên hương vị đặc trưng 
                của bánh pía miền Tây Nam Bộ.
              </p>
              <p>
                Tất cả sản phẩm đều được làm thủ công theo công thức gia truyền, sử dụng nguyên liệu 
                tươi ngon và an toàn cho sức khỏe.
              </p>
            </div>
            <div className="about-features">
              <div className="feature">
                <span className="feature-icon">🌟</span>
                <span>Chất lượng cao</span>
              </div>
              <div className="feature">
                <span className="feature-icon">🚚</span>
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="feature">
                <span className="feature-icon">💯</span>
                <span>Cam kết chất lượng</span>
              </div>
              <div className="feature">
                <span className="feature-icon">📞</span>
                <span>Hỗ trợ 24/7</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Liên Hệ</h4>
              <p>📞 Hotline: 0123.456.789</p>
              <p>📧 Email: contact@banhpiaqueminh.com</p>
              <p>📍 Địa chỉ: 123 Đường ABC, TP.HCM</p>
            </div>
            <div className="footer-section">
              <h4>Sản Phẩm</h4>
              <p>Bánh Pía Đậu Xanh</p>
              <p>Bánh Pía Sầu Riêng</p>
              <p>Bánh Pía Thập Cẩm</p>
              <p>Bánh Pía Dừa</p>
            </div>
            <div className="footer-section">
              <h4>Hỗ Trợ</h4>
              <p>Hướng dẫn đặt hàng</p>
              <p>Chính sách giao hàng</p>
              <p>Chính sách đổi trả</p>
              <p>Câu hỏi thường gặp</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2025 Bánh Pía Quê Mình. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
