import api from "./apiService";

const sanitizeParams = (params = {}) => {
  const sanitized = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value === "" || value === undefined || value === null) {
      return;
    }

    sanitized[key] = value;
  });

  return sanitized;
};

const deliveryService = {
  getDeliveries: (params = {}) => {
    return api.get("/admin/deliveries", { params: sanitizeParams(params) });
  },

  createDelivery: (data) => {
    return api.post("/admin/deliveries", data);
  },

  updateDelivery: (deliveryId, data) => {
    return api.put(`/admin/deliveries/${deliveryId}`, data);
  },

  deleteDelivery: (deliveryId) => {
    return api.delete(`/admin/deliveries/${deliveryId}`);
  },
};

export default deliveryService;
