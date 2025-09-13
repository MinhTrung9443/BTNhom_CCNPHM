import React from 'react'
import { Card, Badge, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { Star, Eye, ShoppingCart, Heart } from 'lucide-react'

const ProductCard = ({ product }) => {
  if (!product) return null

  const {
    _id,
    name,
    description,
    price,
    discount = 0,
    images = [],
    categoryId,
    rating = 4.5,
    reviewCount = 0
  } = product

  const discountedPrice = discount > 0 ? price * (1 - discount / 100) : price
  const imageUrl = images[0] || 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400'
  const categoryName = categoryId?.name || 'Chưa phân loại'

  return (
    <Card className="product-card h-100 shadow-sm border-0">
      <div className="product-image-wrapper position-relative">
        <Link to={`/products/${_id}`}>
          <Card.Img 
            variant="top" 
            src={imageUrl}
            alt={name}
            className="product-image"
            style={{ height: '220px', objectFit: 'cover' }}
            onError={(e) => {
              e.target.onerror = null
              e.target.src = 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=400'
            }}
          />
        </Link>
        
        {discount > 0 && (
          <Badge bg="danger" className="position-absolute top-0 start-0 m-2 discount-badge">
            -{discount}%
          </Badge>
        )}
        
        <Badge bg="secondary" className="position-absolute top-0 end-0 m-2 category-badge">
          {categoryName}
        </Badge>

        <div className="product-overlay position-absolute top-50 start-50 translate-middle">
          <Button 
            variant="light" 
            size="sm" 
            className="rounded-circle me-2 overlay-btn"
            title="Yêu thích"
          >
            <Heart size={16} />
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            className="rounded-circle overlay-btn"
            title="Xem nhanh"
          >
            <Eye size={16} />
          </Button>
        </div>
      </div>
      
      <Card.Body className="d-flex flex-column p-3">
        <div className="mb-2">
          <Link to={`/products/${_id}`} className="text-decoration-none">
            <Card.Title className="product-title h6 text-dark">
              {name}
            </Card.Title>
          </Link>
        </div>
        
        <Card.Text className="product-description text-muted flex-grow-1 small">
          {description && description.length > 80 
            ? `${description.substring(0, 80)}...` 
            : description || 'Đặc sản truyền thống Sóc Trăng với hương vị đậm đà'}
        </Card.Text>
        
        {rating > 0 && (
          <div className="rating mb-2">
            <div className="d-flex align-items-center">
              <div className="stars me-2">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    className={i < Math.floor(rating) ? 'text-warning' : 'text-muted'}
                    fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
                  />
                ))}
              </div>
              <small className="text-muted">
                {rating.toFixed(1)} ({reviewCount})
              </small>
            </div>
          </div>
        )}
        
        <div className="product-price mb-3">
          <div className="d-flex align-items-center">
            <span className="current-price h6 fw-bold text-primary mb-0">
              {discountedPrice.toLocaleString('vi-VN')}đ
            </span>
            {discount > 0 && (
              <small className="original-price text-muted text-decoration-line-through ms-2">
                {price.toLocaleString('vi-VN')}đ
              </small>
            )}
          </div>
        </div>
        
        <div className="product-actions">
          <div className="d-grid gap-2">
            <Button 
              as={Link}
              to={`/products/${_id}`}
              variant="outline-primary" 
              size="sm"
              className="view-btn"
            >
              <Eye size={14} className="me-1" />
              Xem chi tiết
            </Button>
            <Button 
              variant="warning" 
              size="sm"
              className="add-to-cart-btn"
            >
              <ShoppingCart size={14} className="me-1" />
              Thêm vào giỏ
            </Button>
          </div>
        </div>
      </Card.Body>

      <style jsx>{`
        .product-card {
          transition: all var(--transition-normal);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: var(--shadow-xl);
        }

        .product-image-wrapper {
          overflow: hidden;
        }

        .product-image {
          transition: transform var(--transition-slow);
          border-radius: 0;
        }

        .product-card:hover .product-image {
          transform: scale(1.05);
        }

        .discount-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.375rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .category-badge {
          font-size: 0.7rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-full);
          background-color: rgba(0,0,0,0.6) !important;
        }

        .product-overlay {
          opacity: 0;
          transition: opacity var(--transition-normal);
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .overlay-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          transition: all var(--transition-fast);
        }

        .overlay-btn:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-lg);
        }

        .product-title {
          line-height: 1.3;
          font-weight: 600;
          margin-bottom: 0.5rem;
          transition: color var(--transition-fast);
        }

        .product-title:hover {
          color: var(--primary-brown) !important;
        }

        .product-description {
          line-height: 1.4;
          font-size: 0.875rem;
        }

        .current-price {
          color: var(--primary-brown) !important;
          font-size: 1.1rem;
        }

        .view-btn {
          border-color: var(--primary-brown);
          color: var(--primary-brown);
          transition: all var(--transition-fast);
        }

        .view-btn:hover {
          background-color: var(--primary-brown);
          border-color: var(--primary-brown);
          color: white;
        }

        .add-to-cart-btn {
          background: linear-gradient(135deg, var(--gold) 0%, #ffb300 100%);
          border: none;
          color: var(--dark-brown);
          font-weight: 600;
          transition: all var(--transition-fast);
        }

        .add-to-cart-btn:hover {
          background: linear-gradient(135deg, #ffb300 0%, var(--gold) 100%);
          color: var(--dark-brown);
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
        }

        .stars {
          display: flex;
          gap: 1px;
        }
      `}</style>
    </Card>
  )
}

export default ProductCard