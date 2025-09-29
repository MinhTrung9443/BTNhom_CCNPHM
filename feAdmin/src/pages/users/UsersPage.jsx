import React, { useEffect, useState } from 'react'
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup } from 'react-bootstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { fetchUsers, toggleUserStatus, fetchUserStats } from '../../redux/slices/usersSlice'
import { SkeletonCard, SkeletonUserRow } from '../../components/common/Skeleton'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import { toast } from 'react-toastify'
import moment from 'moment'

const UsersPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { users, stats, pagination, loading } = useSelector((state) => state.users)

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: 'user', // Only show customers
  })
  const [showToggleModal, setShowToggleModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [toggleLoading, setToggleLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchUsers(filters))
    dispatch(fetchUserStats())
  }, [dispatch, filters])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }))
  }

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }))
  }

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`)
  }

  const handleToggleUserStatus = (user) => {
    setSelectedUser(user)
    setShowToggleModal(true)
  }

  const confirmToggleStatus = async () => {
    if (!selectedUser) return

    setToggleLoading(true)
    try {
      await dispatch(toggleUserStatus(selectedUser._id)).unwrap()
      const action = selectedUser.isActive ? 'vô hiệu hóa' : 'kích hoạt'
      toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} tài khoản thành công`)
      setShowToggleModal(false)
      setSelectedUser(null)
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra khi thay đổi trạng thái tài khoản')
    } finally {
      setToggleLoading(false)
    }
  }

  const getRoleBadge = (role) => {
    return role === 'admin' ? (
      <Badge bg="danger">Admin</Badge>
    ) : (
      <Badge bg="primary">User</Badge>
    )
  }

  const getVerificationBadge = (isVerified) => {
    return isVerified ? (
      <Badge bg="success">
        <i className="bi bi-check-circle me-1"></i>
        Đã xác thực
      </Badge>
    ) : (
      <Badge bg="warning">
        <i className="bi bi-clock me-1"></i>
        Chưa xác thực
      </Badge>
    )
  }

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý khách hàng</h2>
      </div>

      {/* Stats Cards */}
      {stats && (
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-people text-primary" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.totalUsers}</h4>
                <p className="text-muted mb-0">Tổng người dùng</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-person-check text-success" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.regularUsers}</h4>
                <p className="text-muted mb-0">Người dùng thường</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-shield-check text-danger" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.adminUsers}</h4>
                <p className="text-muted mb-0">Quản trị viên</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <i className="bi bi-person-plus text-info" style={{ fontSize: '2rem' }}></i>
                <h4 className="fw-bold mt-2">{stats.recentUsers}</h4>
                <p className="text-muted mb-0">Mới trong 30 ngày</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={9}>
              <InputGroup>
                <InputGroup.Text>
                  <i className="bi bi-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
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

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Người dùng</th>
                  <th>Liên hệ</th>
                  <th>Trạng thái</th>
                  <th>Ngày tham gia</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: filters.limit }).map((_, index) => (
                  <SkeletonUserRow key={index} />
                ))}
              </tbody>
            </Table>
          ) : users.length > 0 ? (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Người dùng</th>
                    <th>Liên hệ</th>
                    <th>Trạng thái</th>
                    <th>Ngày tham gia</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="d-flex align-items-center">
                          <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                            <i className="bi bi-person text-primary"></i>
                          </div>
                          <div>
                            <div className="fw-semibold">{user.name}</div>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{user.phone || 'Chưa cập nhật'}</div>
                          <small className="text-muted">{user.address || 'Chưa cập nhật'}</small>
                        </div>
                      </td>
                      <td>
                        <div className="d-flex flex-column gap-1">
                          {getVerificationBadge(user.isVerified)}
                          {user.isActive ? (
                            <Badge bg="success">
                              <i className="bi bi-check-circle me-1"></i>
                              Đang hoạt động
                            </Badge>
                          ) : (
                            <Badge bg="danger">
                              <i className="bi bi-x-circle me-1"></i>
                              Đã vô hiệu hóa
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <small className="text-muted">
                          {moment(user.createdAt).format('DD/MM/YYYY')}
                        </small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleViewUser(user._id)}
                            title="Xem chi tiết"
                          >
                            <i className="bi bi-eye"></i>
                          </Button>
                          <Button
                            variant={user.isActive ? "outline-warning" : "outline-success"}
                            size="sm"
                            onClick={() => handleToggleUserStatus(user)}
                            title={user.isActive ? "Vô hiệu hóa tài khoản" : "Kích hoạt tài khoản"}
                          >
                            <i className={user.isActive ? "bi bi-lock" : "bi bi-unlock"}></i>
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
              <i className="bi bi-people" style={{ fontSize: '3rem' }}></i>
              <p className="mt-2">Không tìm thấy người dùng nào</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Toggle Status Confirmation Modal */}
      <ConfirmModal
        show={showToggleModal}
        onHide={() => setShowToggleModal(false)}
        onConfirm={confirmToggleStatus}
        title={selectedUser?.isActive ? "Xác nhận vô hiệu hóa tài khoản" : "Xác nhận kích hoạt tài khoản"}
        message={
          selectedUser?.isActive
            ? `Bạn có chắc chắn muốn vô hiệu hóa tài khoản "${selectedUser?.name}"? Người dùng sẽ không thể đăng nhập vào hệ thống.`
            : `Bạn có chắc chắn muốn kích hoạt lại tài khoản "${selectedUser?.name}"? Người dùng sẽ có thể đăng nhập trở lại.`
        }
        confirmText={selectedUser?.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
        variant={selectedUser?.isActive ? "warning" : "success"}
        loading={toggleLoading}
      />
    </Container>
  )
}

export default UsersPage