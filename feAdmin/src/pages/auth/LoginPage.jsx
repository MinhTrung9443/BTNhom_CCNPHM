import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginAdmin, clearError } from '../../redux/slices/authSlice'
import { toast } from 'react-toastify'

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: 'admin@example.com',
    password: '12345678'
  })
  const [showPassword, setShowPassword] = useState(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector((state) => state.auth)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (error) {
      dispatch(clearError())
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!formData.email || !formData.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return false
    }

    try {
      await dispatch(loginAdmin(formData)).unwrap()
      toast.success('Đăng nhập thành công!')
      navigate('/dashboard')
    } catch (error) {
      // Error đã được xử lý trong Redux, chỉ cần hiển thị toast
      console.error('Login error:', error)
      toast.error(error || 'Đăng nhập thất bại')
      // Clear form password để bảo mật
      setFormData(prev => ({
        ...prev,
        password: ''
      }))
    }
    return false
  }

  return (
    <Container fluid className="login-page min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={4}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <div className="mb-3">
                  <i className="bi bi-shield-lock text-primary" style={{ fontSize: '3rem' }}></i>
                </div>
                <h3 className="fw-bold text-dark">Admin Dashboard</h3>
                <p className="text-muted">Đặc Sản Sóc Trăng</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-envelope me-2"></i>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Nhập email admin"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={loading}
                    size="lg"
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-lock me-2"></i>
                    Mật khẩu
                  </Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={loading}
                      size="lg"
                    />
                    <Button
                      variant="link"
                      className="position-absolute end-0 top-50 translate-middle-y border-0 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                      style={{ zIndex: 10 }}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                  </div>
                </Form.Group>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  className="w-100 fw-semibold"
                  disabled={loading}
                  onClick={handleSubmit}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Đang đăng nhập...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Đăng nhập
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  <i className="bi bi-info-circle me-1"></i>
                  Chỉ dành cho quản trị viên
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default LoginPage