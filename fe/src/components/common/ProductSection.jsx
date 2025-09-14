import React from 'react';
import { Row, Col, Alert } from 'react-bootstrap';
import ProductCard from './ProductCard';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import Pagination from './Pagination';

const ProductSection = ({ 
  title, 
  subtitle, 
  products = [], 
  loading = false, 
  error = null,
  showViewMore = false,
  onViewMore,
  // Pagination props
  enablePagination = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 4
}) => {
  if (loading) {
    return (
      <div className="product-section">
        <div className="text-center mb-4">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle text-muted">{subtitle}</p>}
        </div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-section">
        <div className="text-center mb-4">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle text-muted">{subtitle}</p>}
        </div>
        <Alert variant="danger" className="text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Có lỗi xảy ra khi tải dữ liệu: {error.message || 'Vui lòng thử lại sau'}
        </Alert>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="product-section">
        <div className="text-center mb-4">
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle text-muted">{subtitle}</p>}
        </div>
        <EmptyState 
          title="Chưa có sản phẩm"
          message="Hiện tại chưa có sản phẩm nào trong danh mục này."
          icon="inbox"
        />
      </div>
    );
  }

  return (
    <div className="product-section">
      <div className="text-center mb-4">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle text-muted">{subtitle}</p>}
      </div>
      
      <Row className="g-4">
        {products.map((product) => (
          <Col 
            key={product._id} 
            xs={12} 
            sm={6} 
            md={itemsPerPage === 8 ? 3 : 4} 
            lg={itemsPerPage === 8 ? 3 : 3}
          >
            <ProductCard product={product} />
          </Col>
        ))}
      </Row>

      {enablePagination && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={onPageChange}
          loading={loading}
        />
      )}

      {showViewMore && onViewMore && !enablePagination && (
        <div className="text-center mt-4">
          <button 
            className="btn btn-outline-primary btn-lg"
            onClick={onViewMore}
          >
            <i className="fas fa-eye me-2"></i>
            Xem thêm sản phẩm
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductSection;