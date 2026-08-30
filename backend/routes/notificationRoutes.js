const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getNotifications);
router.route('/unread-count').get(protect, getUnreadCount);
router.route('/read-all').patch(protect, markAllAsRead);
router.route('/:id/read').patch(protect, markAsRead);
router.route('/:id').delete(protect, deleteNotification);

module.exports = router;
