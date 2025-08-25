import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Spinner, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';
import Header from '../components/common/Header';
import { useAuth } from '../contexts/AuthContext';
import userService from '../services/userService'; 
const ProfilePage = () => {
    const { user, token, login } = useAuth();
    const [formData, setFormData] = useState({ name: '', phone: '', address: '' });
    const [isLoading, setIsLoading] = useState(false);
    
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                address: user.address || '',
            });
        }
    }, [user]);

    const validate = (name, value) => {
        let errorMsg = null;
        if (name === 'phone') {
            if (value) {
                if (!/^[0-9]+$/.test(value)) {
                    errorMsg = 'Số điện thoại chỉ được chứa số.';
                } 
                else if (value.length !== 10) {
                    errorMsg = 'Số điện thoại phải có đúng 10 chữ số.';
                }
            }
        }
        if (name === 'name' && !value) {
            errorMsg = 'Tên không được để trống.';
        }

        return errorMsg;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        const error = validate(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formErrors = {};
        Object.keys(formData).forEach(key => {
            const error = validate(key, formData[key]);
            if (error) {
                formErrors[key] = error;
            }
        });

        if (Object.keys(formErrors).length > 0) {
            setErrors(formErrors);
            toast.error('Vui lòng kiểm tra lại thông tin.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await userService.updateCurrentUser(formData);
            const updatedUser = response.data.user;
            login(updatedUser, token);
            toast.success('Cập nhật thông tin thành công!');
        } catch (error) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra, không thể cập nhật.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return <p>Đang tải thông tin...</p>;
    }

    return (
        <div>
            <Header />
            <Container className="my-4">
                <Card className="p-4">
                    <Card.Title as="h3" className="mb-4">Hồ sơ cá nhân</Card.Title>
                    <Form noValidate onSubmit={handleSubmit}>
                        <Row>
                            <Col md={4} className="text-center mb-4 mb-md-0">
                                <Image 
                                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random&size=150`}
                                    roundedCircle 
                                    className="mb-3"
                                />
                                <h4>{user.name}</h4>
                                <p className="text-muted">{user.email}</p>
                            </Col>

                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Họ và tên</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        isInvalid={!!errors.name}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.name}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="tel" name="phone" value={formData.phone}
                                        onChange={handleInputChange} placeholder="Chưa có thông tin"
                                        isInvalid={!!errors.phone} 
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.phone}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Địa chỉ</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        placeholder="Chưa có thông tin"
                                    />
                                </Form.Group>

                                <Button type="submit" variant="primary" disabled={isLoading} className="px-4">
                                    {isLoading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" className="me-2" />
                                            Đang lưu...
                                        </>
                                    ) : 'Lưu thay đổi'}
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card>
            </Container>
        </div>
    );
};

export default ProfilePage;