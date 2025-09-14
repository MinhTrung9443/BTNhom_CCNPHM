import React from "react";
import { Container, Row, Col, Card, Button, Carousel } from "react-bootstrap";
import "../styles/intropage.css";

const IntroPage = () => {
  // Tọa độ Sóc Trăng: 9.59995, 105.972
  const socTrangCoords = "9.59995,105.972";
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(
    socTrangCoords
  )}&z=13&output=embed`;

  // Gallery ảnh
  const galleryImages = [
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Th%C3%A0nh_ph%E1%BB%91_S%C3%B3c_Tr%C4%83ng._IMG.jpg/1920px-Th%C3%A0nh_ph%E1%BB%91_S%C3%B3c_Tr%C4%83ng._IMG.jpg",
      alt: "Đường phố Sóc Trăng",
      credit: "Wikimedia Commons",
    },
    {
      src: "https://reviewvilla.vn/wp-content/uploads/2022/06/dac-san-soc-trang-1-1024x645.jpg",
      alt: "Đặc sản Sóc Trăng",
      credit: "Laodong.vn",
    },
    {
      src: "https://www.yong.vn/Content/images/travels/cho-noi-nga-nam-soc-trang.jpg",
      alt: "Chợ nổi Ngã Năm Sóc Trăng",
      credit: "Wikimedia Commons",
    },
  ];

  return (
    <Container className="mt-5 intro-page">
      {/* Hero Section */}
     {/* Hero Section */}
<Row className="mb-5 text-center">
  <Col>
    <div className="intro-hero p-5 rounded shadow-lg bg-light bg-opacity-75">
      <h1
        className="display-3 fw-bold mb-3 animate__animated animate__fadeInDown"
        style={{
          background: "linear-gradient(90deg, #ff6a00, #ee0979, #38ef7d)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          textShadow: "2px 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        🌴 Chào mừng đến với Đặc Sản Sóc Trăng
      </h1>
      <p className="lead mt-2 text-muted animate__animated animate__fadeInUp">
        Khám phá hương vị truyền thống & vẻ đẹp văn hóa đặc trưng miền Tây
      </p>
      <Button
        variant="success"
        size="lg"
        className="mt-3 shadow-sm animate__animated animate__pulse animate__infinite"
      >
        Khám phá ngay 🚀
      </Button>
    </div>
  </Col>
</Row>


      {/* About + Special Dish */}
      <Row className="align-items-center">
        <Col md={7}>
          <h2 className="mb-4 fw-bold text-primary">✨ Về Sóc Trăng</h2>
         <p className="fs-5 text-secondary">
  Sóc Trăng không chỉ là vùng đất hiền hòa miền sông nước, mà còn là nơi hội tụ biết bao tinh hoa ẩm thực độc đáo. 
  Từ những hạt gạo thơm nức lòng, trái cây ngọt lịm, đến những loại thảo mộc dân gian quý hiếm – tất cả đều mang trong mình dấu ấn của đất trời, sự chăm chút của người dân quê hiền lành, chất phác.
  <br /><br />
  Chúng tôi mong muốn mang đến cho bạn không chỉ những sản phẩm ngon – sạch – an toàn, mà còn cả tình cảm và ký ức về quê hương. 
  Mỗi sản phẩm được chọn lọc kỹ lưỡng, chế biến cẩn thận, đóng gói tinh tế để giữ trọn vẹn hương vị nguyên bản.
  <br /><br />
  Tại đây, bạn có thể khám phá:
  <br />🍵 Trà thảo mộc sấy khô, giúp thanh lọc cơ thể, dễ ngủ, an thần.
  <br />🍍 Trái cây miệt vườn được chế biến thành các món sấy giòn, sấy dẻo, giữ nguyên vị ngọt lành tự nhiên.
  <br />🌾 Gạo và đặc sản nông sản thuần khiết từ đồng ruộng màu mỡ.
  <br />🍬 Bánh kẹo đặc trưng của Sóc Trăng, kết tinh hương vị truyền thống lâu đời.
  <br /><br />
  Sứ mệnh của chúng tôi là đưa đặc sản Sóc Trăng đến gần hơn với mọi người, không chỉ ở Việt Nam mà còn vươn ra thế giới. 
  Bởi mỗi sản phẩm không chỉ là thực phẩm, mà còn là câu chuyện văn hóa, lịch sử và tình cảm quê hương gửi gắm đến bạn.
  <br /><br />
  👉 Khám phá ngay hôm nay – để cùng thưởng thức tinh hoa Sóc Trăng!
</p>

        </Col>

        <Col md={5}>
          <Card className="special-card border-0 shadow-lg rounded-4 overflow-hidden">
            <Card.Img
              variant="top"
              src="https://dacsanmientay.vn/wp-content/uploads/2021/06/banh-pia-soc-trang-min.jpg"
              alt="Bánh Pía Sóc Trăng"
              className="special-img"
            />
            <Card.Body className="text-center">
              <Card.Title className="fw-bold fs-4 text-success">
                Bánh Pía Sóc Trăng
              </Card.Title>
              <Card.Text className="text-muted">
                Một trong những đặc sản nổi tiếng nhất của Sóc Trăng, thơm ngon
                với hương vị đậm đà khó quên.
              </Card.Text>
              <Button variant="outline-success" size="sm">
                Xem thêm
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Specialties Section */}
      <Row className="mt-5">
        <Col>
          <h2 className="fw-bold text-primary mb-4">🍲 Đặc sản Sóc Trăng</h2>
          <p className="fs-5 text-secondary">
            Ẩm thực Sóc Trăng là sự kết hợp tinh tế của ba nền văn hóa{" "}
            <strong>Kinh – Khmer – Hoa</strong>. Mỗi món ăn đều mang hương vị
            đặc trưng, khiến du khách khó quên ngay từ lần đầu thưởng thức.
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Img
              variant="top"
              src="https://cdn.tgdd.vn/Files/2020/07/01/1266749/cach-nau-bun-nuoc-leo-soc-trang-ngon-dam-da-chuan-vi-an-mot-lan-la-nho-mai-202208301437543598.jpg"
              alt="Bún nước lèo Sóc Trăng"
            />
            <Card.Body>
              <Card.Title className="fw-bold text-success">
                Bún nước lèo
              </Card.Title>
              <Card.Text className="text-muted">
                Món ăn đặc trưng của người Khmer, nước lèo nấu từ mắm pro-hok,
                ăn kèm cá lóc, tôm, thịt quay và rau sống tươi ngon.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Img
              variant="top"
              src="https://hitour.vn/storage/images/upload/tour-du-lich-soc-trang-48-750x460-type-manager-upload.webp"
              alt="Lạp xưởng Sóc Trăng"
            />
            <Card.Body>
              <Card.Title className="fw-bold text-success">
                Lạp xưởng Sóc Trăng
              </Card.Title>
              <Card.Text className="text-muted">
                Lạp xưởng trứ danh, được làm từ thịt heo và mỡ chọn lọc, có vị
                ngọt tự nhiên, thường được chiên hoặc nướng.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Img
              variant="top"
              src="https://cdn.tgdd.vn/Files/2020/03/09/1240900/cach-lam-banh-cong--banh-cong-soc-trang-don-gian-tai-nha--8-760x367.jpg"
              alt="Bánh cóng"
            />
            <Card.Body>
              <Card.Title className="fw-bold text-success">Bánh cóng</Card.Title>
              <Card.Text className="text-muted">
                Bánh cóng chiên giòn rụm, nhân tôm và đậu xanh, ăn kèm rau sống
                và nước mắm chua ngọt, món ăn chơi nổi tiếng.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* More Specialties Section */}
<Row className="mt-5">
  
</Row>

<Row className="g-4">
  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://tse4.mm.bing.net/th/id/OIP.hcye0HEcH0jdzdW21GtrogHaFj?pid=Api&P=0&h=220"
        alt="Bánh ống lá dứa"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Bánh ống lá dứa</Card.Title>
        <Card.Text className="text-muted">
          Món bánh dân dã của người Khmer, hương lá dứa thơm lừng, vị ngọt thanh, mềm dẻo.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://tse2.mm.bing.net/th/id/OIP.ij0qXI6jmdZt6bCoaLDYmQHaEK?pid=Api&P=0&h=220"
        alt="Bánh in Sóc Trăng"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Bánh in Sóc Trăng</Card.Title>
        <Card.Text className="text-muted">
          Loại bánh truyền thống thường xuất hiện vào dịp lễ, tết, dẻo thơm, mang hương vị tuổi thơ.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://tse2.mm.bing.net/th/id/OIP.JdgzvtQ2De_utZY6_e1KngHaHa?pid=Api&P=0&h=220"
        alt="Khô cá lóc Sóc Trăng"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Khô cá lóc</Card.Title>
        <Card.Text className="text-muted">
          Đặc sản nức tiếng miền Tây, phơi khô dưới nắng tự nhiên, chiên hoặc nướng đều ngon.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
</Row>
<Row className="g-4 mt-4">
  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://images.baoangiang.com.vn/image/fckeditor/upload/2022/20220217/images/1-29-15582913.jpg"
        alt="Bún gỏi dà Sóc Trăng"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Bún gỏi dà</Card.Title>
        <Card.Text className="text-muted">
          Món bún độc đáo của Sóc Trăng, có vị chua thanh, ngọt dịu, ăn kèm tôm, thịt, giá và rau thơm.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://cdn.tgdd.vn/Files/2017/03/03/956748/cach-chien-banh-phong-tom-gion-ngon-khong-bi-chay-xem-202201070726264628.jpeg"
        alt="Bánh phồng tôm"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Bánh phồng tôm</Card.Title>
        <Card.Text className="text-muted">
          Giòn rụm, thơm nức mùi tôm, ăn chơi hay nhâm nhi cùng bạn bè đều rất hấp dẫn.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://cdn.tgdd.vn/Files/2021/09/30/1386766/cach-lam-mam-ba-khia-moi-la-vi-cuc-ngon-202109301142245795.jpg"
        alt="Mắm ba khía Sóc Trăng"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Mắm ba khía</Card.Title>
        <Card.Text className="text-muted">
          Đặc sản dân dã, mặn mà hương vị miền Tây, thường ăn kèm cơm nóng hoặc bún.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
</Row>

<Row className="g-4 mt-4">
  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://file.hstatic.net/200000700229/article/bun-ca-ri-ga_dc7c3608a5904d1d9e87347bbbae772d.jpg"
        alt="Bún xào cà ri Sóc Trăng"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Bún xào cà ri</Card.Title>
        <Card.Text className="text-muted">
          Món ăn mang đậm ảnh hưởng của người Khmer, vị cà ri đậm đà, hấp dẫn và giàu dinh dưỡng.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>

  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://cdn2.fptshop.com.vn/unsafe/1920x0/filters:format(webp):quality(75)/anh_bia_banh_cu_cai_hap_10d6111405.png"
        alt="Bánh củ cải"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Bánh củ cải</Card.Title>
        <Card.Text className="text-muted">
          Bánh dân dã của người Hoa Sóc Trăng, dẻo bùi từ bột củ cải, thường xuất hiện trong các dịp lễ.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
  <Col md={4}>
    <Card className="h-100 shadow-sm border-0">
      <Card.Img
        variant="top"
        src="https://mms.img.susercontent.com/vn-11134513-7r98o-lsvh8xw46x1g38@resize_ss1242x600!@crop_w1242_h600_cT"
        alt="Nem nướng Sóc Trăng"
      />
      <Card.Body>
        <Card.Title className="fw-bold text-success">Nem nướng Sóc Trăng</Card.Title>
        <Card.Text className="text-muted">
          Thơm lừng, vị chua nhẹ, ăn kèm rau sống và nước chấm đặc trưng, hấp dẫn khó quên.
        </Card.Text>
      </Card.Body>
    </Card>
  </Col>
</Row>

  

      {/* Video */}
      <Row className="mt-5">
        <Col>
          <h2 className="mb-3 fw-bold text-danger">🎥 Video giới thiệu</h2>
          <div className="ratio ratio-16x9 rounded-4 shadow-lg overflow-hidden">
            <iframe
              src="https://media-cdn-v2.laodong.vn/storage/newsportal/2024/11/16/1422297/videos/Soc-Trang.mp4"
              title="Giới thiệu Sóc Trăng"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </Col>
      </Row>

      {/* Map + Gallery */}
      <Row className="mt-5 g-4">
        <Col md={6}>
          <h3 className="mb-3">🗺️ Vị trí Sóc Trăng trên Google Maps</h3>
          <div className="map-wrapper ratio ratio-16x9 rounded shadow-sm overflow-hidden">
            <iframe
              src={mapSrc}
              title="Bản đồ Sóc Trăng"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
          <p className="mt-2 text-muted small">
            Tọa độ: {socTrangCoords} — Bạn có thể click vào bản đồ để mở Google
            Maps đầy đủ.
          </p>
        </Col>

        <Col md={6}>
          <h3 className="mb-3">📸 Đường phố & chợ</h3>
          <Carousel variant="dark">
            {galleryImages.map((img, idx) => (
              <Carousel.Item key={idx}>
                <img
                  className="d-block w-100 gallery-img"
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                />
                <Carousel.Caption className="bg-dark bg-opacity-50 rounded-2">
                  <h5>{img.alt}</h5>
                  <small>{img.credit}</small>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        </Col>
      </Row>
    </Container>
  );
};

export default IntroPage;
