import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Form,
  Badge,
  InputGroup,
  Modal,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDeliveries,
  updateDelivery,
} from "../../redux/slices/deliveriesSlice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import Pagination from "../../components/common/Pagination";
import { toast } from "react-toastify";
import moment from "moment";

const DELIVERY_TYPES = [
  { value: "express", label: "Giao hỏa tốc" },
  { value: "standard", label: "Giao tiêu chuẩn" },
];

const DELIVERY_DESCRIPTIONS = {
  express: "Giao hàng trong vòng 24 giờ (chỉ áp dụng cho tỉnh Sóc Trăng).",
  standard: "Giao hàng trong 3-5 ngày làm việc.",
};

const DeliveriesPage = () => {
  const dispatch = useDispatch();
  const { deliveries, pagination, loading } = useSelector((state) => state.deliveries);

  const [filters, setFilters] = useState({ page: 1, limit: 10, search: "" });
  const [showModal, setShowModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [formState, setFormState] = useState({
    type: "standard",
    name: "Giao tiêu chuẩn",
    price: 0,
    description: "Giao hàng trong 3-5 ngày làm việc.",
    estimatedDays: 3,
  });

  useEffect(() => {
    dispatch(fetchDeliveries(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleOpenModal = (delivery) => {
    setSelectedDelivery(delivery);
    setFormState({
      type: delivery.type,
      name: delivery.name,
      price: delivery.price,
      description: delivery.description,
      estimatedDays: delivery.estimatedDays,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedDelivery(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "type") {
      const selectedType = DELIVERY_TYPES.find((t) => t.value === value);
      setFormState((prev) => ({
        ...prev,
        type: value,
        name: selectedType.label,
        description: DELIVERY_DESCRIPTIONS[value],
      }));
    } else {
      setFormState((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await dispatch(
        updateDelivery({
          deliveryId: selectedDelivery._id,
          deliveryData: formState,
        })
      ).unwrap();
      toast.success("Cập nhật phương thức vận chuyển thành công");
      handleCloseModal();
      dispatch(fetchDeliveries(filters));
    } catch (error) {
      toast.error(error || "Có lỗi xảy ra");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý phương thức vận chuyển</h2>
      </div>



      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Loại</th>
                    <th>Giá (VNĐ)</th>
                    <th>Mô tả</th>
                    <th>Thời gian dự kiến (ngày)</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((delivery) => (
                    <tr key={delivery._id}>
                      <td>
                        <Badge bg={delivery.type === "express" ? "danger" : "info"}>
                          {delivery.type === "express" ? "Hỏa tốc" : "Tiêu chuẩn"}
                        </Badge>
                      </td>
                      <td className="fw-semibold">{formatPrice(delivery.price)}</td>
                      <td style={{ maxWidth: "300px" }}>{delivery.description}</td>
                      <td className="text-center">{delivery.estimatedDays}</td>
                      <td>{moment(delivery.createdAt).format("DD/MM/YYYY")}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleOpenModal(delivery)}
                        >
                          <i className="bi bi-pencil me-1"></i>
                          Chỉnh sửa
                        </Button>
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
                />
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            Chỉnh sửa phương thức vận chuyển - {" "}
            <Badge bg={formState.type === "express" ? "danger" : "info"}>
              {formState.type === "express" ? "Hỏa tốc" : "Tiêu chuẩn"}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Giá (VNĐ) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="price"
                value={formState.price}
                onChange={handleFormChange}
                min="0"
                required
                placeholder="Nhập giá vận chuyển"
              />
              <Form.Text className="text-muted">
                Giá hiện tại: {formatPrice(formState.price)}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formState.description}
                onChange={handleFormChange}
                required
                placeholder="Nhập mô tả phương thức vận chuyển"
              />
              <Form.Text className="text-muted">
                Mô tả sẽ hiển thị cho khách hàng khi chọn phương thức vận chuyển
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Thời gian dự kiến (ngày) <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                name="estimatedDays"
                value={formState.estimatedDays}
                onChange={handleFormChange}
                min="1"
                max="30"
                required
                placeholder="Nhập số ngày dự kiến"
              />
              <Form.Text className="text-muted">
                Thời gian giao hàng dự kiến (từ 1-30 ngày)
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            <i className="bi bi-check-circle me-1"></i>
            Lưu thay đổi
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default DeliveriesPage;
