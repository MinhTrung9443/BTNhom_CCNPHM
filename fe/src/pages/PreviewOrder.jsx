import React from "react";
import { Container } from "react-bootstrap";
import RecipientInfoForm from "../components/common/RecipientInfoForm";
import PaymentMethod from "../components/common/PaymentMethod";
import OrderSummary from "../components/common/OrderSummary";
import ProductCardOrder from "../components/common/ProductCardOrder";
import DeliveryOptions from "../components/common/DeliveryOptions";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import paymentService from "../services/paymentService";

const PreviewOrder = () => {
  const navigate = useNavigate();
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const orderLines = useSelector((state) => state.order.orderLines);
  const user = useSelector((state) => state.user.user);
  const [formData, setFormData] = useState({
    orderLines: orderLines,
    recipientName: user.name || "",
    phoneNumber: user.phone || "",
    shippingAddress: user.address || "",
    notes: "",
    paymentMethod: "",
    totalProductAmount: orderLines.reduce(
      (acc, item) =>
        acc + item.productPrice * (1 - item.discount / 100) * item.quantity,
      0
    ),
    deliveryId: null,
    shippingFee: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchDeliveryOptions = async () => {
      try {
        const options = await paymentService.getDeliveryOptions();
        setDeliveryOptions(options.data);
        console.log("Fetched delivery options:", options.data);
      } catch (error) {
        console.error("Error fetching delivery options:", error);
        toast.error("Lỗi khi tải tùy chọn giao hàng. Vui lòng thử lại.");
      }
    };
    fetchDeliveryOptions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async () => {
    try {
      if (!formData.paymentMethod) {
        toast.error("Vui lòng chọn phương thức thanh toán.");
        return;
      }
      if (!formData.deliveryId) {
        toast.error("Vui lòng chọn phương thức giao hàng.");
        return;
      }
      if (
        !formData.recipientName ||
        !formData.phoneNumber ||
        !formData.shippingAddress
      ) {
        toast.error("Vui lòng điền đầy đủ thông tin người nhận.");
        return;
      }

      await paymentService.createOrder(formData);
      toast.success("Đặt hàng thành công!");
      navigate("/order-success");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại.");
    }
  };
  const handleDeliveryChange = (deliveryId, shippingFee) => {
    setFormData((prev) => ({
      ...prev,
      deliveryId: deliveryId,
      shippingFee: shippingFee,
      totalAmount: prev.totalProductAmount + shippingFee,
    }));
  };

  return (
    <Container className="my-4">
      <h3>Xem lại đơn hàng</h3>
      <ProductCardOrder products={orderLines} />
      <RecipientInfoForm formData={formData} onChange={handleChange} />
      <PaymentMethod
        selected={formData.paymentMethod}
        onChange={handleChange}
      />

      <DeliveryOptions
        options={deliveryOptions}
        selected={formData.deliveryId}
        onChange={handleDeliveryChange}
      />
      <OrderSummary
        subtotal={formData.totalProductAmount}
        shippingFee={formData.shippingFee}
      />

      <button className="btn btn-primary mt-4" onClick={handleSubmit}>
        Đặt hàng
      </button>
    </Container>
  );
};

export default PreviewOrder;
