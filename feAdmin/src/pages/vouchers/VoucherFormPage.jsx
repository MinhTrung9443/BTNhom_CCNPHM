import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Breadcrumb,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { toast } from "react-toastify";
import productService from "../../services/productService";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import MultiSelectWithSearch from "../../components/vouchers/MultiSelectWithSearch";
import {
  fetchVoucherDetail,
  clearVoucherDetail,
  createVoucher,
  updateVoucher,
} from "../../redux/slices/vouchersSlice";
import "./VoucherFormPage.css";

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
  source: "promotion",
  isActive: true,
  applicableProducts: [],
  excludedProducts: [],
  applicableCategories: [],
  excludedCategories: [],
};

const VoucherFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const { detail, detailLoading, detailError } = useSelector(
    (state) => state.vouchers
  );
  const { categories } = useSelector((state) => state.categories);

  const [form, setForm] = useState({ ...defaultForm });
  const [productOptions, setProductOptions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Load voucher detail nếu đang edit
  useEffect(() => {
    if (isEditing && id) {
      dispatch(fetchVoucherDetail(id));
    }
    return () => {
      dispatch(clearVoucherDetail());
    };
  }, [dispatch, id, isEditing]);

  // Load product options
  useEffect(() => {
    loadProductOptions();
  }, []);

  // Populate form khi có detail
  useEffect(() => {
    if (isEditing && detail?.voucher) {
      const voucher = detail.voucher;
      setForm({
        code: voucher.code,
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        type: voucher.type,
        globalUsageLimit:
          voucher.type === "public" ? voucher.globalUsageLimit ?? "" : "",
        userUsageLimit:
          voucher.type === "personal" ? voucher.userUsageLimit ?? 1 : 1,
        minPurchaseAmount: voucher.minPurchaseAmount ?? 0,
        maxDiscountAmount: voucher.maxDiscountAmount ?? 0,
        startDate: moment(voucher.startDate).format("YYYY-MM-DDTHH:mm"),
        endDate: moment(voucher.endDate).format("YYYY-MM-DDTHH:mm"),
        source: voucher.source,
        isActive: voucher.isActive,
        applicableProducts: normalizeIdArray(voucher.applicableProducts),
        excludedProducts: normalizeIdArray(voucher.excludedProducts),
        applicableCategories: normalizeIdArray(voucher.applicableCategories),
        excludedCategories: normalizeIdArray(voucher.excludedCategories),
      });
    }
  }, [detail, isEditing]);

  const loadProductOptions = async () => {
    setLoadingProducts(true);
    try {
      const res = await productService.getAllProducts({ limit: 1000 });
      const products =
        res.data?.data?.products ??
        res.data?.data ??
        res.data?.products ??
        [];
      setProductOptions(
        products.map((item) => ({
          value: String(item?._id ?? item?.id ?? item),
          label: item?.name ?? "",
        }))
      );
    } catch (error) {
      console.error("Failed to load product options", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoadingProducts(false);
    }
  };

  const normalizeIdArray = (items) =>
    (items || [])
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }
        if (item && typeof item === "object") {
          if (item._id) {
            return String(item._id);
          }
          if ("id" in item) {
            return String(item.id);
          }
        }
        return item != null ? String(item) : null;
      })
      .filter(Boolean);

  const handleFormChange = (key, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMultiSelectChange = (key, values) => {
    setForm((prev) => ({ ...prev, [key]: values }));
  };

  const handleSaveForm = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.code?.trim()) {
      toast.error("Vui lòng nhập mã voucher");
      return;
    }
    if (!form.discountValue || Number(form.discountValue) <= 0) {
      toast.error("Vui lòng nhập giá trị giảm giá hợp lệ");
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast.error("Vui lòng chọn thời gian hiệu lực");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      toast.error("Ngày kết thúc phải sau ngày bắt đầu");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        code: form.code?.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        type: form.type,
        minPurchaseAmount: Number(form.minPurchaseAmount),
        maxDiscountAmount: Number(form.maxDiscountAmount),
        startDate: new Date(form.startDate),
        endDate: new Date(form.endDate),
        source: form.source,
        isActive: Boolean(form.isActive),
        applicableProducts: form.applicableProducts,
        excludedProducts: form.excludedProducts,
        applicableCategories: form.applicableCategories,
        excludedCategories: form.excludedCategories,
      };

      if (form.type === "public") {
        payload.globalUsageLimit =
          form.globalUsageLimit === "" ? null : Number(form.globalUsageLimit);
      } else {
        payload.userUsageLimit = Number(form.userUsageLimit);
      }

      if (!isEditing) {
        await dispatch(createVoucher(payload)).unwrap();
        toast.success("Tạo voucher thành công");
        navigate("/vouchers");
      } else if (id) {
        // Không cho phép đổi code/type/source khi sửa
        const { code, type, source, ...updatePayload } = payload;
        await dispatch(
          updateVoucher({ voucherId: id, payload: updatePayload })
        ).unwrap();
        toast.success("Cập nhật voucher thành công");
        // Reload lại dữ liệu voucher sau khi cập nhật
        dispatch(fetchVoucherDetail(id));
      }
    } catch (errMsg) {
      toast.error(errMsg || "Không thể lưu voucher");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/vouchers");
  };

  if (detailLoading) {
    return (
      <Container fluid className="py-4">
        <LoadingSpinner centered text="Đang tải thông tin voucher..." />
      </Container>
    );
  }

  if (isEditing && detailError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Lỗi</Alert.Heading>
          <p>{detailError}</p>
          <Button variant="outline-danger" onClick={handleCancel}>
            Quay lại danh sách
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4 voucher-form-page">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-3">
        <Breadcrumb.Item onClick={handleCancel} style={{ cursor: "pointer" }}>
          Quản lý voucher
        </Breadcrumb.Item>
        <Breadcrumb.Item active>
          {isEditing ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
        </Breadcrumb.Item>
      </Breadcrumb>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">
            {isEditing ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
          </h3>
          <p className="text-muted mb-0">
            {isEditing
              ? `Cập nhật thông tin voucher ${form.code}`
              : "Điền thông tin để tạo voucher mới"}
          </p>
        </div>
        <Button variant="outline-secondary" onClick={handleCancel}>
          <i className="bi bi-arrow-left me-2"></i>
          Quay lại
        </Button>
      </div>

      <Form onSubmit={handleSaveForm}>
        <Row>
          {/* Cột trái - Thông tin cơ bản */}
          <Col lg={8}>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Thông tin cơ bản</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        M�� voucher <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={form.code}
                        onChange={(e) =>
                          handleFormChange("code", e.target.value.toUpperCase())
                        }
                        disabled={isEditing}
                        placeholder="VD: GIAM10"
                        required
                      />
                      {isEditing && (
                        <Form.Text className="text-muted">
                          Không thể thay đổi mã khi sửa
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>
                        Loại <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Select
                        value={form.type}
                        onChange={(e) =>
                          handleFormChange("type", e.target.value)
                        }
                        disabled={isEditing}
                      >
                        <option value="public">Công khai</option>
                        <option value="personal">Cá nhân</option>
                      </Form.Select>
                      {isEditing && (
                        <Form.Text className="text-muted">
                          Không thể thay đổi loại khi sửa
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label>Nguồn</Form.Label>
                      <Form.Select
                        value={form.source}
                        onChange={(e) =>
                          handleFormChange("source", e.target.value)
                        }
                        disabled
                      >
                        <option value="promotion">Promotion (Khuyến mãi)</option>
                        <option value="review">Review (Từ đánh giá)</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                      <Form.Text className="text-muted">
                        {form.source === "review" 
                          ? "Voucher từ đánh giá sản phẩm của khách hàng"
                          : "Voucher khuyến mãi do admin tạo"}
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Giảm giá</h5>
              </Card.Header>
              <Card.Body>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Loại giảm giá</Form.Label>
                      <Form.Select
                        value={form.discountType}
                        onChange={(e) =>
                          handleFormChange("discountType", e.target.value)
                        }
                      >
                        <option value="percentage">Phần trăm (%)</option>
                        <option value="fixed">Số tiền cố định (VND)</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        Giá trị giảm <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="number"
                        value={form.discountValue}
                        onChange={(e) =>
                          handleFormChange("discountValue", e.target.value)
                        }
                        placeholder={
                          form.discountType === "percentage"
                            ? "VD: 10 (cho 10%)"
                            : "VD: 10000 (cho 10.000 VND)"
                        }
                        min="0"
                        step={form.discountType === "percentage" ? "0.01" : "1"}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Đơn hàng tối thiểu (VND)</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.minPurchaseAmount}
                        onChange={(e) =>
                          handleFormChange("minPurchaseAmount", e.target.value)
                        }
                        placeholder="0"
                        min="0"
                      />
                      <Form.Text className="text-muted">
                        Giá trị đơn hàng tối thiểu để áp dụng voucher
                      </Form.Text>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Giảm giá tối đa (VND)</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.maxDiscountAmount}
                        onChange={(e) =>
                          handleFormChange("maxDiscountAmount", e.target.value)
                        }
                        placeholder="Không giới hạn"
                        min="0"
                      />
                      <Form.Text className="text-muted">
                        Áp dụng cho voucher giảm theo %
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Phạm vi áp dụng</h5>
              </Card.Header>
              <Card.Body>
                {loadingProducts ? (
                  <LoadingSpinner text="Đang tải danh sách sản phẩm..." />
                ) : (
                  <>
                    <Row className="g-3 mb-4">
                      <Col md={6}>
                        <MultiSelectWithSearch
                          label="Sản phẩm áp dụng"
                          placeholder="Tìm kiếm sản phẩm..."
                          options={productOptions}
                          selectedValues={form.applicableProducts}
                          onChange={(values) =>
                            handleMultiSelectChange("applicableProducts", values)
                          }
                          maxHeight={300}
                        />
                        <Form.Text className="text-muted">
                          Để trống nếu áp dụng cho tất cả sản phẩm
                        </Form.Text>
                      </Col>
                      <Col md={6}>
                        <MultiSelectWithSearch
                          label="Sản phẩm loại trừ"
                          placeholder="Tìm kiếm sản phẩm..."
                          options={productOptions}
                          selectedValues={form.excludedProducts}
                          onChange={(values) =>
                            handleMultiSelectChange("excludedProducts", values)
                          }
                          maxHeight={300}
                        />
                        <Form.Text className="text-muted">
                          Các sản phẩm không được áp dụng voucher
                        </Form.Text>
                      </Col>
                    </Row>
                    <Row className="g-3">
                      <Col md={6}>
                        <MultiSelectWithSearch
                          label="Danh mục áp dụng"
                          placeholder="Tìm kiếm danh mục..."
                          options={(categories || []).map((cat) => ({
                            value: cat._id,
                            label: cat.name,
                          }))}
                          selectedValues={form.applicableCategories}
                          onChange={(values) =>
                            handleMultiSelectChange(
                              "applicableCategories",
                              values
                            )
                          }
                          maxHeight={300}
                        />
                        <Form.Text className="text-muted">
                          Để trống nếu áp dụng cho tất cả danh mục
                        </Form.Text>
                      </Col>
                      <Col md={6}>
                        <MultiSelectWithSearch
                          label="Danh mục loại trừ"
                          placeholder="Tìm kiếm danh mục..."
                          options={(categories || []).map((cat) => ({
                            value: cat._id,
                            label: cat.name,
                          }))}
                          selectedValues={form.excludedCategories}
                          onChange={(values) =>
                            handleMultiSelectChange("excludedCategories", values)
                          }
                          maxHeight={300}
                        />
                        <Form.Text className="text-muted">
                          Các danh mục không được áp dụng voucher
                        </Form.Text>
                      </Col>
                    </Row>
                    <Alert variant="info" className="mt-3 mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Nếu chọn cả nhóm áp dụng và nhóm loại trừ, hệ thống sẽ ưu
                      tiên danh sách loại trừ.
                    </Alert>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Cột phải - Cài đặt */}
          <Col lg={4} className="sticky-sidebar">
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Giới hạn sử dụng</h5>
              </Card.Header>
              <Card.Body>
                {form.type === "public" ? (
                  <Form.Group className="mb-3">
                    <Form.Label>Tổng lượt sử dụng</Form.Label>
                    <Form.Control
                      type="number"
                      value={form.globalUsageLimit}
                      onChange={(e) =>
                        handleFormChange("globalUsageLimit", e.target.value)
                      }
                      placeholder="Không giới hạn"
                      min="0"
                    />
                    <Form.Text className="text-muted">
                      Tổng số lần voucher có thể được sử dụng
                    </Form.Text>
                  </Form.Group>
                ) : (
                  <Form.Group className="mb-3">
                    <Form.Label>Lượt sử dụng / người dùng</Form.Label>
                    <Form.Control
                      type="number"
                      value={form.userUsageLimit}
                      onChange={(e) =>
                        handleFormChange("userUsageLimit", e.target.value)
                      }
                      min="1"
                      disabled
                    />
                    <Form.Text className="text-muted">
                      Voucher cá nhân mặc định 1 lần/người
                    </Form.Text>
                  </Form.Group>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Thời gian hiệu lực</h5>
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Ngày bắt đầu <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={form.startDate}
                    onChange={(e) =>
                      handleFormChange("startDate", e.target.value)
                    }
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>
                    Ngày kết thúc <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={form.endDate}
                    onChange={(e) =>
                      handleFormChange("endDate", e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Trạng thái</h5>
              </Card.Header>
              <Card.Body>
                <Form.Check
                  type="switch"
                  id="voucher-is-active"
                  label="Kích hoạt voucher"
                  checked={form.isActive}
                  onChange={(e) =>
                    handleFormChange("isActive", e.target.checked)
                  }
                  disabled={form.type === "personal"}
                />
                {form.type === "personal" && (
                  <Form.Text className="text-muted d-block mt-2">
                    Voucher cá nhân luôn được kích hoạt
                  </Form.Text>
                )}
              </Card.Body>
            </Card>

            {/* Action buttons */}
            <div className="d-grid gap-2">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    {isEditing ? "Cập nhật voucher" : "Tạo voucher"}
                  </>
                )}
              </Button>
              <Button
                variant="outline-secondary"
                size="lg"
                onClick={handleCancel}
                disabled={saving}
              >
                <i className="bi bi-x-circle me-2"></i>
                Hủy bỏ
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default VoucherFormPage;
