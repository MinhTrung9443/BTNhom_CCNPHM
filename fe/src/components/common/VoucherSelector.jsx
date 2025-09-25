import React, { useState, useEffect } from "react";
import { 
  Card, 
  Button, 
  Alert, 
  Badge, 
  Modal, 
  Row, 
  Col, 
  Form,
  InputGroup,
  Spinner 
} from "react-bootstrap";
import { toast } from "react-toastify";

/**
 * Individual voucher card component
 * @param {{voucher: object, isSelected: boolean, onSelect: function, isEligible: boolean, orderTotal: number}} props
 */
const VoucherCard = ({ 
  voucher, 
  isSelected = false, 
  onSelect, 
  isEligible = true, 
  orderTotal = 0 
}) => {
  const getVoucherIcon = (type) => {
    switch (type) {
      case 'percentage':
        return 'fas fa-percentage';
      case 'fixed':
        return 'fas fa-tag';
      default:
        return 'fas fa-gift';
    }
  };

  const getDiscountText = () => {
    if (voucher.discountType === 'percentage') {
      const maxDiscount = voucher.maxDiscountAmount 
        ? ` (tối đa ₫${voucher.maxDiscountAmount.toLocaleString()})`
        : '';
      return `${voucher.discountValue}%${maxDiscount}`;
    }
    return `₫${voucher.discountValue.toLocaleString()}`;
  };

  const calculateDiscount = () => {
    if (!isEligible) return 0;
    
    if (voucher.discountType === 'percentage') {
      const discount = orderTotal * (voucher.discountValue / 100);
      return voucher.maxDiscountAmount 
        ? Math.min(discount, voucher.maxDiscountAmount)
        : discount;
    }
    return voucher.discountValue;
  };

  const discount = calculateDiscount();

  return (
    <Card 
      className={`mb-3 cursor-pointer border-2 transition-all ${
        isSelected 
          ? 'border-primary bg-primary bg-opacity-10' 
          : isEligible 
            ? 'border-light hover-border-primary' 
            : 'border-secondary bg-light'
      } ${!isEligible ? 'opacity-75' : ''}`}
      onClick={() => isEligible && onSelect(voucher)}
      style={{ cursor: isEligible ? 'pointer' : 'not-allowed' }}
    >
      <Card.Body className="p-3">
        <Row className="align-items-center">
          <Col xs={2} className="text-center">
            <i 
              className={`${getVoucherIcon(voucher.discountType)} fa-2x ${
                isEligible ? (isSelected ? 'text-primary' : 'text-success') : 'text-muted'
              }`}
            ></i>
          </Col>
          
          <Col xs={8}>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="mb-0">{voucher.code}</h6>
              <Badge bg={voucher.type === 'private' ? 'warning' : 'info'} className="small">
                {voucher.type === 'private' ? 'Cá nhân' : 'Công khai'}
              </Badge>
              {!isEligible && (
                <Badge bg="secondary" className="small">Không đủ điều kiện</Badge>
              )}
            </div>
            
            <div className="mb-1">
              <strong className="text-success">Giảm {getDiscountText()}</strong>
            </div>
            
            <small className="text-muted d-block mb-1">
              Đơn tối thiểu: ₫{voucher.minPurchaseAmount.toLocaleString()}
            </small>
            
            {isEligible && discount > 0 && (
              <small className="text-primary">
                <i className="fas fa-calculator me-1"></i>
                Tiết kiệm: ₫{discount.toLocaleString()}
              </small>
            )}
            
            {!isEligible && (
              <small className="text-danger">
                <i className="fas fa-exclamation-triangle me-1"></i>
                {voucher.reason}
              </small>
            )}
          </Col>
          
          <Col xs={2} className="text-end">
            <div 
              className={`border rounded-circle d-flex align-items-center justify-content-center mx-auto ${
                isSelected 
                  ? 'border-primary bg-primary' 
                  : 'border-secondary'
              }`}
              style={{ width: '20px', height: '20px' }}
            >
              {isSelected && (
                <i className="fas fa-check text-white" style={{ fontSize: '10px' }}></i>
              )}
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

/**
 * Voucher selection modal component
 * @param {{show: boolean, onHide: function, vouchers: array, onVoucherSelect: function, currentOrderTotal: number}} props
 */
const VoucherModal = ({ 
  show = false, 
  onHide, 
  vouchers = [], 
  onVoucherSelect, 
  currentOrderTotal = 0 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [applyingManual, setApplyingManual] = useState(false);

  // Filter vouchers based on search term
  const filteredVouchers = vouchers.filter(voucher => 
    voucher.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Separate eligible and ineligible vouchers based on the API's response
  const eligibleVouchers = filteredVouchers.filter(voucher => voucher.isApplicable);
  const ineligibleVouchers = filteredVouchers.filter(voucher => !voucher.isApplicable);

  /**
   * Handle manual voucher code application
   */
  const handleManualApply = async () => {
    if (!manualCode.trim()) {
      toast.warning('Vui lòng nhập mã voucher');
      return;
    }

    setApplyingManual(true);
    
    try {
      // Check if code exists in user's vouchers first
      const existingVoucher = vouchers.find(v => 
        v.code.toLowerCase() === manualCode.toLowerCase()
      );
      
      if (existingVoucher) {
        if (currentOrderTotal >= existingVoucher.minPurchaseAmount) {
          onVoucherSelect(existingVoucher);
          setManualCode('');
          onHide();
          toast.success('Áp dụng voucher thành công!');
        } else {
          toast.error(`Cần đơn hàng tối thiểu ₫${existingVoucher.minPurchaseAmount.toLocaleString()}`);
        }
      } else {
        // Here you could call an API to validate the manual code
        toast.error('Mã voucher không hợp lệ hoặc đã hết hạn');
      }
    } catch (error) {
      console.error('Error applying manual voucher:', error);
      toast.error('Có lỗi xảy ra khi áp dụng voucher');
    } finally {
      setApplyingManual(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-tags me-2"></i>
          Chọn voucher giảm giá
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {/* Manual Code Input */}
        <Card className="mb-4 border-primary">
          <Card.Body>
            <h6 className="mb-3">
              <i className="fas fa-keyboard me-2"></i>
              Nhập mã voucher
            </h6>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Nhập mã voucher của bạn"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && handleManualApply()}
              />
              <Button 
                variant="primary" 
                onClick={handleManualApply}
                disabled={applyingManual || !manualCode.trim()}
              >
                {applyingManual ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  'Áp dụng'
                )}
              </Button>
            </InputGroup>
          </Card.Body>
        </Card>

        {/* Search */}
        <div className="mb-3">
          <Form.Control
            type="text"
            placeholder="Tìm kiếm voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Voucher Lists */}
        {vouchers.length === 0 ? (
          <Alert variant="info" className="text-center">
            <i className="fas fa-info-circle me-2"></i>
            Bạn chưa có voucher nào khả dụng
          </Alert>
        ) : (
          <>
            {/* Eligible Vouchers */}
            {eligibleVouchers.length > 0 && (
              <div className="mb-4">
                <h6 className="text-success mb-3">
                  <i className="fas fa-check-circle me-2"></i>
                  Có thể sử dụng ({eligibleVouchers.length})
                </h6>
                {eligibleVouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher._id}
                    voucher={voucher}
                    isSelected={false}
                    onSelect={onVoucherSelect}
                    isEligible={true}
                    orderTotal={currentOrderTotal}
                  />
                ))}
              </div>
            )}

            {/* Ineligible Vouchers */}
            {ineligibleVouchers.length > 0 && (
              <div>
                <h6 className="text-muted mb-3">
                  <i className="fas fa-lock me-2"></i>
                  Chưa đủ điều kiện ({ineligibleVouchers.length})
                </h6>
                {ineligibleVouchers.map((voucher) => (
                  <div key={voucher._id}>
                    <VoucherCard
                      voucher={voucher}
                      isSelected={false}
                      onSelect={() => {}}
                      isEligible={false}
                      orderTotal={currentOrderTotal}
                    />

                  </div>
                ))}
              </div>
            )}

            {filteredVouchers.length === 0 && searchTerm && (
              <Alert variant="warning" className="text-center">
                <i className="fas fa-search me-2"></i>
                Không tìm thấy voucher nào phù hợp với "<strong>{searchTerm}</strong>"
              </Alert>
            )}
          </>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

/**
 * Main voucher selector component
 * @param {{selectedVoucher: object, onVoucherSelect: function, userVouchers: array, isLoading: boolean}} props
 */
const VoucherSelector = ({
  selectedVoucher,
  onSelectVoucher,
  onClearVoucher,
  userVouchers = [],
  isLoading = false,
  error = null,
  currentOrderTotal = 0
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleSelect = (voucher) => {
    if(onSelectVoucher) onSelectVoucher(voucher);
    setShowModal(false);
  };
  
  const handleClear = () => {
    if(onClearVoucher) onClearVoucher();
  };

  const handleOpenModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-light d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Mã giảm giá</h5>
          {userVouchers.length > 0 && (
            <Badge bg="success" pill>
              {userVouchers.filter(v => v.isApplicable).length} khả dụng
            </Badge>
          )}
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-3">
              <Alert.Heading>Lỗi tải voucher</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          )}
          
          {isLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted mb-0">Đang tải voucher...</p>
            </div>
          ) : selectedVoucher ? (
            <Alert variant="success" className="mb-0">
              <Row className="align-items-center">
                <Col>
                  <i className="fas fa-check-circle me-2"></i>
                  <strong>Đã áp dụng:</strong> {selectedVoucher.code}
                  <br />
                  <small>
                    Giảm: {selectedVoucher.discountType === 'percentage'
                      ? `${selectedVoucher.discountValue}%`
                      : `₫${selectedVoucher.discountValue.toLocaleString()}`
                    }
                  </small>
                </Col>
                <Col xs="auto">
                  <Button
                    variant="outline-success"
                    size="sm"
                    onClick={handleOpenModal}
                    className="me-2"
                  >
                    Đổi voucher
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleClear}
                  >
                    Bỏ áp dụng
                  </Button>
                </Col>
              </Row>
            </Alert>
          ) : (
            <div className="text-center">
              <i className="fas fa-tags fa-3x text-muted mb-3"></i>
              <p className="text-muted mb-3">
                {userVouchers.length === 0
                  ? 'Bạn chưa có voucher nào khả dụng'
                  : 'Chọn voucher để nhận ưu đãi'
                }
              </p>
              <Button
                variant="primary"
                onClick={handleOpenModal}
                disabled={userVouchers.length === 0}
              >
                <i className="fas fa-search me-2"></i>
                Chọn voucher
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Voucher Selection Modal */}
      <VoucherModal
        show={showModal}
        onHide={handleCloseModal}
        vouchers={userVouchers}
        onVoucherSelect={handleSelect}
        currentOrderTotal={currentOrderTotal}
      />
    </>
  );
};

export { VoucherCard, VoucherModal };
export default VoucherSelector;