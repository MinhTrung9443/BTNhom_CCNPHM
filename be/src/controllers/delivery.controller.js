import { deliveryService } from "../services/delivery.service.js";

export const deliveryController = {
  async getDeliveries(req, res, next) {
    try {
      const result = await deliveryService.getDeliveries(req.query);
      res.status(200).json({
        success: true,
        message: "Lấy danh sách phương thức vận chuyển thành công",
        meta: result.meta,
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  },

  async createDelivery(req, res, next) {
    try {
      const data = await deliveryService.createDelivery(req.body);
      res.status(201).json({
        success: true,
        message: "Tạo phương thức vận chuyển thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateDelivery(req, res, next) {
    try {
      const { id } = req.params;
      const data = await deliveryService.updateDelivery(id, req.body);
      res.status(200).json({
        success: true,
        message: "Cập nhật phương thức vận chuyển thành công",
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteDelivery(req, res, next) {
    try {
      const { id } = req.params;
      const result = await deliveryService.deleteDelivery(id);
      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  },
};
