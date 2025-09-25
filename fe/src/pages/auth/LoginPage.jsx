import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import InputGroup from 'react-bootstrap/InputGroup';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/userSlice';
import authService from '../../services/authService';
import { validateEmail, validatePassword } from '../../utils/validation';


const LoginPage = () => {
  const navigate = useNavigate(); 
  const dispatch = useDispatch();
  const location = useLocation();
  const message = location.state?.message;

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authService.login(formData.email, formData.password);
      console.log('Login response:', response);
      const { user, token } = response.data;
      console.log('Login user:', user);

      // Check if user is admin and show notification
      if (user.role === 'admin') {
        toast.error(
          '🔒 Tài khoản quản trị viên không thể truy cập ứng dụng khách hàng này. Vui lòng sử dụng giao diện quản trị dành riêng cho admin.',
          {
            position: 'top-center',
            autoClose: 7000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
        setIsLoading(false);
        return; // Prevent login for admin users
      }

      dispatch(loginSuccess({ user, token }));
      navigate('/');

    } catch (error) {
      console.log('=== LOGIN ERROR DEBUG ===');
      console.log('Full error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error message:', error.response?.data?.message);
      console.log('========================');
      
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi đăng nhập.';
      console.log('Final error message for toast:', errorMessage);
      
      // Test if toast is working
      console.log('Attempting to show toast error...');
      toast.error(errorMessage, {
        position: 'top-center',
        autoClose: 6000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.log('Toast error called');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.message;
      isValid = false;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  return (
    <Container className="min-vh-100 d-flex align-items-center">
      <Row className="w-100 justify-content-center">
        <Col md={6} lg={5}>
          <Card className="card-custom">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <i className="bi bi-person-circle text-primary" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3 mb-2">Đăng nhập</h3>
                <p className="text-muted">
                  Chào mừng bạn quay trở lại!
                </p>
              </div>

              {message && (
                <Alert variant="success" className="alert-custom">
                  {message}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Email <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleInputChange}
                    isInvalid={!!errors.email}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    Mật khẩu <span className="text-danger">*</span>
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Nhập mật khẩu"
                      value={formData.password}
                      onChange={handleInputChange}
                      isInvalid={!!errors.password}
                      disabled={isLoading}
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </Button>
                    <Form.Control.Feedback type="invalid">
                      {errors.password}
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                <div className="text-end mb-3">
                  <Link 
                    to="/forgot-password" 
                    className="text-decoration-none text-primary"
                  >
                    Quên mật khẩu?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-100 btn-custom"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" className="me-2"/>
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

              <hr className="my-4" />

              <div className="text-center">
                <p className="mb-2 text-muted">
                  Chưa có tài khoản? {' '}
                  <Link to="/register" className="text-decoration-none">
                    Đăng ký ngay
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

export default LoginPage;