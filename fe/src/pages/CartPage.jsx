import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Button,
  Image,
  Card,
  Alert,
  Spinner,
} from "react-bootstrap";
import { updateItemQuantity, removeItemFromCart, fetchCart } from "../redux/cartSlice";
import { toast } from "react-toastify";

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: cartItems, status, error } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.user);

  // State lưu sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState([]);

  // Load cart when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated]);

  // Show error if any
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCheckboxChange = (productId, quantity) => {
    const isSelected = selectedItems.some(
      (item) => item.productId === productId
    );

    if (isSelected) {
      setSelectedItems(
        selectedItems.filter((item) => item.productId !== productId)
      );
    } else {
      setSelectedItems([...selectedItems, { productId, quantity }]);
    }
  };

  // Calculate totals based on actual product price and discount
  const calculatePrice = (product, quantity) => {
    const price = product.price;
    const discount = product.discount || 0;
    const discountedPrice = price * (1 - discount / 100);
    return discountedPrice * quantity;
  };

  // Calculate totals only for selected items
  const selectedCartItems = cartItems.filter(item => 
    selectedItems.some(selected => selected.productId === item.productId._id)
  );
  
  const totalItems = selectedCartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = selectedCartItems.reduce(
    (acc, item) => acc + calculatePrice(item.productId, item.quantity),
    0
  );

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeItemFromCart(productId)).unwrap();
      toast.success("Đã xóa sản phẩm khỏi giỏ hàng");
      // Remove from selected items if it was selected
      setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    } catch (error) {
      toast.error("Không thể xóa sản phẩm");
    }
  };

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    try {
      await dispatch(updateItemQuantity({ productId, quantity: newQuantity })).unwrap();
      // Update selected items if this product is selected
      setSelectedItems(selectedItems.map(item => 
        item.productId === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    } catch (error) {
      toast.error("Không thể cập nhật số lượng");
    }
  };

  const handlePreviewOrder = async () => {
    if (selectedItems.length === 0) {
      toast.warning("Vui lòng chọn ít nhất một sản phẩm để tiếp tục.");
      return;
    }
    
    try {
      // Transform selected cart items to the format needed for order preview
      const selectedCartItemsData = selectedCartItems.map((item) => ({
        productId: item.productId._id,
        productName: item.productId.name,
        productImage: item.productId.images[0],
        productPrice: item.productId.price,
        discount: item.productId.discount || 0,
        quantity: item.quantity,
      }));

      // Navigate to order preview page with selected items
      navigate("/order-preview", {
        state: {
          selectedItems: selectedCartItemsData
        }
      });
    } catch (error) {
      console.error("Error preparing order preview:", error);
      toast.error("Đã xảy ra lỗi khi chuẩn bị đơn hàng. Vui lòng thử lại.");
    }
  };

  // Show loading spinner while fetching cart
  if (status === 'loading' && cartItems.length === 0) {
    return (
      <Container className="my-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-3">Đang tải giỏ hàng...</p>
      </Container>
    );
  }

  // Show error if cart fetch failed
  if (status === 'failed' && !cartItems.length) {
    return (
      <Container className="my-5">
        <Alert variant="danger">
          <Alert.Heading>Không thể tải giỏ hàng</Alert.Heading>
          <p>Đã xảy ra lỗi khi tải giỏ hàng. Vui lòng thử lại.</p>
          <Button 
            variant="outline-danger" 
            onClick={() => dispatch(fetchCart())}
          >
            Thử lại
          </Button>
        </Alert>
      </Container>
    );
  }

  // Require authentication to view cart
  if (!isAuthenticated) {
    return (
      <Container className="my-5">
        <Alert variant="warning">
          <Alert.Heading>Đăng nhập để xem giỏ hàng</Alert.Heading>
          <p>Bạn cần đăng nhập để xem và quản lý giỏ hàng của mình.</p>
          <Button as={Link} to="/login" variant="primary">
            Đăng nhập
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="my-5">
      <Row>
        <Col md={8}>
          <h1 className="mb-4">Giỏ hàng của bạn</h1>
          {cartItems.length === 0 ? (
            <Card className="text-center p-4 shadow-sm">
              <Card.Body>
                <Card.Title>Giỏ hàng của bạn đang trống</Card.Title>
                <Button
                  as={Link}
                  to="/products"
                  variant="primary"
                  className="mt-3"
                >
                  Tiếp tục mua sắm
                </Button>
              </Card.Body>
            </Card>
          ) : (
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item
                  key={item.productId._id}
                  className="d-flex align-items-center p-3 mb-2 shadow-sm"
                >
                  {/* Checkbox chọn sản phẩm */}
                  <input
                    type="checkbox"
                    className="me-3"
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                    checked={selectedItems.some(
                      (selected) => selected.productId === item.productId._id
                    )}
                    onChange={() =>
                      handleCheckboxChange(item.productId._id, item.quantity)
                    }
                  />

                  <Image
                    src={item.productId.images[0]}
                    alt={item.productId.name}
                    thumbnail
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />

                  <div className="ms-3 flex-grow-1">
                    <Link
                      to={`/products/${item.productId._id}`}
                      className="text-decoration-none text-dark"
                    >
                      <h5>{item.productId.name}</h5>
                    </Link>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="text-primary fw-bold fs-6">
                        {(item.productId.price * (1 - (item.productId.discount || 0) / 100)).toLocaleString("vi-VN")}đ
                      </span>
                      {item.productId.discount > 0 && (
                        <>
                          <span className="text-muted text-decoration-line-through small">
                            {item.productId.price.toLocaleString("vi-VN")}đ
                          </span>
                          <span className="badge bg-danger">
                            -{item.productId.discount}%
                          </span>
                        </>
                      )}
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          handleUpdateQuantity(item.productId._id, item.quantity - 1)
                        }
                        disabled={status === "loading"}
                      >
                        -
                      </Button>
                      <span className="mx-3 fw-bold">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() =>
                          handleUpdateQuantity(item.productId._id, item.quantity + 1)
                        }
                        disabled={status === "loading"}
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div className="ms-3 text-end">
                    <h6 className="mb-2">Thành tiền</h6>
                    <p className="fw-bold fs-5">
                      {calculatePrice(item.productId, item.quantity).toLocaleString("vi-VN")}đ
                    </p>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveItem(item.productId._id)}
                      disabled={status === "loading"}
                    >
                      <i className="fas fa-trash"></i> Xóa
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>

        <Col md={4}>
          <Card className="shadow-sm sticky-top" style={{ top: "20px" }}>
            <Card.Body>
              <Card.Title className="mb-3">Tổng cộng</Card.Title>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Tạm tính ({totalItems} sản phẩm đã chọn)</span>
                  <strong>{totalPrice.toLocaleString("vi-VN")}đ</strong>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between">
                  <span>Phí vận chuyển</span>
                  <span>Miễn phí</span>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between border-top pt-3">
                  <h4 className="fw-bold">Tổng tiền</h4>
                  <h4 className="text-danger fw-bold">
                    {totalPrice.toLocaleString("vi-VN")}đ
                  </h4>
                </ListGroup.Item>
              </ListGroup>
              <div className="d-grid mt-4">
                <Button
                  variant="warning"
                  size="lg"
                  disabled={cartItems.length === 0 || selectedItems.length === 0 || status === "loading"}
                  onClick={handlePreviewOrder}
                >
                  {status === "loading"
                    ? "Đang cập nhật..."
                    : selectedItems.length === 0
                    ? "Chọn sản phẩm để thanh toán"
                    : "Tiến hành Thanh toán"}
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
