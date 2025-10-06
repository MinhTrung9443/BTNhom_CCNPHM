import cron from 'node-cron';
import * as orderService from './order.service.js';
import * as loyaltyService from './loyaltyService.js';
import logger from '../utils/logger.js';

export const init = () => {
  scheduleOrderAutoConfirm();
  scheduleLoyaltyPointsExpiry();
  logger.info('Cron jobs đã được khởi tạo');
};

/**
 * Tự động xác nhận đơn hàng mỗi phút
 */
export const scheduleOrderAutoConfirm = () => {
  // Chạy mỗi phút
  cron.schedule('* * * * *', async () => {
      logger.info('Bắt đầu kiểm tra đơn hàng cần auto-confirm');
      const confirmedCount = await orderService.autoConfirmOrders();
      
      if (confirmedCount > 0) {
        logger.info(`Cron job: Đã tự động xác nhận ${confirmedCount} đơn hàng`);
      }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });

  logger.info('Đã lên lịch cron job auto-confirm đơn hàng (chạy mỗi phút)');
};

/**
 * Dọn dẹp log cũ (chạy hàng ngày lúc 2:00 AM)
 */
export const scheduleLogCleanup = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      logger.info('Bắt đầu dọn dẹp log cũ');
      // Thực hiện dọn dẹp log cũ hơn 30 ngày
      // Implementation depends on your logging strategy
      logger.info('Hoàn thành dọn dẹp log');
    } catch (error) {
      logger.error(`Lỗi trong cron job dọn dẹp log: ${error.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });

  logger.info('Đã lên lịch cron job dọn dẹp log (chạy hàng ngày lúc 2:00 AM)');
};

/**
 * Gửi email nhắc nhở về đơn hàng chờ xử lý (chạy mỗi 6 tiếng)
 */
export const scheduleOrderReminders = () => {
  cron.schedule('0 */6 * * *', async () => {
    try {
      logger.info('Bắt đầu kiểm tra đơn hàng cần nhắc nhở');
      // Implementation for sending reminder emails
      logger.info('Hoàn thành gửi email nhắc nhở');
    } catch (error) {
      logger.error(`Lỗi trong cron job nhắc nhở: ${error.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });

  logger.info('Đã lên lịch cron job nhắc nhở đơn hàng (chạy mỗi 6 tiếng)');
};

/**
 * Tự động xử lý xu hết hạn (chạy hàng ngày lúc 0:00 AM)
 */
export const scheduleLoyaltyPointsExpiry = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      logger.info('Bắt đầu xử lý xu hết hạn');
      const result = await loyaltyService.expireLoyaltyPoints();
      logger.info(`Đã xử lý ${result.expiredCount} giao dịch xu hết hạn`);
    } catch (error) {
      logger.error(`Lỗi trong cron job xử lý xu hết hạn: ${error.message}`);
    }
  }, {
    scheduled: true,
    timezone: "Asia/Ho_Chi_Minh"
  });

  logger.info('Đã lên lịch cron job xử lý xu hết hạn (chạy hàng ngày lúc 0:00 AM)');
};

/**
 * Dừng tất cả cron jobs
 */
export const stopAll = () => {
  cron.getTasks().forEach((task) => {
    task.stop();
  });
  logger.info('Đã dừng tất cả cron jobs');
};