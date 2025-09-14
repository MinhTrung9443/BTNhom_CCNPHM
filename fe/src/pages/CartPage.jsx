import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Row, Col, ListGroup, Button, Image, Card } from 'react-bootstrap';
import { updateItemQuantity, removeItemFromCart } from '../redux/cartSlice';

const CartPage = () => {
    const dispatch = useDispatch();
    const { items: cartItems, status } = useSelector((state) => state.cart);

    const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = cartItems.reduce((acc, item) => acc + item.quantity * item.price, 0);

    const handleRemoveItem = (productId) => {
        dispatch(removeItemFromCart(productId));
    };

    const handleUpdateQuantity = (productId, change) => {
        dispatch(updateItemQuantity({ productId, quantity: change }));
    };

    return (
        <Container className="my-5">
            <Row>
                <Col md={8}>
                    <h1 className="mb-4">Giỏ hàng của bạn</h1>
                    {cartItems.length === 0 ? (
                        <Card className="text-center p-4 shadow-sm">
                            <Card.Body>
                                <Card.Title>Giỏ hàng của bạn đang trống</Card.Title>
                                <Button as={Link} to="/products" variant="primary" className="mt-3">
                                    Tiếp tục mua sắm
                                </Button>
                            </Card.Body>
                        </Card>
                    ) : (
                        <ListGroup variant="flush">
                            {cartItems.map((item) => (
                                item.productId ? (
                                    <ListGroup.Item key={item.productId._id} className="d-flex align-items-center p-3 mb-2 shadow-sm">
                                        <Image
                                            src={item.productId.images[0]}
                                            alt={item.productId.name}
                                            thumbnail
                                            style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                                        />

                                        <div className="ms-3 flex-grow-1">
                                            <Link to={`/products/${item.productId._id}`} className="text-decoration-none text-dark">
                                                <h5>{item.productId.name}</h5>
                                            </Link>
                                            <p className="mb-1 text-primary fw-bold">{item.price.toLocaleString('vi-VN')}đ</p>
                                            <div className="d-flex align-items-center mt-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => handleUpdateQuantity(item.productId._id, -1)}
                                                    disabled={status === 'loading'}
                                                >
                                                    -
                                                </Button>
                                                <span className="mx-3 fw-bold">{item.quantity}</span>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={() => handleUpdateQuantity(item.productId._id, 1)}
                                                    disabled={status === 'loading'}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="ms-3 text-end">
                                            <h6 className="mb-2">Thành tiền</h6>
                                            <p className="fw-bold fs-5">{(item.price * item.quantity).toLocaleString('vi-VN')}đ</p>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveItem(item.productId._id)}
                                                disabled={status === 'loading'}
                                            >
                                                <i className="fas fa-trash"></i> Xóa
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ) : (
                                    <ListGroup.Item key={item._id} className="d-flex align-items-center p-3 mb-2 shadow-sm">
                                        <div className="ms-3 flex-grow-1">
                                            <h5>Sản phẩm không còn tồn tại</h5>
                                            <p className="mb-1 text-danger fw-bold">Vui lòng xóa khỏi giỏ hàng</p>
                                            <Button
                                                variant="outline-danger"
                                                size="sm"
                                                onClick={() => handleRemoveItem(item.productId)}
                                                disabled={status === 'loading'}
                                            >
                                                <i className="fas fa-trash"></i> Xóa
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                )
                            ))}
                        </ListGroup>
                    )}
                </Col>

                <Col md={4}>
                    <Card className="shadow-sm sticky-top" style={{ top: '20px' }}>
                        <Card.Body>
                            <Card.Title className="mb-3">Tổng cộng</Card.Title>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Tạm tính ({totalItems} sản phẩm)</span>
                                    <strong>{totalPrice.toLocaleString('vi-VN')}đ</strong>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Phí vận chuyển</span>
                                    <span>Miễn phí</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between border-top pt-3">
                                    <h4 className="fw-bold">Tổng tiền</h4>
                                    <h4 className="text-danger fw-bold">{totalPrice.toLocaleString('vi-VN')}đ</h4>
                                </ListGroup.Item>
                            </ListGroup>
                            <div className="d-grid mt-4">
                                <Button
                                    variant="warning"
                                    size="lg"
                                    disabled={cartItems.length === 0 || status === 'loading'}
                                >
                                    {status === 'loading' ? 'Đang cập nhật...' : 'Tiến hành Thanh toán'}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default CartPage;
