import React from 'react'
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { logoutAdmin } from '../../redux/slices/authSlice'
import { toast } from 'react-toastify'

const Header = () => {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await dispatch(logoutAdmin()).unwrap()
      navigate('/login')
      toast.success('Đăng xuất thành công')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đăng xuất')
    }
  }

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="admin-header">
      <Container fluid>
        <Navbar.Brand href="/dashboard" className="d-flex align-items-center">
          <i className="bi bi-shop me-2"></i>
          <span className="fw-bold">Admin Dashboard</span>
          <small className="ms-2 text-muted">Đặc Sản Sóc Trăng</small>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link href="#notifications" className="position-relative">
              <i className="bi bi-bell"></i>
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                3
              </span>
            </Nav.Link>

            <NavDropdown
              title={
                <span className="d-flex align-items-center">
                  <i className="bi bi-person-circle me-2"></i>
                  {user?.name || 'Admin'}
                </span>
              }
              id="user-dropdown"
              align="end"
            >
              <NavDropdown.Item href="/profile">
                <i className="bi bi-person me-2"></i>
                Thông tin cá nhân
              </NavDropdown.Item>
              <NavDropdown.Item href="/settings">
                <i className="bi bi-gear me-2"></i>
                Cài đặt
              </NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout} className="text-danger">
                <i className="bi bi-box-arrow-right me-2"></i>
                Đăng xuất
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header