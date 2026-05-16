const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  markAllAsRead,
  markOneAsRead
} = require('../controllers/notificationController');

// GET /api/notifications - Get my notifications
router.get('/', protect, getNotifications);

// PUT /api/notifications/read-all - Mark all as read
router.put('/read-all', protect, markAllAsRead);

// PUT /api/notifications/:id/read - Mark one as read
router.put('/:id/read', protect, markOneAsRead);

module.exports = router;
