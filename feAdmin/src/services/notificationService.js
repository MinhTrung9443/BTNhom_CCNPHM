import api from './apiService';

export const getNotifications = async (page = 1, limit = 20) => {
  const response = await api.get('/admin/notifications', {
    params: { page, limit }
  });
  return response.data;
};

export const markAsRead = async (notificationId) => {
  const response = await api.patch(`/admin/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllAsRead = async () => {
  const response = await api.patch('/admin/notifications/mark-all-read');
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await api.delete(`/admin/notifications/${notificationId}`);
  return response.data;
};
