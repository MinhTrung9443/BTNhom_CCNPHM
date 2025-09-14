import PreviewOrder from "../pages/PreviewOrder";
import apiClient from "./apiClient";

const paymentService = {
  // ĐÚNG ✅
  previewOrder: async (products) => {
    try {
      const response = await apiClient.post("/payments/preview-order", {
        products,
      });
      return response.data;
    } catch (error) {
      console.error("Error setting order lines:", error);
    }
  },
  // Create order with payment method
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post(
        `/payments/payment-${orderData.paymentMethod}`,
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Get delivery options
  getDeliveryOptions: async () => {
    try {
      const response = await apiClient.post("/payments/get-delivery");
      return response.data;
    } catch (error) {
      console.error("Error fetching delivery options:", error);
      throw error;
    }
  },
};

export default paymentService;
