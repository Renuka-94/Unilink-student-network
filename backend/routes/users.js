const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getUsers,
  getUserById,
  updateProfile,
  sendConnectionRequest,
  respondToConnectionRequest,
  getConnectionRequests
} = require('../controllers/userController');

// GET /api/users - Get all users (for search/explore)
router.get('/', protect, getUsers);

// GET /api/users/:id - Get user profile
router.get('/:id', protect, getUserById);

// PUT /api/users/profile - Update own profile
router.put('/profile', protect, updateProfile);

// POST /api/users/:id/connect - Send connection request
router.post('/:id/connect', protect, sendConnectionRequest);

// PUT /api/users/:id/respond - Accept or reject connection request
router.put('/:id/respond', protect, respondToConnectionRequest);

// GET /api/users/me/requests - Get my pending connection requests
router.get('/me/requests', protect, getConnectionRequests);

module.exports = router;
