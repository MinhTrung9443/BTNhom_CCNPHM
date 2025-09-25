import React from 'react';
import { useDispatch } from 'react-redux';
import { updateItemQuantity, removeItemFromCart } from '../../redux/cartSlice';
import { Button, Image, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

/**
 * CartItem component - displays individual cart item with quantity controls
 * @param {Object} props
 * @param {Object} props.item - Cart item object
 * @param {boolean} props.isSelected - Whether item is selected
 * @param {Function} props.onSelect - Function to handle item selection
 */
const CartItem = ({ item, isSelected, onSelect }) => {
  const dispatch = useDispatch();

  // Calculate discounted price
  const calculatePrice = (product) => {
    const price = product.price;
    const discount = product.discount || 0;
    return price * (1 - discount / 100);
  };

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem();
      return;
    }

    try {
      await dispatch(updateItemQuantity({ 
        productId: item.productId._id, 
        quantity: newQuantity 
      })).unwrap();
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async () => {
    try {
      await dispatch(removeItemFromCart(item.productId._id)).unwrap();
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const discountedPrice = calculatePrice(item.productId);
  const totalPrice = discountedPrice * item.quantity;

  return (
    <Card className="mb-3 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center">
          {/* Selection checkbox */}
          <input
            type="checkbox"
            className="me-3"
            style={{
              width: '20px',
              height: '20px',
              cursor: 'pointer'
            }}
            checked={isSelected}
            onChange={() => onSelect(item.productId._id, item.quantity)}
          />

          {/* Product image */}
          <Image
            src={item.productId.images[0]}
            alt={item.productId.name}
            thumbnail
            style={{
              width: '80px',
              height: '80px',
              objectFit: 'cover',
            }}
          />

          {/* Product details */}
          <div className="ms-3 flex-grow-1">
            <Link
              to={`/products/${item.productId._id}`}
              className="text-decoration-none text-dark"
            >
              <h6 className="mb-1">{item.productId.name}</h6>
            </Link>
            
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="text-primary fw-bold">
                {discountedPrice.toLocaleString('vi-VN')}đ
              </span>
              {item.productId.discount > 0 && (
                <>
                  <span className="text-muted text-decoration-line-through small">
                    {item.productId.price.toLocaleString('vi-VN')}đ
                  </span>
                  <span className="badge bg-danger small">
                    -{item.productId.discount}%
                  </span>
                </>
              )}
            </div>

            {/* Quantity controls */}
            <div className="d-flex align-items-center gap-2">
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => handleQuantityChange(item.quantity - 1)}
              >
                -
              </Button>
              <span className="mx-2 fw-bold">{item.quantity}</span>
              <Button
                size="sm"
                variant="outline-secondary"
                onClick={() => handleQuantityChange(item.quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>

          {/* Total price and remove button */}
          <div className="text-end">
            <p className="fw-bold mb-2">
              {totalPrice.toLocaleString('vi-VN')}đ
            </p>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleRemoveItem}
            >
              <i className="fas fa-trash"></i>
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default CartItem;