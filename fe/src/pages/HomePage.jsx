import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import ProductSection from '../components/common/ProductSection';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    latest: false,
    bestSellers: false,
    mostViewed: false,
    topDiscounts: false
  });

  const [data, setData] = useState({
    latestProducts: [],
    bestSellers: [],
    mostViewed: [],
    topDiscounts: []
  });

  const [pagination, setPagination] = useState({
    latest: { currentPage: 1, totalPages: 1 },
    bestSellers: { currentPage: 1, totalPages: 1 },
    mostViewed: { currentPage: 1, totalPages: 1 },
    topDiscounts: { currentPage: 1, totalPages: 1 }
  });

  const [errors, setErrors] = useState({});
  const [statistics, setStatistics] = useState({
    totalProducts: 120,
    happyCustomers: 5000,
    ordersDelivered: 15000,
    yearsExperience: 25
  });

  // Animation refs - removed since scrollOptimization.js was deleted
  // const heroRef = useRef(null);
  // const featuresRef = useRef(null);
  // const statsRef = useRef(null);

  // Fetch latest products
  const fetchLatestProducts = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, latest: true }));
      const response = await productService.getLatestProducts(page, 8);
      
      // Check if response has pagination structure
      if (response.data?.pagination) {
        // New structure with pagination
        setData(prev => ({ ...prev, latestProducts: response.data.products }));
        setPagination(prev => ({
          ...prev,
          latest: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        // Old structure without pagination
        setData(prev => ({ ...prev, latestProducts: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          latest: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, latest: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, latest: error }));
    } finally {
      setLoading(prev => ({ ...prev, latest: false }));
    }
  };

  // Fetch best sellers
  const fetchBestSellers = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, bestSellers: true }));
      const response = await productService.getBestSellerProducts(page, 4);
      
      if (response.data?.pagination) {
        setData(prev => ({ ...prev, bestSellers: response.data.products }));
        setPagination(prev => ({
          ...prev,
          bestSellers: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        setData(prev => ({ ...prev, bestSellers: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          bestSellers: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, bestSellers: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, bestSellers: error }));
    } finally {
      setLoading(prev => ({ ...prev, bestSellers: false }));
    }
  };

  // Fetch most viewed
  const fetchMostViewed = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, mostViewed: true }));
      const response = await productService.getMostViewedProducts(page, 4);
      
      if (response.data?.pagination) {
        setData(prev => ({ ...prev, mostViewed: response.data.products }));
        setPagination(prev => ({
          ...prev,
          mostViewed: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        setData(prev => ({ ...prev, mostViewed: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          mostViewed: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, mostViewed: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, mostViewed: error }));
    } finally {
      setLoading(prev => ({ ...prev, mostViewed: false }));
    }
  };

  // Fetch top discounts
  const fetchTopDiscounts = async (page = 1) => {
    try {
      setLoading(prev => ({ ...prev, topDiscounts: true }));
      const response = await productService.getTopDiscountProducts(page, 4);
      
      if (response.data?.pagination) {
        setData(prev => ({ ...prev, topDiscounts: response.data.products }));
        setPagination(prev => ({
          ...prev,
          topDiscounts: {
            currentPage: response.data.pagination.currentPage,
            totalPages: response.data.pagination.totalPages
          }
        }));
      } else {
        setData(prev => ({ ...prev, topDiscounts: response.data || [] }));
        setPagination(prev => ({
          ...prev,
          topDiscounts: { currentPage: 1, totalPages: 1 }
        }));
      }
      setErrors(prev => ({ ...prev, topDiscounts: null }));
    } catch (error) {
      setErrors(prev => ({ ...prev, topDiscounts: error }));
    } finally {
      setLoading(prev => ({ ...prev, topDiscounts: false }));
    }
  };

  useEffect(() => {
    fetchLatestProducts();
    fetchBestSellers();
    fetchMostViewed();
    fetchTopDiscounts();
  }, []);

  return (
    <div className="homepage">
      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
          <div className="hero-pattern"></div>
        </div>
        <Container className="hero-content position-relative">
          <Row className="align-items-center min-vh-80">
            <Col lg={6} className="text-white">
              <div className="hero-text animate-fade-in">
                <Badge bg="warning" className="hero-badge mb-3">
                  <i className="fas fa-star me-2"></i>
                  Đặc sản chính gốc
                </Badge>
                <h1 className="hero-title display-2 fw-bold mb-4">
                  Đặc Sản <span className="text-golden-rice">Sóc Trăng</span>
                  <br />Chính Gốc
                </h1>
                <p className="hero-subtitle lead mb-4">
                  Khám phá hương vị truyền thống đậm đà từ vùng đất Sóc Trăng.
                  Những món đặc sản được chế biến theo công thức gia truyền,
                  mang đến trải nghiệm ẩm thực đích thực.
                </p>
                <div className="hero-actions">
                  <Button 
                    size="lg" 
                    className="btn-primary-brown me-3 px-4 py-3"
                    onClick={() => navigate('/products')}
                  >
                    <i className="fas fa-shopping-bag me-2"></i>
                    Khám phá ngay
                  </Button>
                  <Button 
                    variant="outline-light" 
                    size="lg" 
                    className="px-4 py-3"
                    onClick={() => navigate('/intro')}
                  >
                    <i className="fas fa-play me-2"></i>
                    Xem giới thiệu
                  </Button>
                </div>
              </div>
            </Col>
            <Col lg={6} className="d-none d-lg-block">
              <div className="hero-image-container animate-slide-in-right">
                <div className="hero-image">
                  <img 
                    src="https://images.unsplash.com/photo-1587334274328-64186a80aeee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                    alt="Đặc sản Sóc Trăng" 
                    className="img-fluid rounded-4 shadow-lg"
                  />
                  <div className="hero-image-decoration"></div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
        <div className="hero-scroll-indicator">
          <i className="fas fa-chevron-down"></i>
        </div>
      </section>

      {/* Features Highlight Section */}
      <section className="features-section py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col lg={8} className="mx-auto">
              <h2 className="section-title display-5 fw-bold text-primary-brown mb-3">
                Tại sao chọn chúng tôi?
              </h2>
              <p className="section-subtitle text-muted fs-5">
                Những giá trị cốt lõi làm nên thương hiệu đặc sản Sóc Trăng
              </p>
            </Col>
          </Row>
          <Row className="g-4">
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-certificate text-primary-brown"></i>
                  </div>
                  <Card.Title className="h5 fw-bold text-charcoal">
                    Chính gốc 100%
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Sản phẩm được sản xuất tại chính quê hương Sóc Trăng theo công thức truyền thống
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-shipping-fast text-primary-brown"></i>
                  </div>
                  <Card.Title className="h5 fw-bold text-charcoal">
                    Giao hàng nhanh
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Đóng gói cẩn thận, giao hàng tận nơi trong 24-48h để đảm bảo độ tươi ngon
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-award text-primary-brown"></i>
                  </div>
                  <Card.Title className="h5 fw-bold text-charcoal">
                    Chất lượng cao
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Được chứng nhận an toàn thực phẩm và kiểm định chất lượng nghiêm ngặt
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} lg={3}>
              <Card className="feature-card h-100 border-0 shadow-sm hover-lift">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="fas fa-heart text-primary-brown"></i>
                  </div>
                  <Card.Title className="h5 fw-bold text-charcoal">
                    Tận tâm phục vụ
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Đội ngũ tư vấn nhiệt tình, hỗ trợ khách hàng 24/7 với thái độ chuyên nghiệp
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Statistics Section */}
      <section className="stats-section py-5 bg-primary-brown text-white">
        <Container>
          <Row className="text-center">
            <Col md={6} lg={3} className="mb-4 mb-lg-0">
              <div className="stat-item">
                <div className="stat-number display-4 fw-bold text-golden-rice mb-2">
                  {statistics.totalProducts}+
                </div>
                <div className="stat-label h5 mb-0">Sản phẩm đặc sản</div>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4 mb-lg-0">
              <div className="stat-item">
                <div className="stat-number display-4 fw-bold text-golden-rice mb-2">
                  {(statistics.happyCustomers / 1000).toFixed(1)}K+
                </div>
                <div className="stat-label h5 mb-0">Khách hàng hài lòng</div>
              </div>
            </Col>
            <Col md={6} lg={3} className="mb-4 mb-md-0">
              <div className="stat-item">
                <div className="stat-number display-4 fw-bold text-golden-rice mb-2">
                  {(statistics.ordersDelivered / 1000).toFixed(0)}K+
                </div>
                <div className="stat-label h5 mb-0">Đơn hàng thành công</div>
              </div>
            </Col>
            <Col md={6} lg={3}>
              <div className="stat-item">
                <div className="stat-number display-4 fw-bold text-golden-rice mb-2">
                  {statistics.yearsExperience}+
                </div>
                <div className="stat-label h5 mb-0">Năm kinh nghiệm</div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Latest Products - 8 sản phẩm với phân trang */}
      <section className="latest-products page-section py-5">
        <Container className="container-spacing">
          <div className="text-center mb-5">
            <h2 className="section-title display-5 fw-bold text-primary-brown mb-3">
              Sản phẩm mới nhất
            </h2>
            <p className="section-subtitle text-muted fs-5 mb-4">
              Khám phá những đặc sản Sóc Trăng vừa ra mắt
            </p>
            <div className="section-divider mx-auto"></div>
          </div>
          <ProductSection 
            title=""
            subtitle=""
            products={data.latestProducts}
            loading={loading.latest}
            error={errors.latest}
            enablePagination={pagination.latest.totalPages > 1}
            currentPage={pagination.latest.currentPage}
            totalPages={pagination.latest.totalPages}
            onPageChange={fetchLatestProducts}
            itemsPerPage={8}
          />
        </Container>
      </section>

      {/* Best Sellers - 4 sản phẩm với phân trang */}
      <section className="bestsellers page-section py-5 bg-light-mist">
        <Container className="container-spacing">
          <div className="text-center mb-5">
            <h2 className="section-title display-5 fw-bold text-primary-brown mb-3">
              <i className="fas fa-crown text-golden-rice me-3"></i>
              Sản phẩm bán chạy
            </h2>
            <p className="section-subtitle text-muted fs-5 mb-4">
              Những món đặc sản được yêu thích nhất
            </p>
            <div className="section-divider mx-auto"></div>
          </div>
          <ProductSection 
            title=""
            subtitle=""
            products={data.bestSellers}
            loading={loading.bestSellers}
            error={errors.bestSellers}
            enablePagination={pagination.bestSellers.totalPages > 1}
            currentPage={pagination.bestSellers.currentPage}
            totalPages={pagination.bestSellers.totalPages}
            onPageChange={fetchBestSellers}
            itemsPerPage={4}
          />
        </Container>
      </section>

      {/* Most Viewed - 4 sản phẩm với phân trang */}
      <section className="most-viewed page-section py-5">
        <Container className="container-spacing">
          <div className="text-center mb-5">
            <h2 className="section-title display-5 fw-bold text-primary-brown mb-3">
              <i className="fas fa-eye text-golden-rice me-3"></i>
              Sản phẩm được xem nhiều
            </h2>
            <p className="section-subtitle text-muted fs-5 mb-4">
              Những sản phẩm thu hút nhiều sự quan tâm
            </p>
            <div className="section-divider mx-auto"></div>
          </div>
          <ProductSection 
            title=""
            subtitle=""
            products={data.mostViewed}
            loading={loading.mostViewed}
            error={errors.mostViewed}
            enablePagination={pagination.mostViewed.totalPages > 1}
            currentPage={pagination.mostViewed.currentPage}
            totalPages={pagination.mostViewed.totalPages}
            onPageChange={fetchMostViewed}
            itemsPerPage={4}
          />
        </Container>
      </section>

      {/* Top Discounts - 4 sản phẩm với phân trang */}
      <section className="top-discounts page-section py-5 bg-gradient-warm">
        <Container className="container-spacing">
          <div className="text-center mb-5">
            <h2 className="section-title display-5 fw-bold text-white mb-3">
              <i className="fas fa-percentage text-golden-rice me-3"></i>
              Khuyến mãi cao nhất
            </h2>
            <p className="section-subtitle text-white fs-5 mb-4 opacity-75">
              Đừng bỏ lỡ những ưu đãi hấp dẫn
            </p>
            <div className="section-divider-light mx-auto"></div>
          </div>
          <ProductSection 
            title=""
            subtitle=""
            products={data.topDiscounts}
            loading={loading.topDiscounts}
            error={errors.topDiscounts}
            enablePagination={pagination.topDiscounts.totalPages > 1}
            currentPage={pagination.topDiscounts.currentPage}
            totalPages={pagination.topDiscounts.totalPages}
            onPageChange={fetchTopDiscounts}
            itemsPerPage={4}
          />
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section py-5 text-center">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="cta-card border-0 shadow-lg bg-cream">
                <Card.Body className="p-5">
                  <div className="cta-icon mb-4">
                    <i className="fas fa-gift text-primary-brown display-4"></i>
                  </div>
                  <h3 className="cta-title display-6 fw-bold text-primary-brown mb-3">
                    Đăng ký nhận ưu đãi đặc biệt
                  </h3>
                  <p className="cta-subtitle text-muted fs-5 mb-4">
                    Nhận ngay mã giảm giá 10% cho đơn hàng đầu tiên và cập nhật những sản phẩm mới nhất
                  </p>
                  <div className="cta-actions">
                    <Button 
                      size="lg" 
                      className="btn-primary-brown px-5 py-3 me-3"
                      onClick={() => navigate('/register')}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Đăng ký ngay
                    </Button>
                    <Link to="/products" className="btn btn-secondary-brown btn-lg px-5 py-3">
                      <i className="fas fa-shopping-cart me-2"></i>
                      Mua sắm ngay
                    </Link>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default HomePage;