import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup, Modal, Tabs, Tab } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { fetchLoyaltyPoints, adjustUserPoints, fetchLoyaltyStats, expirePoints, fetchCheckinStats } from '../../redux/slices/loyaltySlice'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import { toast } from 'react-toastify'
import moment from 'moment'

const LoyaltyPointsPage = () => {
  const dispatch = useDispatch()
  const { transactions, stats, checkinStats, pagination, loading } = useSelector((state) => state.loyalty)
  const [activeTab, setActiveTab] = useState('transactions')

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    userId: '',
    type: '',
  })
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [showExpireModal, setShowExpireModal] = useState(false)
  const [expireLoading, setExpireLoading] = useState(false)

  const [adjustForm, setAdjustForm] = useState({
    userId: '',
    points: '',
    transactionType: 'bonus',
    description: '',
  })

  useEffect(() => {
    dispatch(fetchLoyaltyPoints(filters))
    dispatch(fetchLoyaltyStats())
    dispatch(fetchCheckinStats())
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

  const handleAdjustPoints = () => {
    setAdjustForm({
      userId: '',
      points: '',
      transactionType: 'bonus',
      description: '',
    })
    setShowAdjustModal(true)
  }

  const handleAdjustFormChange = (key, value) => {
    setAdjustForm(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSaveAdjustment = async () => {
    if (!adjustForm.userId || !adjustForm.points || !adjustForm.description) {
      toast.error('Vui lòng nhập đầy đủ thông tin')
      return
    }

    try {
      await dispatch(adjustUserPoints({
        userId: adjustForm.userId,
        points: parseInt(adjustForm.points),
        transactionType: adjustForm.transactionType,
        description: adjustForm.description,
        metadata: { adjustedBy: 'admin' }
      })).unwrap()
      toast.success('Điều chỉnh điểm thành công')
      setShowAdjustModal(false)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    }
  }

  const handleExpirePoints = async () => {
    setExpireLoading(true)
    try {
      const result = await dispatch(expirePoints()).unwrap()
      toast.success(`Đã hết hạn ${result.data.expiredCount} điểm`)
      setShowExpireModal(false)
      // Refresh data
      dispatch(fetchLoyaltyPoints(filters))
      dispatch(fetchLoyaltyStats())
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra')
    } finally {
      setExpireLoading(false)
    }
  }

  const getTransactionBadge = (type) => {
    const typeConfig = {
      earned: { variant: 'success', text: 'Kiếm được', icon: 'bi-plus-circle' },
      redeemed: { variant: 'danger', text: 'Đã dùng', icon: 'bi-dash-circle' },
      expired: { variant: 'secondary', text: 'Hết hạn', icon: 'bi-clock' },
      bonus: { variant: 'info', text: 'Thưởng', icon: 'bi-gift' },
      refund: { variant: 'warning', text: 'Hoàn trả', icon: 'bi-arrow-counterclockwise' },
    }
    const config = typeConfig[type] || { variant: 'secondary', text: type, icon: 'bi-question' }
    return (
      <Badge bg={config.variant} className="d-flex align-items-center">
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    )
  }

  const formatPoints = (points) => {
    return points >= 0 ? `+${points}` : points.toString()
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý điểm thưởng</h2>
        <div className="d-flex gap-2">
          <Button variant="warning" onClick={() => setShowExpireModal(true)}>
            <i className="bi bi-clock me-2"></i>
            Hết hạn điểm
          </Button>
          <Button variant="primary" onClick={handleAdjustPoints}>
            <i className="bi bi-plus-circle me-2"></i>
            Điều chỉnh điểm
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-list-check text-primary" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.totalTransactions}</h4>
                <p className="text-muted mb-0">Tổng giao dịch</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-arrow-up-circle text-success" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.totalEarned?.toLocaleString()}</h4>
                <p className="text-muted mb-0">Điểm đã tích</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-arrow-down-circle text-danger" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.totalRedeemed?.toLocaleString()}</h4>
                <p className="text-muted mb-0">Điểm đã dùng</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-wallet2 text-info" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.netPoints?.toLocaleString()}</h4>
                <p className="text-muted mb-0">Điểm còn lại</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Tabs */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        <Tab eventKey="transactions" title={<><i className="bi bi-list-ul me-2"></i>Giao dịch điểm</>}>
          {/* Filters */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body>
              <Row>
                <Col md={4}>
                  <InputGroup>
                    <InputGroup.Text>
                      <i className="bi bi-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Tìm theo User ID..."
                      value={filters.userId}
                      onChange={(e) => handleFilterChange('userId', e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                  >
                    <option value="">Tất cả loại giao dịch</option>
                    <option value="earned">Kiếm được</option>
                    <option value="redeemed">Đã sử dụng</option>
                    <option value="expired">Hết hạn</option>
                    <option value="bonus">Thưởng</option>
                    <option value="refund">Hoàn trả</option>
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

          {/* Transactions Table */}
          <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : transactions.length > 0 ? (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Người dùng</th>
                    <th>Điểm</th>
                    <th>Loại giao dịch</th>
                    <th>Mô tả</th>
                    <th>Đơn hàng</th>
                    <th>Ngày tạo</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction._id}>
                      <td>
                        <div>
                          <div className="fw-semibold">
                            {transaction.userId?.name || 'N/A'}
                          </div>
                          <small className="text-muted">
                            {transaction.userId?.email || transaction.userId}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className={`fw-bold ${transaction.points >= 0 ? 'text-success' : 'text-danger'}`}>
                          {formatPoints(transaction.points)}
                        </span>
                        {transaction.pointsValue && (
                          <div>
                            <small className="text-muted">
                              ≈ {transaction.pointsValue.toLocaleString()} VNĐ
                            </small>
                          </div>
                        )}
                      </td>
                      <td>{getTransactionBadge(transaction.transactionType)}</td>
                      <td>
                        <div>{transaction.description}</div>
                        {transaction.metadata?.adjustedBy && (
                          <small className="text-muted">
                            Điều chỉnh bởi: {transaction.metadata.adjustedBy}
                          </small>
                        )}
                      </td>
                      <td>
                        {transaction.orderId ? (
                          <a href={`/orders/${transaction.orderId._id}`} className="text-decoration-none">
                            #{transaction.orderId._id.slice(-8)}
                          </a>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <small className="text-muted">
                          {moment(transaction.createdAt).format('DD/MM/YYYY HH:mm')}
                        </small>
                      </td>
                      <td>
                        <Badge bg={transaction.isActive ? 'success' : 'secondary'}>
                          {transaction.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
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
              <i className="bi bi-star" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Chưa có giao dịch điểm nào</p>
            </div>
          )}
        </Card.Body>
      </Card>
        </Tab>
      </Tabs>

      {/* Adjust Points Modal */}
      <Modal show={showAdjustModal} onHide={() => setShowAdjustModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Điều chỉnh điểm thưởng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>User ID *</Form.Label>
              <Form.Control
                type="text"
                value={adjustForm.userId}
                onChange={(e) => handleAdjustFormChange('userId', e.target.value)}
                placeholder="Nhập User ID"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số điểm *</Form.Label>
              <Form.Control
                type="number"
                value={adjustForm.points}
                onChange={(e) => handleAdjustFormChange('points', e.target.value)}
                placeholder="Nhập số điểm (dương: thêm, âm: trừ)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Loại giao dịch *</Form.Label>
              <Form.Select
                value={adjustForm.transactionType}
                onChange={(e) => handleAdjustFormChange('transactionType', e.target.value)}
              >
                <option value="bonus">Thưởng</option>
                <option value="refund">Hoàn trả</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả *</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={adjustForm.description}
                onChange={(e) => handleAdjustFormChange('description', e.target.value)}
                placeholder="Nhập lý do điều chỉnh điểm..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdjustModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSaveAdjustment}>
            Điều chỉnh
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Expire Points Confirmation Modal */}
      <ConfirmModal
        show={showExpireModal}
        onHide={() => setShowExpireModal(false)}
        onConfirm={handleExpirePoints}
        title="Xác nhận hết hạn điểm"
        message="Bạn có chắc chắn muốn hết hạn tất cả các điểm đã quá thời gian quy định? Hành động này không thể hoàn tác."
        confirmText="Hết hạn điểm"
        variant="warning"
        loading={expireLoading}
      />
    </Container>
  )
}

export default LoyaltyPointsPage