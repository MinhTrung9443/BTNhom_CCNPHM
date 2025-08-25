
import React from 'react';
import { Navbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
    const { isAuthenticated, user, logout } = useAuth();

    const handleLogout = () => {
        logout();
    };

    return (
        <Navbar bg="light" expand="lg" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/">Đặc Sản Sóc Trăng</Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        {isAuthenticated && user ? (
                            <NavDropdown title={
                                <>
                                    <i className="bi bi-person-circle me-2"></i>
                                    {user.name} 
                                </>
                            } id="basic-nav-dropdown">
                                <NavDropdown.Item as={Link} to="/profile">
                                    <i className="bi bi-person-lines-fill me-2"></i>Hồ sơ
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Item onClick={handleLogout}>
                                    <i className="bi bi-box-arrow-right me-2"></i>Đăng xuất
                                </NavDropdown.Item>
                            </NavDropdown>
                        ) : (
                            <Nav.Link as={Link} to="/login">Đăng nhập</Nav.Link>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;