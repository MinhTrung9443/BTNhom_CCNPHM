import React, { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Table,
  Badge,
  Button,
  Modal,
  Alert,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import ConfirmModal from "../../components/common/ConfirmModal";
import {
  fetchVouchers,
  fetchVoucherDetail,
  deactivateVoucher,
  clearVoucherDetail,
} from "../../redux/slices/vouchersSlice";

const defaultFilters = {
  page: 1,
  limit: 10,
  type: "",
  source: "",
  isActive: "",
  userId: "",
};

const defaultForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  type: "public",
  globalUsageLimit: "",
  userUsageLimit: 1,
  minPurchaseAmount: 0,
  maxDiscountAmount: 0,
  startDate: "",
  endDate: "",
  source: "admin",
  isActive: true,
  applicableProducts: [],
  excludedProducts: [],
  applicableCategories: [],
  excludedCategories: [],
};

const VouchersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    items: vouchers,
    pagination,
    loading,
    detail,
    detailLoading,
    detailError,
    deactivatingId,
    error,
  } = useSelector((state) => state.vouchers);

  const [filters, setFilters] = useState(() => ({ ...defaultFilters }));
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [voucherPendingDeactivation, setVoucherPendingDeactivation] =
    useState(null);

  useEffect(() => {
    dispatch(fetchVouchers(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === "page" ? value : 1,
    }));
  };

  const handleLimitChange = (e) =>
    handleFilterChange("limit", Number(e.target.value) || 10);
  const handleSelectChange = (e) =>
    handleFilterChange(e.target.name, e.target.value);
  const handleInputChange = (e) =>
    handleFilterChange(e.target.name, e.target.value.trim());
  const handlePageChange = (page) => handleFilterChange("page", page);
  const handleResetFilters = () => setFilters(() => ({ ...defaultFilters }));

  const openDetailModal = (voucherId) => {
    setShowDetailModal(true);
    dispatch(fetchVoucherDetail(voucherId));
  };
  const closeDetailModal = () => {
    setShowDetailModal(false);
    dispatch(clearVoucherDetail());
  };

  const openDeactivateModal = (voucher) => {
    setVoucherPendingDeactivation(voucher);
    setShowDeactivateModal(true);
  };
  const closeDeactivateModal = () => {
    setVoucherPendingDeactivation(null);
    setShowDeactivateModal(false);
  };

  const confirmDeactivateVoucher = async () => {
    if (!voucherPendingDeactivation) return;
    try {
      const result = await dispatch(
        deactivateVoucher(voucherPendingDeactivation._id)
      ).unwrap();
      toast.success(
        result?.response?.message || "Ngừng kích hoạt voucher thành công"
      );
      closeDeactivateModal();
      dispatch(fetchVouchers(filters));
    } catch (errMsg) {
      toast.error(errMsg || "Không thể ngừng kích hoạt voucher");
    }
  };

  const totalRecordsLabel = useMemo(() => {
    if (!pagination.totalItems) return "";
    return `Tổng số voucher: ${pagination.totalItems}`;
  }, [pagination.totalItems]);

  const handleCreateVoucher = () => {
    navigate("/vouchers/create");
  };

  const handleEditVoucher = (voucherId) => {
    navigate(`/vouchers/edit/${voucherId}`);
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1">Quản lý voucher</h3>
              <p className="text-muted mb-0">
                Theo dõi tình trạng, lượt dùng và thao tác vòng đời của voucher.
              </p>
            </div>
            <div className="text-end">
              <div className="small text-muted">{totalRecordsLabel}</div>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Bộ lọc</span>
                <div>
                  <Button
                    variant="primary"
                    className="me-2"
                    onClick={handleCreateVoucher}
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Thêm voucher
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleResetFilters}
                  >
                    Xóa lọc
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col md={3} sm={6}>
                  <Form.Group controlId="voucherType">
                    <Form.Label className="small text-uppercase fw-semibold">
                      Loại
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={filters.type}
                      onChange={handleSelectChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="public">Công khai</option>
                      <option value="personal">Cá nhân</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Group controlId="voucherSource">
                    <Form.Label className="small text-uppercase fw-semibold">
                      Nguồn
                    </Form.Label>
                    <Form.Select
                      name="source"
                      value={filters.source}
                      onChange={handleSelectChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="admin">admin</option>
                      <option value="review">review</option>
                      <option value="promotion">promotion</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Group controlId="voucherStatus">
                    <Form.Label className="small text-uppercase fw-semibold">
                      Trạng thái
                    </Form.Label>
                    <Form.Select
                      name="isActive"
                      value={filters.isActive}
                      onChange={handleSelectChange}
                    >
                      <option value="">Tất cả</option>
                      <option value="true">Đang hoạt động</option>
                      <option value="false">Ngừng hoạt động</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} sm={6}>
                  <Form.Group controlId="voucherUser">
                    <Form.Label className="small text-uppercase fw-semibold">
                      User ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="userId"
                      value={filters.userId}
                      onChange={handleInputChange}
                      placeholder="Lọc voucher cá nhân theo user"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span className="fw-semibold">Danh sách voucher</span>
              <div className="text-muted small">
                Trang {pagination.currentPage} / {pagination.totalPages || 1}
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <LoadingSpinner centered text="Đang tải voucher..." />
              ) : vouchers.length === 0 ? (
                <div className="text-center py-5">
                  <p className="text-muted mb-1">Không tìm thấy voucher.</p>
                  <small className="text-muted">
                    Điều chỉnh bộ lọc hoặc thử lại sau.
                  </small>
                </div>
              ) : (
                <Table responsive hover className="mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Mã</th>
                      <th>Loại</th>
                      <th>Nguồn</th>
                      <th>Giảm giá</th>
                      <th>Hiệu lực</th>
                      <th>Trạng thái</th>
                      <th>Sử dụng</th>
                      <th className="text-end">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vouchers.map((voucher) => {
                      const remainingLabel =
                        voucher.usageStats?.remainingUses === null
                          ? "Không giới hạn"
                          : voucher.usageStats?.remainingUses ?? 0;
                      return (
                        <tr key={voucher._id}>
                          <td className="fw-semibold">{voucher.code}</td>
                          <td>
                            <Badge
                              bg={
                                voucher.type === "public" ? "info" : "secondary"
                              }
                            >
                              {voucher.type === "public"
                                ? "Công khai"
                                : "Cá nhân"}
                            </Badge>
                          </td>
                          <td className="text-capitalize">{voucher.source}</td>
                          <td>
                            {voucher.discountType === "percentage"
                              ? `${voucher.discountValue}%`
                              : `${voucher.discountValue.toLocaleString()} VND`}
                          </td>
                          <td>
                            <div className="small text-muted">
                              {moment(voucher.startDate).format("DD/MM/YYYY")} -{" "}
                              {moment(voucher.endDate).format("DD/MM/YYYY")}
                            </div>
                          </td>
                          <td>
                            <Badge bg={voucher.isActive ? "success" : "secondary"}>
                              {voucher.isActive
                                ? "Đang hoạt động"
                                : "Ngừng hoạt động"}
                            </Badge>
                          </td>
                          <td>
                            <div className="small">
                              Đã dùng: {voucher.usageStats?.totalUsed ?? 0}
                            </div>
                            <div className="small text-muted">
                              Còn lại: {remainingLabel}
                            </div>
                          </td>
                          <td className="text-end">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-2"
                              onClick={() => openDetailModal(voucher._id)}
                            >
                              Chi tiết
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              className="me-2"
                              onClick={() => handleEditVoucher(voucher._id)}
                            >
                              <i className="bi bi-pencil me-1"></i>
                              Sửa
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              disabled={
                                !voucher.isActive ||
                                voucher.type === "personal" ||
                                deactivatingId === voucher._id
                              }
                              onClick={() => openDeactivateModal(voucher)}
                            >
                              {deactivatingId === voucher._id
                                ? "Đang ngừng..."
                                : "Ngừng kích hoạt"}
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Pagination
            currentPage={filters.page}
            totalPages={pagination.totalPages || 1}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </Col>
      </Row>

      {/* Modal chi tiết */}
      <Modal show={showDetailModal} onHide={closeDetailModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <LoadingSpinner centered text="Đang tải chi tiết voucher..." />
          ) : detailError ? (
            <Alert variant="danger">{detailError}</Alert>
          ) : !detail ? (
            <Alert variant="info">Không có dữ liệu chi tiết.</Alert>
          ) : (
            <>
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6 className="text-uppercase text-muted small mb-3">
                        Thông tin chung
                      </h6>
                      <dl className="row mb-0">
                        <dt className="col-5">Mã</dt>
                        <dd className="col-7">{detail.voucher.code}</dd>
                        <dt className="col-5">Loại</dt>
                        <dd
                          className="col-7"
                          style={{ textTransform: "capitalize" }}
                        >
                          {detail.voucher.type}
                        </dd>
                        <dt className="col-5">Nguồn</dt>
                        <dd
                          className="col-7"
                          style={{ textTransform: "capitalize" }}
                        >
                          {detail.voucher.source}
                        </dd>
                        <dt className="col-5">Trạng thái</dt>
                        <dd className="col-7">
                          <Badge
                            bg={
                              detail.voucher.isActive ? "success" : "secondary"
                            }
                          >
                            {detail.voucher.isActive
                              ? "Đang hoạt động"
                              : "Ngừng hoạt động"}
                          </Badge>
                        </dd>
                      </dl>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6 className="text-uppercase text-muted small mb-3">
                        Giảm giá
                      </h6>
                      <dl className="row mb-0">
                        <dt className="col-5">Giá trị</dt>
                        <dd className="col-7">
                          {detail.voucher.discountType === "percentage"
                            ? `${detail.voucher.discountValue}%`
                            : `${detail.voucher.discountValue.toLocaleString()} VND`}
                        </dd>
                        <dt className="col-5">Đơn tối thiểu</dt>
                        <dd className="col-7">
                          {detail.voucher.minPurchaseAmount != null
                            ? `${detail.voucher.minPurchaseAmount.toLocaleString()} VND`
                            : "0 VND"}
                        </dd>
                        <dt className="col-5">Giảm tối đa</dt>
                        <dd className="col-7">
                          {detail.voucher.maxDiscountAmount != null
                            ? `${detail.voucher.maxDiscountAmount.toLocaleString()} VND`
                            : "Không giới hạn"}
                        </dd>
                        <dt className="col-5">Hiệu lực</dt>
                        <dd className="col-7">
                          {moment(detail.voucher.startDate).format(
                            "DD/MM/YYYY HH:mm"
                          )}{" "}
                          -{" "}
                          {moment(detail.voucher.endDate).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        </dd>
                      </dl>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6 className="text-uppercase text-muted small mb-3">
                        Sử dụng
                      </h6>
                      <dl className="row mb-0">
                        <dt className="col-6">Tổng đã dùng</dt>
                        <dd className="col-6">
                          {detail.usageStats.totalUsed}
                        </dd>
                        <dt className="col-6">Tổng phân bổ</dt>
                        <dd className="col-6">
                          {detail.usageStats.totalAssigned ?? "Không giới hạn"}
                        </dd>
                        <dt className="col-6">Còn lại</dt>
                        <dd className="col-6">
                          {detail.usageStats.remainingUses ?? "Không giới hạn"}
                        </dd>
                      </dl>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <h6 className="text-uppercase text-muted small mb-3">
                        Phạm vi
                      </h6>
                      <dl className="row mb-0">
                        <dt className="col-6">Sản phẩm</dt>
                        <dd className="col-6">
                          {detail.voucher.applicableProducts?.length
                            ? detail.voucher.applicableProducts.length
                            : "Tất cả"}
                        </dd>
                        <dt className="col-6">Danh mục</dt>
                        <dd className="col-6">
                          {detail.voucher.applicableCategories?.length
                            ? detail.voucher.applicableCategories.length
                            : "Tất cả"}
                        </dd>
                      </dl>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>
      </Modal>

      
      {/* Modal xác nhận ngừng kích hoạt */}
      <ConfirmModal
        show={showDeactivateModal}
        onHide={closeDeactivateModal}
        onConfirm={confirmDeactivateVoucher}
        title="Ngừng kích hoạt voucher"
        message={
          voucherPendingDeactivation
            ? `Bạn có chắc muốn ngừng kích hoạt voucher "${voucherPendingDeactivation.code}"?`
            : "Xác nhận ngừng kích hoạt voucher?"
        }
        confirmText="Ngừng kích hoạt"
        variant="danger"
        loading={
          voucherPendingDeactivation &&
          deactivatingId === voucherPendingDeactivation._id
        }
      />
    </Container>
  );
};

export default VouchersPage;