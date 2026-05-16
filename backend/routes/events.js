const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getEvents,
  createEvent,
  registerForEvent,
  unregisterFromEvent,
  approveEvent,
  deleteEvent
} = require('../controllers/eventController');

// GET /api/events - Get all approved events
router.get('/', protect, getEvents);

// POST /api/events - Create event
router.post('/', protect, createEvent);

// PUT /api/events/:id/register - Register for event
router.put('/:id/register', protect, registerForEvent);

// PUT /api/events/:id/unregister - Unregister from event
router.put('/:id/unregister', protect, unregisterFromEvent);

// PUT /api/events/:id/approve - Admin: approve event
router.put('/:id/approve', protect, adminOnly, approveEvent);

// DELETE /api/events/:id - Delete event
router.delete('/:id', protect, deleteEvent);

module.exports = router;
