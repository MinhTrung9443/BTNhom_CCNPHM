import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./src/models/Order.js";
import logger from "./src/utils/logger.js";

dotenv.config();

// Hàm helper để tạo orderCode ngẫu nhiên
function generateOrderCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'ORDER_';
    for (let i = 0; i < 9; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

async function updateOrderCodes() {
    try {
        // Kết nối database
        await mongoose.connect(process.env.MONGODB_URI);
        logger.info("Đã kết nối MongoDB");

        // Tìm tất cả các order chưa có orderCode
        const ordersWithoutCode = await Order.find({
            $or: [
                { orderCode: { $exists: false } },
                { orderCode: null },
                { orderCode: "" }
            ]
        });

        logger.info(`Tìm thấy ${ordersWithoutCode.length} đơn hàng cần cập nhật orderCode`);

        let updatedCount = 0;
        const existingCodes = new Set();

        for (const order of ordersWithoutCode) {
            let orderCode;
            let isUnique = false;

            // Thử tạo orderCode unique
            for (let attempt = 0; attempt < 10; attempt++) {
                orderCode = generateOrderCode();

                // Kiểm tra trong DB và trong set đã tạo
                const existingOrder = await Order.findOne({ orderCode }).lean();
                if (!existingOrder && !existingCodes.has(orderCode)) {
                    isUnique = true;
                    existingCodes.add(orderCode);
                    break;
                }
            }

            if (!isUnique) {
                logger.error(`Không thể tạo orderCode unique cho order ${order._id}`);
                continue;
            }

            // Cập nhật orderCode
            order.orderCode = orderCode;
            await order.save();

            updatedCount++;
            logger.info(`Đã cập nhật orderCode ${orderCode} cho order ${order._id}`);
        }

        logger.info(`Hoàn thành! Đã cập nhật ${updatedCount}/${ordersWithoutCode.length} đơn hàng`);

        // Đóng kết nối
        await mongoose.connection.close();
        logger.info("Đã đóng kết nối MongoDB");

    } catch (error) {
        logger.error("Lỗi khi cập nhật orderCode:", error);
        process.exit(1);
    }
}

// Chạy script
updateOrderCodes();
