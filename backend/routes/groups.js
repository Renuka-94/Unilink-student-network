const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getGroups,
  getGroupById,
  createGroup,
  joinGroup,
  leaveGroup,
  createGroupPost
} = require('../controllers/groupController');

// GET /api/groups - Get all groups
router.get('/', protect, getGroups);

// GET /api/groups/:id - Get single group
router.get('/:id', protect, getGroupById);

// POST /api/groups - Create group
router.post('/', protect, createGroup);

// PUT /api/groups/:id/join - Join group
router.put('/:id/join', protect, joinGroup);

// PUT /api/groups/:id/leave - Leave group
router.put('/:id/leave', protect, leaveGroup);

// POST /api/groups/:id/post - Post in group
router.post('/:id/post', protect, createGroupPost);

module.exports = router;
