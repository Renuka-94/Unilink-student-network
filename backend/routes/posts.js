const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPosts,
  createPost,
  toggleLike,
  addComment,
  deletePost,
  reportPost
} = require('../controllers/postController');

// GET /api/posts - Get all posts (feed)
router.get('/', protect, getPosts);

// POST /api/posts - Create post
router.post('/', protect, createPost);

// PUT /api/posts/:id/like - Like or unlike post
router.put('/:id/like', protect, toggleLike);

// POST /api/posts/:id/comment - Add comment
router.post('/:id/comment', protect, addComment);

// DELETE /api/posts/:id - Delete post
router.delete('/:id', protect, deletePost);

// POST /api/posts/:id/report - Report post
router.post('/:id/report', protect, reportPost);

module.exports = router;
