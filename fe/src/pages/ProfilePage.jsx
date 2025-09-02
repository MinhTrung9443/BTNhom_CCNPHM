import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Form,
  Button,
  Spinner,
  Image,
} from "react-bootstrap";
import { toast } from "react-toastify";
import Header from "../components/common/Header";
import { useAuth } from "../contexts/AuthContext";
import userService from "../services/userService";

const ProfilePage = () => {
  const { user, token, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    avatar: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        avatar:
          user.avatar ||
          `https://ui-avatars.com/api/?name=${user.name}&background=random&size=150`,
      });
    }
  }, [user]);

  const validate = (name, value) => {
    let errorMsg = null;
    if (name === "phone") {
      if (value) {
        if (!/^[0-9]+$/.test(value)) {
          errorMsg = "Số điện thoại chỉ được chứa số.";
        } else if (value.length !== 10) {
          errorMsg = "Số điện thoại phải có đúng 10 chữ số.";
        }
      }
    }
    if (name === "name" && !value) {
      errorMsg = "Tên không được để trống.";
    }
    return errorMsg;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleIconClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("avatar", file);

      const response = await userService.uploadAvatar(formDataToSend);
      const updatedAvatar = response.data.avatarUrl;

      setFormData((prev) => ({ ...prev, avatar: updatedAvatar }));
      login({ ...user, avatar: updatedAvatar }, token);
      try {
        await userService.updateCurrentUser({ avatar: updatedAvatar });
        toast.success("Cập nhật ảnh đại diện thành công!");
      } catch (error) {
        toast.error(error.message || "Không thể cập nhật ảnh đại diện.");
      }
    } catch (error) {
      toast.error(error.message || "Không thể tải lên ảnh đại diện.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "avatar") {
        const error = validate(key, formData[key]);
        if (error) {
          formErrors[key] = error;
        }
      }
    });

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Vui lòng kiểm tra lại thông tin.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.updateCurrentUser(formData);
      const updatedUser = response.data.data.user;
      login(updatedUser, token);
      toast.success("Cập nhật thông tin thành công!");
    } catch (error) {
      const message =
        error.response?.data?.message || "Có lỗi xảy ra, không thể cập nhật.";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <p>Đang tải thông tin...</p>;
  }

  return (
    <div>
      <Header />
      <Container className="my-4">
        <Card className="p-4">
          <Card.Title as="h3" className="mb-4">
            Hồ sơ cá nhân
          </Card.Title>
          <Form noValidate onSubmit={handleSubmit}>
            <Row>
              <Col
                md={4}
                className="text-center mb-4 mb-md-0 position-relative"
              >
                <div className="position-relative d-inline-block">
                  <Image
                    src={formData.avatar}
                    roundedCircle
                    className="mb-3 img-fluid"
                    style={{
                      width: "150px",
                      height: "150px",
                      objectFit: "cover",
                    }}
                  />
                  <i
                    className="bi bi-camera-fill position-absolute"
                    onClick={handleIconClick}
                    style={{
                      bottom: "10px",
                      right: "10px",
                      background: "#fff",
                      borderRadius: "50%",
                      padding: "5px",
                      cursor: "pointer",
                      fontSize: "20px",
                      border: "1px solid #ccc",
                    }}
                  ></i>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    className="d-none"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </div>
                <h4>{user.name}</h4>
                <p className="text-muted">{user.email}</p>
              </Col>

              <Col md={8}>
                <Form.Group className="mb-3">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Chưa có thông tin"
                    isInvalid={!!errors.phone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.phone}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Địa chỉ</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Chưa có thông tin"
                  />
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  className="px-4"
                >
                  {isLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        className="me-2"
                      />
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default ProfilePage;
