import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';
import { toast } from 'react-toastify';

import authService from '../../services/authService';
import { validateForgotPasswordForm } from '../../utils/validation';

/**
 * Trang quên mật khẩu
 */
const ForgotPasswordPage = () => {
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
   * Xử lý submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validation = validateForgotPasswordForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.forgotPassword(formData.email);
      setIsSubmitted(true);
      toast.success('Email khôi phục mật khẩu đã được gửi!');
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
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Container className="min-vh-100 d-flex align-items-center">
        <Row className="w-100 justify-content-center">
          <Col md={6} lg={5}>
            <Card className="card-custom">
              <Card.Body className="p-4 text-center">
                <div className="mb-4">
                  <i className="bi bi-envelope-check text-success" style={{ fontSize: '3rem' }}></i>
                </div>
                <h4 className="mb-3">Email đã được gửi!</h4>
                <p className="text-muted mb-4">
                  Chúng tôi đã gửi hướng dẫn khôi phục mật khẩu đến email <strong>{formData.email}</strong>. 
                  Vui lòng kiểm tra hộp thư của bạn và làm theo hướng dẫn.
                </p>
                <Alert variant="info" className="alert-custom text-start">
                  <strong>Lưu ý:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Kiểm tra cả thư mục spam/junk mail</li>
                    <li>Link khôi phục sẽ hết hạn sau 1 giờ</li>
                    <li>Nếu không nhận được email, bạn có thể gửi lại</li>
                  </ul>
                </Alert>
                <div className="d-flex flex-column gap-2">
                  <Button 
                    variant="primary" 
                    onClick={() => setIsSubmitted(false)}
                    className="btn-custom"
                  >
                    Gửi lại email
                  </Button>
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
                <i className="bi bi-key text-primary" style={{ fontSize: '3rem' }}></i>
                <h3 className="mt-3 mb-2">Quên mật khẩu?</h3>
                <p className="text-muted">
                  Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn khôi phục mật khẩu
                </p>
              </div>

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
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-envelope me-2"></i>
                      Gửi email khôi phục
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

export default ForgotPasswordPage;
