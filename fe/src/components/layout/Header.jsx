import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown, Form, Button, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCart } from '../../redux/cartSlice';
import { logoutSuccess } from '../../redux/userSlice';
import authService from '../../services/authService';
import './../../styles/header-footer.css';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { items: cartItems } = useSelector((state) => state.cart);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout failed on server:', error);
    } finally {
      dispatch(logoutSuccess());
      navigate('/');
    }
  };


  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <Navbar expand="lg" className="navbar-custom shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="brand-logo">
          <span className="brand-text">
            <strong>Đặc Sản</strong>
            <span className="brand-highlight"> Sóc Trăng</span>
          </span>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
              <Nav.Link as={Link} to="/intro" className="nav-link-custom">
              <i className="fas fa-home me-1"></i>
              Trang chủ
            </Nav.Link>
            <Nav.Link as={Link} to="/" className="nav-link-custom">
              <i className="fas fa-birthday-cake me-1"></i>
              Sản phẩm
            </Nav.Link>
          
            <NavDropdown title={<span><i className="fas fa-list me-1"></i>Danh mục</span>} id="category-dropdown" className="nav-dropdown-custom">
              <NavDropdown.Item as={Link} to="/products?category=pia-dau-xanh">
                🟢 Bánh pía đậu xanh
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=pia-thit">
                🟤 Bánh pía thịt
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=pia-trung">
                🟡 Bánh pía trứng
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=pia-dua">
                🥥 Bánh pía dừa
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item as={Link} to="/products?category=banh-in">
                🥮 Bánh ín
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=banh-cam">
                🟠 Bánh cam
              </NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/products?category=kem-bo">
                🧈 Kem bơ
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
          <Form className="d-flex me-3" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Tìm đặc sản..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-warning" type="submit" className="search-btn">
              <i className="fas fa-search"></i>
            </Button>
          </Form>
          <Nav>
            <Nav.Link as={Link} to="/cart" className="nav-link-custom position-relative me-2">
              <i className="fas fa-shopping-cart"></i>
              {totalCartItems > 0 && (
                <Badge bg="danger" className="cart-badge">{totalCartItems}</Badge>
              )}
            </Nav.Link>
            {isAuthenticated && user ? (
              <NavDropdown
                title={
                  <span className="user-dropdown">
                    <i className="bi bi-person-circle me-2"></i>
                    {user.name}
                  </span>
                }
                id="user-dropdown"
                className="user-dropdown-custom"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile"><i className="bi bi-person-lines-fill me-2"></i>Thông tin cá nhân</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/orders"><i className="fas fa-shopping-bag me-2"></i>Đơn hàng của tôi</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-reviews"><i className="fas fa-star me-2"></i>Đánh giá của tôi</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/favorites"><i className="fas fa-heart me-2"></i>Sản phẩm yêu thích</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger"><i className="bi bi-box-arrow-right me-2"></i>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <div className="auth-buttons">
                <Button
                  as={Link}
                  to="/login"
                  variant="outline-warning"
                  size="sm"
                  className="me-2"
                >
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Đăng nhập
                </Button>
                <Button
                  as={Link}
                  to="/register"
                  variant="warning"
                  size="sm"
                >
                  <i className="fas fa-user-plus me-1"></i>
                  Đăng ký
                </Button>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;