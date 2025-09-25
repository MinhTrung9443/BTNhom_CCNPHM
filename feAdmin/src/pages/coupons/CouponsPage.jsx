import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup, Modal } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCoupons, createCoupon, updateCoupon, deleteCoupon, fetchCouponStats } from '../../redux/slices/couponsSlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import { toast } from 'react-toastify'
import moment from 'moment'

const CouponsPage = () => {
  const dispatch = useDispatch()
  const { coupons, stats, pagination, loading } = useSelector((state) => state.coupons)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    status: '',
    type: '',
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [selectedCoupon, setSelectedCoupon] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [couponForm, setCouponForm] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderValue: '',
    maximumDiscountAmount: '',
    usageLimit: '',
    userUsageLimit: '1',
    startDate: '',
    endDate: '',
    isActive: true,
    isPublic: true,
  })

  useEffect(() => {
    dispatch(fetchCoupons(filters))
    dispatch(fetchCouponStats())
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleCreateCoupon = () => {
    setCouponForm({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderValue: '',
      maximumDiscountAmount: '',
      usageLimit: '',
      userUsageLimit: '1',
      startDate: '',
      endDate: '',
      isActive: true,
      isPublic: true,
    })
    setIsEditing(false)
    setShowCouponModal(true)
  }

  const handleEditCoupon = (coupon) => {
    setCouponForm({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrderValue: coupon.minimumOrderValue?.toString() || '',
      maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
      usageLimit: coupon.usageLimit?.toString() || '',
      userUsageLimit: coupon.userUsageLimit?.toString() || '1',
      startDate: moment(coupon.startDate).format('YYYY-MM-DDTHH:mm'),
      endDate: moment(coupon.endDate).format('YYYY-MM-DDTHH:mm'),
      isActive: coupon.isActive,
      isPublic: coupon.isPublic,
    })
    setSelectedCoupon(coupon)
    setIsEditing(true)
    setShowCouponModal(true)
  }

  const handleDeleteCoupon = (coupon) => {
    setSelectedCoupon(coupon)
    setShowDeleteModal(true)
  }

  const handleCouponFormChange = (key, value) => {
    setCouponForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveCoupon = async () => {
    try {
      const couponData = {
        ...couponForm,
        discountValue: parseFloat(couponForm.discountValue),
        minimumOrderValue: couponForm.minimumOrderValue ? parseFloat(couponForm.minimumOrderValue) : 0,
        maximumDiscountAmount: couponForm.maximumDiscountAmount ? parseFloat(couponForm.maximumDiscountAmount) : null,
        usageLimit: couponForm.usageLimit ? parseInt(couponForm.usageLimit) : null,
        userUsageLimit: parseInt(couponForm.userUsageLimit),
        startDate: new Date(couponForm.startDate),
        endDate: new Date(couponForm.endDate),
      }

      if (isEditing) {
        await dispatch(updateCoupon({ 
          couponId: selectedCoupon._id, 
          couponData 
        })).unwrap()
        toast.success('Cập nhật mã giảm giá thành công')
      } else {
        await dispatch(createCoupon(couponData)).unwrap()
        toast.success('Tạo mã giảm giá thành công')
      }

      setShowCouponModal(false)
      setSelectedCoupon(null)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    }
  }

  const confirmDeleteCoupon = async () => {
    if (!selectedCoupon) return

    setDeleteLoading(true)
    try {
      await dispatch(deleteCoupon(selectedCoupon._id)).unwrap()
      toast.success('Xóa mã giảm giá thành công')
      setShowDeleteModal(false)
      setSelectedCoupon(null)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi xóa mã giảm giá')
    } finally {
      setDeleteLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount)
  }

  const getStatusBadge = (coupon) => {
    const now = new Date()
    const startDate = new Date(coupon.startDate)
    const endDate = new Date(coupon.endDate)

    if (!coupon.isActive) {
      return <Badge bg="secondary">Không hoạt động</Badge>
    } else if (now < startDate) {
      return <Badge bg="warning">Chưa bắt đầu</Badge>
    } else if (now > endDate) {
      return <Badge bg="danger">Đã hết hạn</Badge>
    } else {
      return <Badge bg="success">Đang hoạt động</Badge>
    }
  }

  const getDiscountText = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`
    } else {
      return formatCurrency(coupon.discountValue)
    }
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý mã giảm giá</h2>
        <Button variant="primary" onClick={handleCreateCoupon}>
          <i className="bi bi-plus-circle me-2"></i>
          Tạo mã giảm giá
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-ticket-perforated text-primary" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.totalCoupons}</h4>
                <p className="text-muted mb-0">Tổng mã giảm giá</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-check-circle text-success" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.activeCoupons}</h4>
                <p className="text-muted mb-0">Đang hoạt động</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.expiredCoupons}</h4>
                <p className="text-muted mb-0">Đã hết hạn</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-graph-up text-info" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.totalUsage}</h4>
                <p className="text-muted mb-0">Lượt sử dụng</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="expired">Đã hết hạn</option>
                <option value="inactive">Không hoạt động</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
              >
                <option value="">Tất cả loại</option>
                <option value="percentage">Giảm theo %</option>
                <option value="fixed">Giảm cố định</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              >
                <option value={10}>10 / trang</option>
                <option value={25}>25 / trang</option>
                <option value={50}>50 / trang</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Coupons Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : coupons.length > 0 ? (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Mã giảm giá</th>
                    <th>Tên</th>
                    <th>Giảm giá</th>
                    <th>Điều kiện</th>
                    <th>Sử dụng</th>
                    <th>Thời gian</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((coupon) => (
                    <tr key={coupon._id}>
                      <td>
                        <div className="fw-bold text-primary">{coupon.code}</div>
                        <small className="text-muted">
                          {coupon.isPublic ? 'Công khai' : 'Riêng tư'}
                        </small>
                      </td>
                      <td>
                        <div className="fw-semibold">{coupon.name}</div>
                        <small className="text-muted">{coupon.description}</small>
                      </td>
                      <td>
                        <div className="fw-bold">{getDiscountText(coupon)}</div>
                        {coupon.maximumDiscountAmount && (
                          <small className="text-muted">
                            Tối đa: {formatCurrency(coupon.maximumDiscountAmount)}
                          </small>
                        )}
                      </td>
                      <td>
                        <div>Đơn tối thiểu: {formatCurrency(coupon.minimumOrderValue)}</div>
                        <small className="text-muted">
                          Mỗi user: {coupon.userUsageLimit} lần
                        </small>
                      </td>
                      <td>
                        <div>{coupon.usedCount} / {coupon.usageLimit || '∞'}</div>
                        <div className="progress" style={{ height: '4px' }}>
                          <div
                            className="progress-bar"
                            style={{
                              width: coupon.usageLimit 
                                ? `${(coupon.usedCount / coupon.usageLimit) * 100}%`
                                : '0%'
                            }}
                          ></div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <small className="text-muted">
                            {moment(coupon.startDate).format('DD/MM/YYYY')}
                          </small>
                        </div>
                        <div>
                          <small className="text-muted">
                            {moment(coupon.endDate).format('DD/MM/YYYY')}
                          </small>
                        </div>
                      </td>
                      <td>{getStatusBadge(coupon)}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditCoupon(coupon)}
                            title="Chỉnh sửa"
                          >
                            <i className="bi bi-pencil"></i>
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteCoupon(coupon)}
                            title="Xóa"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              <div className="p-3">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </div>
            </>
          ) : (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-ticket-perforated" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Chưa có mã giảm giá nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Coupon Modal */}
      <Modal show={showCouponModal} onHide={() => setShowCouponModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? 'Chỉnh sửa mã giảm giá' : 'Tạo mã giảm giá mới'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã giảm giá *</Form.Label>
                  <Form.Control
                    type="text"
                    value={couponForm.code}
                    onChange={(e) => handleCouponFormChange('code', e.target.value.toUpperCase())}
                    placeholder="VD: WELCOME10"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên mã giảm giá *</Form.Label>
                  <Form.Control
                    type="text"
                    value={couponForm.name}
                    onChange={(e) => handleCouponFormChange('name', e.target.value)}
                    placeholder="VD: Chào mừng thành viên mới"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={couponForm.description}
                onChange={(e) => handleCouponFormChange('description', e.target.value)}
                placeholder="Mô tả về mã giảm giá"
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại giảm giá *</Form.Label>
                  <Form.Select
                    value={couponForm.discountType}
                    onChange={(e) => handleCouponFormChange('discountType', e.target.value)}
                  >
                    <option value="percentage">Giảm theo phần trăm (%)</option>
                    <option value="fixed">Giảm cố định (VNĐ)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị giảm *</Form.Label>
                  <Form.Control
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) => handleCouponFormChange('discountValue', e.target.value)}
                    placeholder={couponForm.discountType === 'percentage' ? '10' : '50000'}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Đơn hàng tối thiểu (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    value={couponForm.minimumOrderValue}
                    onChange={(e) => handleCouponFormChange('minimumOrderValue', e.target.value)}
                    placeholder="0"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giảm tối đa (VNĐ)</Form.Label>
                  <Form.Control
                    type="number"
                    value={couponForm.maximumDiscountAmount}
                    onChange={(e) => handleCouponFormChange('maximumDiscountAmount', e.target.value)}
                    placeholder="Không giới hạn"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới hạn sử dụng tổng</Form.Label>
                  <Form.Control
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => handleCouponFormChange('usageLimit', e.target.value)}
                    placeholder="Không giới hạn"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giới hạn mỗi user *</Form.Label>
                  <Form.Control
                    type="number"
                    value={couponForm.userUsageLimit}
                    onChange={(e) => handleCouponFormChange('userUsageLimit', e.target.value)}
                    placeholder="1"
                    min="1"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={couponForm.startDate}
                    onChange={(e) => handleCouponFormChange('startDate', e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc *</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={couponForm.endDate}
                    onChange={(e) => handleCouponFormChange('endDate', e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Kích hoạt"
                  checked={couponForm.isActive}
                  onChange={(e) => handleCouponFormChange('isActive', e.target.checked)}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="checkbox"
                  label="Công khai"
                  checked={couponForm.isPublic}
                  onChange={(e) => handleCouponFormChange('isPublic', e.target.checked)}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCouponModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveCoupon}>
            {isEditing ? 'Cập nhật' : 'Tạo mới'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteCoupon}
        title="Xác nhận xóa mã giảm giá"
        message={`Bạn có chắc chắn muốn xóa mã giảm giá "${selectedCoupon?.code}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        variant="danger"
        loading={deleteLoading}
      />
    </Container>
  )
}

export default CouponsPage