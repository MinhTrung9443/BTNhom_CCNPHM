import React, { useState } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap'
import { toast } from 'react-toastify'

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    siteName: 'Đặc Sản Sóc Trăng',
    siteDescription: 'Chuyên cung cấp các đặc sản truyền thống Sóc Trăng',
    contactEmail: 'admin@dacsansoctrang.com',
    contactPhone: '0123456789',
    address: 'Sóc Trăng, Việt Nam',
    loyaltyPointsRate: '100', // 100 VND = 1 point
    loyaltyPointsExpiry: '365', // days
    orderAutoConfirmTime: '30', // minutes
    minimumOrderAmount: '50000',
    shippingFee: '30000',
    freeShippingThreshold: '500000',
  })

  const [loading, setLoading] = useState(false)

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Cài đặt đã được lưu thành công')
    } catch (error) {
      toast.error('Có lỗi xảy ra khi lưu cài đặt')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Cài đặt hệ thống</h2>
        <Button 
          variant="primary" 
          onClick={handleSaveSettings}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang lưu...
            </>
          ) : (
            <>
              <i className="bi bi-check-circle me-2"></i>
              Lưu cài đặt
            </>
          )}
        </Button>
      </div>

      <Row>
        {/* General Settings */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-gear me-2"></i>
                Cài đặt chung
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tên website</Form.Label>
                  <Form.Control
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Mô tả website</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={settings.siteDescription}
                    onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email liên hệ</Form.Label>
                  <Form.Control
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => handleSettingChange('contactEmail', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    value={settings.contactPhone}
                    onChange={(e) => handleSettingChange('contactPhone', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={settings.address}
                    onChange={(e) => handleSettingChange('address', e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Order Settings */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-cart-check me-2"></i>
                Cài đặt đơn hàng
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tự động xác nhận đơn hàng (phút)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.orderAutoConfirmTime}
                    onChange={(e) => handleSettingChange('orderAutoConfirmTime', e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Đơn hàng sẽ được tự động xác nhận sau thời gian này
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Giá trị đơn hàng tối thiểu (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.minimumOrderAmount}
                    onChange={(e) => handleSettingChange('minimumOrderAmount', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Phí vận chuyển (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.shippingFee}
                    onChange={(e) => handleSettingChange('shippingFee', e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Miễn phí vận chuyển từ (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleSettingChange('freeShippingThreshold', e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Đơn hàng từ giá trị này sẽ được miễn phí vận chuyển
                  </Form.Text>
                </Form.Group>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Loyalty Points Settings */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-star me-2"></i>
                Cài đặt điểm thưởng
              </h5>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Tỷ lệ tích điểm (VNĐ = 1 điểm)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.loyaltyPointsRate}
                    onChange={(e) => handleSettingChange('loyaltyPointsRate', e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Khách hàng sẽ nhận 1 điểm cho mỗi {settings.loyaltyPointsRate} VNĐ
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Thời hạn điểm thưởng (ngày)</Form.Label>
                  <Form.Control
                    type="number"
                    value={settings.loyaltyPointsExpiry}
                    onChange={(e) => handleSettingChange('loyaltyPointsExpiry', e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Điểm thưởng sẽ hết hạn sau số ngày này
                  </Form.Text>
                </Form.Group>

                <Alert variant="info">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Lưu ý:</strong> Thay đổi cài đặt điểm thưởng sẽ áp dụng cho các giao dịch mới.
                </Alert>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* System Info */}
        <Col md={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <h5 className="fw-bold mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Thông tin hệ thống
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <strong>Phiên bản:</strong>
                <span className="ms-2 text-muted">v1.0.0</span>
              </div>
              <div className="mb-3">
                <strong>Cập nhật lần cuối:</strong>
                <span className="ms-2 text-muted">01/01/2024</span>
              </div>
              <div className="mb-3">
                <strong>Môi trường:</strong>
                <Badge bg="success" className="ms-2">Production</Badge>
              </div>
              <div className="mb-3">
                <strong>Database:</strong>
                <span className="ms-2 text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Kết nối thành công
                </span>
              </div>
              <div className="mb-3">
                <strong>Cache:</strong>
                <span className="ms-2 text-success">
                  <i className="bi bi-check-circle me-1"></i>
                  Hoạt động bình thường
                </span>
              </div>

              <hr />

              <div className="d-grid gap-2">
                <Button variant="outline-warning" size="sm">
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Xóa cache
                </Button>
                <Button variant="outline-info" size="sm">
                  <i className="bi bi-download me-2"></i>
                  Sao lưu dữ liệu
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <i className="bi bi-file-text me-2"></i>
                  Xem log hệ thống
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default SettingsPage