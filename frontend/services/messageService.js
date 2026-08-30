import api from './api';

export const messageService = {
  // Send a message in a property conversation
  async sendMessage(receiverId, propertyId, text) {
    return await api.post('/messages', { receiverId, propertyId, text });
  },

  // Get all messages in a conversation (property + other user)
  async getConversation(propertyId, otherUserId) {
    return await api.get(`/messages/conversation/${propertyId}/${otherUserId}`);
  },

  // Get all conversations (inbox)
  async getInbox() {
    return await api.get('/messages/inbox');
  },

  // Get unread message count
  async getUnreadCount() {
    return await api.get('/messages/unread-count');
  },
};
