const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getConversation,
  getInbox,
  getUnreadCount,
  setTypingStatus,
  getTypingStatus,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// Send a message
router.route('/').post(protect, sendMessage);

// Get inbox (all conversations)
router.route('/inbox').get(protect, getInbox);

// Get unread count for badge
router.route('/unread-count').get(protect, getUnreadCount);

// Typing status endpoints
router.route('/typing').post(protect, setTypingStatus);
router.route('/typing-status').get(protect, getTypingStatus);

// Get conversation messages for a property + other user
router.route('/conversation/:propertyId/:otherUserId').get(protect, getConversation);

module.exports = router;
