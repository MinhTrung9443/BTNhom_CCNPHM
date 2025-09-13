import apiClient from "./apiClient";

export const paymentService = {
  // Create order with payment method
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post("/payments", orderData);
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
