import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notification.service.js';
import AppError from '../utils/AppError.js';

export const getNotificationsHandler = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const recipient = 'admin'; // For admin panel

    const result = await getNotifications(recipient, parseInt(page), parseInt(limit));

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const markAsReadHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipient = 'admin';

    const notification = await markAsRead(id, recipient);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};

export const markAllAsReadHandler = async (req, res, next) => {
  try {
    const recipient = 'admin';

    const result = await markAllAsRead(recipient);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};

export const deleteNotificationHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recipient = 'admin';

    const notification = await deleteNotification(id, recipient);

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    next(new AppError(error.message, 404));
  }
};
