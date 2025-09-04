import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
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
            e.target.src = '/placeholder-image.jpg';
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
      </Link> {/* Đóng thẻ Link */}
      
       <Card.Body className="d-flex flex-column">
        <Card.Title className="product-title">
           {/* Tên sản phẩm cũng là một link */}
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
          <button className="btn btn-warning btn-sm">
            <i className="fas fa-cart-plus me-2"></i>
            Thêm vào giỏ
          </button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ProductCard;