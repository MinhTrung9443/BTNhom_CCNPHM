import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer-custom">
      {/* Newsletter Section */}
      <div className="newsletter-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col md={8}>
              <h4 className="newsletter-title">
                <i className="fas fa-envelope me-2"></i>
                Đăng ký nhận tin tức mới nhất
              </h4>
              <p className="newsletter-subtitle">
                Nhận thông tin về sản phẩm mới, khuyến mãi đặc biệt về đặc sản Sóc Trăng
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Main Footer */}
      <div className="footer-main">
        <Container>
          <Row>
            {/* Company Info */}
            <Col lg={4} md={6} className="mb-4">
              <div className="footer-section">
                <h5 className="footer-brand">🏺 Đặc Sản Sóc Trăng</h5>
                <p className="footer-description">
                  Chuyên cung cấp các đặc sản truyền thống Sóc Trăng với hương vị đậm đà, 
                  được làm từ nguyên liệu tự nhiên và công thức gia truyền.
                </p>
                <div className="social-links">
                  <a 
                    href="https://facebook.com" 
                    className="social-link facebook"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a 
                    href="https://instagram.com" 
                    className="social-link instagram"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a 
                    href="https://youtube.com" 
                    className="social-link youtube"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>
            </Col>

            {/* Quick Links */}
            <Col lg={2} md={6} className="mb-4">
              <div className="footer-section">
                <h6 className="footer-title">Liên kết nhanh</h6>
                <ul className="footer-links">
                  <li><Link to="/">Trang chủ</Link></li>
                  <li><Link to="/products">Sản phẩm</Link></li>
                  <li><Link to="/about">Giới thiệu</Link></li>
                  <li><Link to="/contact">Liên hệ</Link></li>
                </ul>
              </div>
            </Col>

            {/* Product Categories - Rút gọn text để tránh giật */}
            <Col lg={2} md={6} className="mb-4">
              <div className="footer-section">
                <h6 className="footer-title">Danh mục sản phẩm</h6>
                <ul className="footer-links">
                  <li><Link to="/products?category=pia-dau-xanh">Pía đậu xanh</Link></li>
                  <li><Link to="/products?category=pia-thit">Pía thịt</Link></li>
                  <li><Link to="/products?category=pia-trung">Pía trứng</Link></li>
                  <li><Link to="/products?category=pia-dua">Pía dừa</Link></li>
                  <li><Link to="/products?category=banh-in">Bánh ín</Link></li>
                  <li><Link to="/products?category=banh-cam">Bánh cam</Link></li>
                  <li><Link to="/products?category=kem-bo">Kem bơ</Link></li>
                </ul>
              </div>
            </Col>

            {/* Contact Info */}
            <Col lg={4} md={6} className="mb-4">
              <div className="footer-section">
                <h6 className="footer-title">Thông tin liên hệ</h6>
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="fas fa-map-marker-alt text-warning me-2"></i>
                    <span>123 Đường Hùng Vương, TP. Sóc Trăng</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone text-warning me-2"></i>
                    <span>0299.123.4567</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-envelope text-warning me-2"></i>
                    <span>info@dacsansoctrang.com</span>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-clock text-warning me-2"></i>
                    <span>Thứ 2 - Chủ nhật: 8:00 - 20:00</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <p className="copyright">
                © 2025 Đặc Sản Sóc Trăng. All rights reserved.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="footer-bottom-links">
                <Link to="/privacy">Chính sách bảo mật</Link>
                <span className="separator"> | </span>
                <Link to="/terms">Điều khoản sử dụng</Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;