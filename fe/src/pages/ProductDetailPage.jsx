import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert } from 'react-bootstrap';
import { productService } from '../services/productService';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ProductSection from '../components/common/ProductSection';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';

const ProductDetailPage = () => {
  const { id } = useParams();

  // State cho sản phẩm chính
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho sản phẩm liên quan
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [relatedError, setRelatedError] = useState(null);

  // State cho các tương tác người dùng
  const [quantity, setQuantity] = useState(1);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  useEffect(() => {
    // Tự động cuộn lên đầu trang khi chuyển sản phẩm
    window.scrollTo(0, 0);

    const fetchAllData = async () => {
      try {
        // Bắt đầu tải dữ liệu, reset trạng thái
        setLoading(true);
        setRelatedLoading(true);
        setError(null);
        setRelatedError(null);
        setQuantity(1); // Reset số lượng về 1 cho sản phẩm mới

        // 1. Tải dữ liệu sản phẩm chính
        const productResponse = await productService.getProductById(id);
        setProduct(productResponse.data);

        // 2. Tải dữ liệu sản phẩm liên quan
        const relatedResponse = await productService.getRelatedProducts(id);
        setRelatedProducts(relatedResponse.data);

      } catch (err) {
        console.error("Error fetching page data:", err);
        // Nếu sản phẩm chính chưa tải được thì đây là lỗi nghiêm trọng
        if (!product) {
          setError(err.message || 'Không thể tải thông tin sản phẩm.');
        } else { // Ngược lại, chỉ là lỗi tải sản phẩm liên quan
          setRelatedError(err.message || 'Lỗi khi tải sản phẩm liên quan.');
        }
      } finally {
        // Hoàn tất tải dữ liệu
        setLoading(false);
        setRelatedLoading(false);
      }
    };

    fetchAllData();
  }, [id]); // useEffect sẽ chạy lại mỗi khi `id` trên URL thay đổi

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (product && newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // Các trạng thái hiển thị chính
  if (loading) return <LoadingSpinner />;
  if (error) return <Container className="py-5"><Alert variant="danger">{error}</Alert></Container>;
  if (!product) return <Container className="py-5"><Alert variant="warning">Không tìm thấy sản phẩm.</Alert></Container>;

  // Tính toán giá sau khi giảm
  const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price;

  return (
    <div className="product-detail-page">
      <Container className="py-5">
        <Row>
          {/* Cột hình ảnh sản phẩm với Swiper */}
          <Col md={6}>
            <Swiper
              style={{ '--swiper-navigation-color': '#fff', '--swiper-pagination-color': '#fff' }}
              spaceBetween={10}
              navigation={true}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              modules={[FreeMode, Navigation, Thumbs]}
              className="main-swiper mb-3 rounded"
            >
              {product.images && product.images.length > 0 ? (
                product.images.map((img, index) => (
                  <SwiperSlide key={index}>
                    <img src={img} alt={`${product.name} ${index + 1}`} className="img-fluid" />
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <img src="/placeholder-image.jpg" alt="Placeholder" className="img-fluid" />
                </SwiperSlide>
              )}
            </Swiper>
            {product.images && product.images.length > 1 && (
              <Swiper
                onSwiper={setThumbsSwiper}
                spaceBetween={10}
                slidesPerView={4}
                freeMode={true}
                watchSlidesProgress={true}
                modules={[FreeMode, Navigation, Thumbs]}
                className="thumb-swiper"
              >
                {product.images.map((img, index) => (
                  <SwiperSlide key={index} style={{ cursor: 'pointer' }}>
                    <img src={img} alt={`Thumbnail ${index + 1}`} className="img-fluid rounded" />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </Col>

          {/* Cột thông tin sản phẩm */}
          <Col md={6}>
            <Card className="border-0">
              <Card.Body>
                {product.categoryId && (
                  <Link to={`/products?category=${product.categoryId._id}`}>
                    <Badge bg="info" className="mb-2 text-dark">{product.categoryId.name}</Badge>
                  </Link>
                )}
                <h1 className="product-detail-title">{product.name}</h1>
                
                <div className="d-flex align-items-center my-3">
                  <h2 className="current-price text-primary fw-bold mb-0">
                    {discountedPrice.toLocaleString('vi-VN')}đ
                  </h2>
                  {product.discount > 0 && (
                    <small className="original-price text-muted text-decoration-line-through ms-3">
                      {product.price.toLocaleString('vi-VN')}đ
                    </small>
                  )}
                </div>

                <p className="product-detail-description text-muted">
                  {product.description}
                </p>

                <hr />

                <div className="mb-3">
                  <strong>Tình trạng: </strong>
                  {product.stock > 0 ? (
                    <Badge bg="success">Còn hàng ({product.stock} sản phẩm)</Badge>
                  ) : (
                    <Badge bg="danger">Hết hàng</Badge>
                  )}
                </div>

                {product.stock > 0 && (
                  <div className="d-flex align-items-center mb-4">
                    <strong>Số lượng:</strong>
                    <div className="input-group w-auto ms-3" style={{ maxWidth: '120px' }}>
                      <Button variant="outline-secondary" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</Button>
                      <Form.Control 
                        type="text" 
                        className="text-center" 
                        value={quantity} 
                        readOnly 
                      />
                      <Button variant="outline-secondary" onClick={() => handleQuantityChange(1)} disabled={quantity >= product.stock}>+</Button>
                    </div>
                  </div>
                )}

                <div className="d-grid gap-2">
                   <Button 
                      variant="warning" 
                      size="lg" 
                      disabled={product.stock === 0}
                      // onClick={() => addToCart(product, quantity)} // Logic thêm vào giỏ hàng sẽ ở đây
                    >
                     <i className="fas fa-cart-plus me-2"></i>
                     {product.stock > 0 ? 'Thêm vào giỏ hàng' : 'Đã hết hàng'}
                   </Button>
                </div>

              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* Phần sản phẩm liên quan */}
        <hr className="my-5" />
        
        <Row>
          <Col>
            <ProductSection 
              title="Sản phẩm liên quan"
              subtitle="Có thể bạn cũng sẽ thích"
              products={relatedProducts}
              loading={relatedLoading}
              error={relatedError}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ProductDetailPage;