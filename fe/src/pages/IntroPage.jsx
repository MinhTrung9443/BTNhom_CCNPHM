import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Carousel, Modal, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import "../styles/intropage.css";

const IntroPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', content: '', image: '' });

  // Tọa độ Sóc Trăng: 9.59995, 105.972
  const socTrangCoords = "9.59995,105.972";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    socTrangCoords
  )}&z=13&output=embed`;

  // Gallery ảnh chuyên nghiệp
  const galleryImages = [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Th%C3%A0nh_ph%E1%BB%91_S%C3%B3c_Tr%C4%83ng._IMG.jpg/1920px-Th%C3%A0nh_ph%E1%BB%91_S%C3%B3c_Tr%C4%83ng._IMG.jpg",
      alt: "Cảnh quan đường phố Sóc Trăng hiện đại",
      caption: "Thành phố Sóc Trăng - Nơi hội tụ văn hóa ba dân tộc",
      credit: "Wikimedia Commons",
    },
    {
      src: "https://reviewvilla.vn/wp-content/uploads/2022/06/dac-san-soc-trang-1-1024x645.jpg",
      alt: "Bàn tiệc đặc sản Sóc Trăng phong phú",
      caption: "Tinh hoa ẩm thực truyền thống Sóc Trăng",
      credit: "Review Villa",
    },
    {
      src: "https://www.yong.vn/Content/images/travels/cho-noi-nga-nam-soc-trang.jpg",
      alt: "Chợ nổi Ngã Năm đặc trưng miền Tây",
      caption: "Chợ nổi Ngã Năm - Nét văn hóa sông nước độc đáo",
      credit: "Yong.vn",
    },
  ];

  // Danh mục đặc sản
  const specialtyCategories = [
    {
      title: "Bánh truyền thống",
      icon: "🥮",
      items: ["Bánh pía", "Bánh ín", "Bánh cam", "Bánh ống lá dứa"],
      description: "Những loại bánh mang đậm hương vị truyền thống, chế biến từ công thức gia truyền",
      image: "https://dacsanmientay.vn/wp-content/uploads/2021/06/banh-pia-soc-trang-min.jpg"
    },
    {
      title: "Đặc sản nước",
      icon: "🍲",
      items: ["Bún nước lèo", "Bún gỏi dà", "Bún xào cà ri"],
      description: "Những món nước đậm đà hương vị, thể hiện tinh hoa ẩm thực ba dân tộc",
      image: "https://cdn.tgdd.vn/Files/2020/07/01/1266749/cach-nau-bun-nuoc-leo-soc-trang-ngon-dam-da-chuan-vi-an-mot-lan-la-nho-mai-202208301437543598.jpg"
    },
    {
      title: "Đặc sản khô",
      icon: "🐟",
      items: ["Khô cá lóc", "Lạp xưởng", "Mắm ba khía"],
      description: "Sản phẩm được chế biến và bảo quản theo phương pháp truyền thống",
      image: "https://hitour.vn/storage/images/upload/tour-du-lich-soc-trang-48-750x460-type-manager-upload.webp"
    }
  ];

  const handleLearnMore = (category) => {
    setModalContent({
      title: category.title,
      content: category.description,
      image: category.image
    });
    setShowModal(true);
  };

  return (
    <Container fluid className="intro-page">
      {/* Hero Section - Professional Design */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100 py-5">
            <Col lg={6} className="hero-content">
              <div className="hero-badge mb-3">
                <Badge bg="warning" className="px-3 py-2 fs-6">
                  <i className="fas fa-star me-2"></i>
                  Đặc sản chính gốc Sóc Trăng
                </Badge>
              </div>
              <h1 className="hero-title display-3 fw-bold mb-4">
                Tinh Hoa
                <span className="text-primary d-block">Sóc Trăng</span>
              </h1>
              <p className="hero-subtitle lead fs-4 mb-4 text-muted">
                Khám phá vẻ đẹp văn hóa và hương vị truyền thống đặc trưng của vùng đất Sóc Trăng - 
                nơi hội tụ tinh hoa ẩm thực ba dân tộc Kinh - Khmer - Hoa.
              </p>
              <div className="hero-stats row g-3 mb-4">
                <div className="col-4 text-center">
                  <h3 className="fw-bold text-primary mb-1">50+</h3>
                  <small className="text-muted">Đặc sản truyền thống</small>
                </div>
                <div className="col-4 text-center">
                  <h3 className="fw-bold text-success mb-1">100%</h3>
                  <small className="text-muted">Chính gốc Sóc Trăng</small>
                </div>
                <div className="col-4 text-center">
                  <h3 className="fw-bold text-warning mb-1">3</h3>
                  <small className="text-muted">Nền văn hóa</small>
                </div>
              </div>
              <div className="hero-actions">
                <Button 
                  as={Link} 
                  to="/" 
                  variant="primary" 
                  size="lg" 
                  className="me-3 px-4 py-3"
                >
                  <i className="fas fa-shopping-cart me-2"></i>
                  Khám phá sản phẩm
                </Button>
                <Button 
                  variant="outline-primary" 
                  size="lg" 
                  className="px-4 py-3"
                  onClick={() => document.getElementById('about-section')?.scrollIntoView({behavior: 'smooth'})}
                >
                  <i className="fas fa-info-circle me-2"></i>
                  Tìm hiểu thêm
                </Button>
              </div>
            </Col>
            <Col lg={6} className="hero-image">
              <div className="position-relative">
                <img 
                  src="https://dacsanmientay.vn/wp-content/uploads/2021/06/banh-pia-soc-trang-min.jpg" 
                  alt="Đặc sản Sóc Trăng" 
                  className="img-fluid rounded-4 shadow-lg hero-main-image"
                  loading="lazy"
                />
                <div className="hero-floating-card">
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center">
                        <div className="me-3">
                          <i className="fas fa-award text-warning fs-3"></i>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold">Chất lượng đảm bảo</h6>
                          <small className="text-muted">Công thức gia truyền</small>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* About Section - Cultural Heritage */}
      <section id="about-section" className="about-section py-5 bg-light">
        <Container>
          <Row className="align-items-center">
            <Col lg={7}>
              <div className="about-content">
                <div className="section-header mb-4">
                  <Badge bg="primary" className="mb-3 px-3 py-2">
                    <i className="fas fa-heart me-2"></i>
                    Về chúng tôi
                  </Badge>
                  <h2 className="display-5 fw-bold mb-3">
                    Vùng Đất <span className="text-primary">Sóc Trăng</span>
                  </h2>
                  <p className="lead text-muted mb-4">
                    Nơi hội tụ tinh hoa ẩm thực và văn hóa ba dân tộc Kinh - Khmer - Hoa
                  </p>
                </div>
                
                <div className="about-description">
                  <p className="fs-5 mb-4">
                    Sóc Trăng không chỉ là vùng đất hiền hòa miền sông nước, mà còn là nơi hội tụ 
                    biết bao tinh hoa ẩm thực độc đáo. Từ những hạt gạo thơm nức lòng, trái cây ngọt lịm, 
                    đến những loại thảo mộc dân gian quý hiếm – tất cả đều mang trong mình dấu ấn của 
                    đất trời và sự chăm chút của người dân quê hiền lành, chất phác.
                  </p>
                  
                  <Row className="g-4 mb-4">
                    <Col sm={6}>
                      <div className="feature-item d-flex">
                        <div className="feature-icon me-3">
                          <i className="fas fa-leaf text-success fs-3"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-2">100% Tự Nhiên</h6>
                          <p className="text-muted mb-0">Nguyên liệu chọn lọc từ thiên nhiên</p>
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="feature-item d-flex">
                        <div className="feature-icon me-3">
                          <i className="fas fa-users text-primary fs-3"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-2">Công Thức Gia Truyền</h6>
                          <p className="text-muted mb-0">Được truyền lại qua nhiều thế hệ</p>
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="feature-item d-flex">
                        <div className="feature-icon me-3">
                          <i className="fas fa-award text-warning fs-3"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-2">Chất Lượng Đảm Bảo</h6>
                          <p className="text-muted mb-0">Kiểm định nghiêm ngặt trước khi đến tay khách hàng</p>
                        </div>
                      </div>
                    </Col>
                    <Col sm={6}>
                      <div className="feature-item d-flex">
                        <div className="feature-icon me-3">
                          <i className="fas fa-shipping-fast text-info fs-3"></i>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-2">Giao Hàng Toàn Quốc</h6>
                          <p className="text-muted mb-0">Đóng gói cẩn thận, giao hàng nhanh chóng</p>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
            
            <Col lg={5}>
              <div className="about-image-wrapper">
                <Card className="border-0 shadow-lg overflow-hidden">
                  <Card.Img
                    variant="top"
                    src="https://dacsanmientay.vn/wp-content/uploads/2021/06/banh-pia-soc-trang-min.jpg"
                    alt="Bánh Pía Sóc Trăng đặc trưng"
                    className="about-featured-image"
                  />
                  <Card.Body className="text-center p-4">
                    <Card.Title className="fw-bold fs-4 text-primary mb-2">
                      Bánh Pía Sóc Trăng
                    </Card.Title>
                    <Card.Text className="text-muted mb-3">
                      Biểu tượng văn hóa ẩm thực Sóc Trăng với hương vị đậm đà, 
                      được yêu thích khắp cả nước.
                    </Card.Text>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      as={Link}
                      to="/products?category=pia-dau-xanh"
                    >
                      <i className="fas fa-eye me-2"></i>
                      Xem sản phẩm
                    </Button>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Specialty Categories Overview */}
      <section className="specialty-categories py-5">
        <Container>
          <div className="text-center mb-5">
            <Badge bg="warning" className="mb-3 px-3 py-2">
              <i className="fas fa-utensils me-2"></i>
              Danh mục đặc sản
            </Badge>
            <h2 className="display-5 fw-bold mb-3">
              Tinh Hoa <span className="text-primary">Ẩm Thực</span>
            </h2>
            <p className="lead text-muted col-lg-8 mx-auto">
              Ẩm thực Sóc Trăng là sự kết hợp tinh tế của ba nền văn hóa Kinh – Khmer – Hoa. 
              Mỗi món ăn đều mang hương vị đặc trưng, khiến du khách khó quên.
            </p>
          </div>
          
          <Row className="g-4">
            {specialtyCategories.map((category, index) => (
              <Col lg={4} key={index}>
                <Card className="specialty-category-card h-100 border-0 shadow-sm">
                  <div className="category-image-wrapper position-relative overflow-hidden">
                    <Card.Img
                      variant="top"
                      src={category.image}
                      alt={category.title}
                      className="category-image"
                    />
                    <div className="category-overlay">
                      <div className="category-icon">
                        <span className="fs-1">{category.icon}</span>
                      </div>
                    </div>
                  </div>
                  
                  <Card.Body className="p-4">
                    <Card.Title className="fw-bold mb-3 text-center">
                      {category.title}
                    </Card.Title>
                    <Card.Text className="text-muted mb-3">
                      {category.description}
                    </Card.Text>
                    
                    <div className="specialty-items mb-3">
                      {category.items.map((item, idx) => (
                        <Badge 
                          key={idx} 
                          bg="light" 
                          text="dark" 
                          className="me-2 mb-2 px-2 py-1"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleLearnMore(category)}
                      >
                        <i className="fas fa-info-circle me-2"></i>
                        Tìm hiểu thêm
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Interactive Gallery & Map Section */}
      <section className="gallery-map-section py-5 bg-light">
        <Container>
          <Row className="g-5">
            <Col lg={6}>
              <div className="section-header mb-4">
                <Badge bg="info" className="mb-3 px-3 py-2">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Vị trí địa lý
                </Badge>
                <h3 className="fw-bold mb-3">
                  🗺️ Sóc Trăng trên Google Maps
                </h3>
              </div>
              <div className="map-wrapper ratio ratio-16x9 rounded shadow-sm overflow-hidden">
                <iframe
                  src={mapSrc}
                  title="Bản đồ Sóc Trăng"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
              <p className="mt-3 text-muted small">
                <i className="fas fa-location-dot me-2"></i>
                Tọa độ: {socTrangCoords} — Click vào bản đồ để mở Google Maps đầy đủ.
              </p>
            </Col>

            <Col lg={6}>
              <div className="section-header mb-4">
                <Badge bg="success" className="mb-3 px-3 py-2">
                  <i className="fas fa-images me-2"></i>
                  Thư viện ảnh
                </Badge>
                <h3 className="fw-bold mb-3">
                  📸 Văn hóa & Đường phố
                </h3>
              </div>
              <Carousel variant="dark" className="gallery-carousel">
                {galleryImages.map((img, idx) => (
                  <Carousel.Item key={idx}>
                    <img
                      className="d-block w-100 gallery-img"
                      src={img.src}
                      alt={img.alt}
                      loading="lazy"
                    />
                    <Carousel.Caption className="bg-dark bg-opacity-75 rounded-3 p-3">
                      <h5 className="text-white mb-2">{img.caption}</h5>
                      <small className="text-light">
                        <i className="fas fa-camera me-1"></i>
                        {img.credit}
                      </small>
                    </Carousel.Caption>
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Call to Action Section */}
      <section className="cta-section py-5">
        <Container>
          <div className="text-center">
            <h2 className="display-6 fw-bold mb-3">
              Sẵn sàng khám phá <span className="text-primary">Đặc sản Sóc Trăng</span>?
            </h2>
            <p className="lead text-muted mb-4 col-lg-8 mx-auto">
              Đừng bỏ lỡ cơ hội thưởng thức những món ngon đặc trưng từ vùng đất Sóc Trăng. 
              Đặt hàng ngay hôm nay để cảm nhận hương vị truyền thống!
            </p>
            <div className="cta-actions">
              <Button 
                as={Link} 
                to="/" 
                variant="primary" 
                size="lg" 
                className="me-3 px-5 py-3"
              >
                <i className="fas fa-shopping-bag me-2"></i>
                Mua sắm ngay
              </Button>
              <Button 
                as={Link} 
                to="/products" 
                variant="outline-primary" 
                size="lg" 
                className="px-5 py-3"
              >
                <i className="fas fa-list me-2"></i>
                Xem tất cả sản phẩm
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Modal for category details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{modalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            <div className="col-md-5">
              <img 
                src={modalContent.image} 
                alt={modalContent.title} 
                className="img-fluid rounded"
              />
            </div>
            <div className="col-md-7">
              <p className="lead">{modalContent.content}</p>
              <p className="text-muted">
                Khám phá thêm những sản phẩm tuyệt vời trong danh mục này trên trang sản phẩm của chúng tôi.
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
          <Button variant="primary" as={Link} to="/" onClick={() => setShowModal(false)}>
            Xem sản phẩm
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IntroPage;