import { Delivery } from "../models/index.js";
import { NotFoundError, BadRequestError } from "../utils/AppError.js";

export const deliveryService = {
  async getDeliveries(queryParams) {
    const { page = 1, limit = 10, search } = queryParams;
    const skip = (page - 1) * limit;

    const filter = {};
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { type: { $regex: search, $options: "i" } },
      ];
    }

    const [deliveries, total] = await Promise.all([
      Delivery.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Delivery.countDocuments(filter),
    ]);

    return {
      meta: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalDeliveries: total,
      },
      data: deliveries,
    };
  },

  async createDelivery(deliveryData) {
    // Kiểm tra xem type đã tồn tại chưa
    const existingDelivery = await Delivery.findOne({ type: deliveryData.type });
    if (existingDelivery) {
      throw new BadRequestError(`Phương thức vận chuyển với loại "${deliveryData.type}" đã tồn tại`);
    }

    const delivery = new Delivery(deliveryData);
    await delivery.save();
    return delivery;
  },

  async updateDelivery(deliveryId, updateData) {
    // Không cho phép thay đổi type và name
    const allowedFields = ['price', 'description', 'estimatedDays'];
    const filteredData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    });

    const delivery = await Delivery.findByIdAndUpdate(
      deliveryId,
      filteredData,
      { new: true, runValidators: true }
    );

    if (!delivery) {
      throw new NotFoundError("Không tìm thấy phương thức vận chuyển");
    }

    return delivery;
  },

  async deleteDelivery(deliveryId) {
    const delivery = await Delivery.findByIdAndDelete(deliveryId);
    
    if (!delivery) {
      throw new NotFoundError("Không tìm thấy phương thức vận chuyển");
    }

    return { message: "Xóa phương thức vận chuyển thành công" };
  },
};
