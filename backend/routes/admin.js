const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getStats,
  getUsers,
  toggleUserStatus,
  getReportedPosts,
  clearPostReport,
  deletePost,
  getPendingEvents
} = require('../controllers/adminController');

// All admin routes require protect + adminOnly
router.use(protect, adminOnly);

// GET /api/admin/stats - Dashboard stats
router.get('/stats', getStats);

// GET /api/admin/users - Get all users
router.get('/users', getUsers);

// PUT /api/admin/users/:id/toggle - Activate/deactivate user
router.put('/users/:id/toggle', toggleUserStatus);

// GET /api/admin/reported-posts - Get reported posts
router.get('/reported-posts', getReportedPosts);

// PUT /api/admin/posts/:id/clear-report - Clear report flag
router.put('/posts/:id/clear-report', clearPostReport);

// DELETE /api/admin/posts/:id - Delete post
router.delete('/posts/:id', deletePost);

// GET /api/admin/pending-events - Get events pending approval
router.get('/pending-events', getPendingEvents);

module.exports = router;
