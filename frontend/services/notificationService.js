import api from './api';

export const notificationService = {
  // Get all notifications for logged-in user
  async getNotifications() {
    return await api.get('/notifications');
  },

  // Get unread notification count
  async getUnreadCount() {
    return await api.get('/notifications/unread-count');
  },

  // Mark single notification as read
  async markAsRead(notificationId) {
    return await api.patch(`/notifications/${notificationId}/read`);
  },

  // Mark all notifications as read
  async markAllAsRead() {
    return await api.patch('/notifications/read-all');
  },

  // Delete a notification
  async deleteNotification(notificationId) {
    return await api.delete(`/notifications/${notificationId}`);
  },
};
