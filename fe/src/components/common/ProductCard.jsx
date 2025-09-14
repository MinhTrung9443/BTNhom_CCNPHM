import React, { useState } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../../redux/cartSlice';
const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isAdding, setIsAdding] = useState(false);
  const { status: cartStatus } = useSelector((state) => state.cart);
  if (!product) return null;

  const {
    _id,
    name,
    description,
    price,
    discount = 0,
    images = [],
    categoryId
  } = product;

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price;
  const imageUrl = images[0] || '/placeholder-image.jpg';
  const categoryName = categoryId?.name || 'Chưa phân loại';

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      await dispatch(addItemToCart({ productId: _id, quantity: 1 })).unwrap();

    } catch (error) {
      console.error('Failed to add item to cart:', error);
      alert(`Lỗi: ${error.message || 'Không thể thêm sản phẩm'}`);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="product-card h-100 shadow-sm">
      <Link to={`/products/${_id}`} className="position-relative d-block"> {/* Bọc Link ở ngoài */}
        <Card.Img
          variant="top"
          src={imageUrl}
          alt={name}
          className="product-image"
          style={{ height: '200px', objectFit: 'cover' }}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUK2Rlg80FB-d9IqnxIPRI2bBN7RRRkw5OpQ&s';
          }}
        />

        {discount > 0 && (
          <Badge bg="danger" className="position-absolute top-0 start-0 m-2">
            -{discount}%
          </Badge>
        )}

        <Badge bg="secondary" className="position-absolute top-0 end-0 m-2">
          {categoryName}
        </Badge>
      </Link>

      <Card.Body className="d-flex flex-column">
        <Card.Title className="product-title">
          <Link to={`/products/${_id}`} className="text-decoration-none text-dark">
            {name}
          </Link>
        </Card.Title>

        <Card.Text className="product-description text-muted flex-grow-1">
          {description && description.length > 100
            ? `${description.substring(0, 100)}...`
            : description}
        </Card.Text>

        <div className="product-price mt-auto">
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <span className="current-price fw-bold text-primary">
                {discountedPrice.toLocaleString('vi-VN')}đ
              </span>
              {discount > 0 && (
                <small className="original-price text-muted text-decoration-line-through ms-2">
                  {price.toLocaleString('vi-VN')}đ
                </small>
              )}
            </div>
          </div>
        </div>
      </Card.Body>

      <Card.Footer className="border-0 bg-transparent">
        <div className="d-grid gap-2">
          <Link
            to={`/products/${_id}`}
            className="btn btn-primary btn-sm"
          >
            <i className="fas fa-eye me-2"></i>
            Xem chi tiết
          </Link>
          <Button
            variant="warning"
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding}
          >
            {isAdding ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang thêm...
              </>
            ) : (
              <>
                <i className="fas fa-cart-plus me-2"></i>
                Thêm vào giỏ
              </>
            )}
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;