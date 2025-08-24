import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import InputGroup from 'react-bootstrap/InputGroup';
import { toast } from 'react-toastify';

import authService from '../../services/authService';
import { validateResetPasswordForm } from '../../utils/validation';

/**
 * Trang đặt lại mật khẩu
 */
const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);

  /**
   * Kiểm tra token có hợp lệ không
   */
  useEffect(() => {
    if (!token || token.length < 32) {
      setTokenValid(false);
    }
  }, [token]);

  /**
   * Xử lý thay đổi input
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Xóa error của field khi user bắt đầu nhập
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Toggle hiển thị mật khẩu
   */
  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowPasswordConfirm(!showPasswordConfirm);
    }
  };

  /**
   * Xử lý submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateResetPasswordForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.resetPassword(
        token, 
        formData.password, 
        formData.passwordConfirm
      );
      
      toast.success('Mật khẩu đã được đặt lại thành công!');
      
      // Chuyển hướng đến trang login sau 2 giây
      setTimeout(() => {
        navigate('/login', { 
          state: { message: 'Mật khẩu đã được đặt lại. Vui lòng đăng nhập với mật khẩu mới.' }
        });
      }, 2000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (error.response?.status === 400) {
        // Lỗi validation từ server
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
        } else {
          toast.error(errorMessage);
        }
      } else if (error.response?.status === 404 || error.response?.status === 410) {
        // Token không hợp lệ hoặc đã hết hạn
        setTokenValid(false);
        toast.error('Link khôi phục không hợp lệ hoặc đã hết hạn.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Hiển thị lỗi token không hợp lệ
  if (!tokenValid) {
    return (
      <Container className="min-vh-100 d-flex align-items-center">
        <Row className="w-100 justify-content-center">
          <Col md={6} lg={5}>
            <Card className="card-custom">
              <Card.Body className="p-4 text-center">
                <div className="mb-4">
                  <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="mb-3">Link không hợp lệ</h4>
                <p className="text-muted mb-4">
                  Link khôi phục mật khẩu không hợp lệ hoặc đã hết hạn. 
                  Vui lòng yêu cầu link mới.
                </p>
                <div className="d-flex flex-column gap-2">
                  <Link to="/forgot-password" className="btn btn-primary btn-custom">
                    Yêu cầu link mới
                  </Link>
                  <Link to="/login" className="btn btn-outline-secondary btn-custom">
                    Quay lại đăng nhập
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="min-vh-100 d-flex align-items-center">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5}>
          <Card className="card-custom">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock text-primary" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3 mb-2">Đặt lại mật khẩu</h3>
                <p className="text-muted">
                  Nhập mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              <Form onSubmit={handleSubmit}>
                {/* Mật khẩu mới */}
                <Form.Group className="mb-3">
                  <Form.Label>
                    Mật khẩu mới <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Nhập mật khẩu mới"
                      value={formData.password}
                      onChange={handleInputChange}
                      isInvalid={!!errors.password}
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('password')}
                      disabled={isLoading}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Mật khẩu phải có ít nhất 6 ký tự
                  </Form.Text>
                </Form.Group>

                {/* Xác nhận mật khẩu */}
                <Form.Group className="mb-4">
                  <Form.Label>
                    Xác nhận mật khẩu <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPasswordConfirm ? 'text' : 'password'}
                      name="passwordConfirm"
                      placeholder="Nhập lại mật khẩu mới"
                      value={formData.passwordConfirm}
                      onChange={handleInputChange}
                      isInvalid={!!errors.passwordConfirm}
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={() => togglePasswordVisibility('passwordConfirm')}
                      disabled={isLoading}
                    >
                      <i className={`bi ${showPasswordConfirm ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.passwordConfirm}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 btn-custom"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-circle me-2"></i>
                      Đặt lại mật khẩu
                    </>
                  )}
                </Button>
              </Form>

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-0 text-muted">
                  Nhớ mật khẩu? {' '}
                  <Link to="/login" className="text-decoration-none">
                    Quay lại đăng nhập
                  </Link>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
