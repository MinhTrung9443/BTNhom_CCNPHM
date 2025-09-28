import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, Badge, InputGroup, Modal, Spinner } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, createCategory, updateCategory, deleteCategory } from '../../redux/slices/categoriesSlice';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import { toast } from 'react-toastify';
import moment from 'moment';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, pagination, loading } = useSelector((state) => state.categories);

  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '' });
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formState, setFormState] = useState({ name: '', description: '', isActive: true });

  useEffect(() => {
    dispatch(fetchCategories(filters));
  }, [dispatch, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setIsEditing(true);
      setSelectedCategory(category);
      setFormState({ name: category.name, description: category.description, isActive: category.isActive });
    } else {
      setIsEditing(false);
      setSelectedCategory(null);
      setFormState({ name: '', description: '', isActive: true });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (isEditing) {
        await dispatch(updateCategory({ categoryId: selectedCategory._id, categoryData: formState })).unwrap();
        toast.success('Cập nhật danh mục thành công');
      } else {
        await dispatch(createCategory(formState)).unwrap();
        toast.success('Tạo danh mục thành công');
      }
      handleCloseModal();
      dispatch(fetchCategories(filters));
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra');
    }
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteCategory(selectedCategory._id)).unwrap();
      toast.success('Xóa danh mục thành công');
      setShowDeleteModal(false);
      dispatch(fetchCategories(filters));
    } catch (error) {
      toast.error(error || 'Có lỗi xảy ra');
    }
  };

  return (
    <Container fluid>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Quản lý danh mục</h2>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          <i className="bi bi-plus-circle me-2"></i>
          Thêm danh mục
        </Button>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <Form.Control
                  type="text"
                  placeholder="Tìm kiếm danh mục..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </InputGroup>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              <Table responsive className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id}>
                      <td className="fw-semibold">{cat.name}</td>
                      <td>{cat.description?.substring(0, 80) || '...'}</td>
                      <td>
                        <Badge bg={cat.isActive ? 'success' : 'secondary'}>
                          {cat.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </td>
                      <td>{moment(cat.createdAt).format('DD/MM/YYYY')}</td>
                      <td>
                        <Button variant="outline-primary" size="sm" onClick={() => handleOpenModal(cat)} className="me-2">
                          <i className="bi bi-pencil"></i>
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(cat)}>
                          <i className="bi bi-trash"></i>
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

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control type="text" name="name" value={formState.name} onChange={handleFormChange} required />
            </Form.Group>
            <Form.Group>
              <Form.Label>Mô tả</Form.Label>
              <Form.Control as="textarea" rows={3} name="description" value={formState.description} onChange={handleFormChange} />
            </Form.Group>
            <Form.Group className="mt-3">
              <Form.Check
                type="switch"
                id="category-is-active"
                label="Hoạt động"
                name="isActive"
                checked={formState.isActive}
                onChange={handleFormChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Hủy</Button>
          <Button variant="primary" onClick={handleSubmit}>Lưu</Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc muốn xóa danh mục "${selectedCategory?.name}"?`}
      />
    </Container>
  );
};

export default CategoriesPage;