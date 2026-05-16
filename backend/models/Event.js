const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  category: {
    type: String,
    enum: ['hackathon', 'workshop', 'seminar', 'cultural', 'sports', 'placement', 'club', 'other'],
    default: 'other'
  },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxCapacity: { type: Number, default: 100 },
  image: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
