import React from "react";
import { Container } from "react-bootstrap";
import RecipientInfoForm from "../components/common/RecipientInfoForm";
import PaymentMethod from "../components/common/PaymentMethod";
import OrderSummary from "../components/common/OrderSummary";
import ProductCardOrder from "../components/common/ProductCardOrder";
import { useState } from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import paymentService from "../services/paymentService";

const PreviewOrder = () => {
  const navigate = useNavigate();
  const orderLines = useSelector((state) => state.order.orderLines);
  const [formData, setFormData] = useState({
    orderLines: orderLines,
    recipientName: "",
    phoneNumber: "",
    shippingAddress: "",
    notes: "",
    paymentMethod: "",
    totalAmount: 0,
    deliveryId: null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async () => {
    try {
      await paymentService.createOrder(formData);
      toast.success("Đặt hàng thành công!");
      navigate("/order-success");
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Đặt hàng thất bại. Vui lòng thử lại.");
    }
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
      <OrderSummary subtotal={cart.subtotal} shippingFee={shippingFee} />
      <button className="btn btn-primary mt-4" onClick={handleSubmit}>
        Đặt hàng
      </button>
    </Container>
  );
};

export default PreviewOrder;
