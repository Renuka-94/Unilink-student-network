const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['coding', 'design', 'entrepreneurship', 'sports', 'literature', 'photography', 'music', 'other'],
    default: 'other'
  },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: { type: String, default: '' },
  posts: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  isPrivate: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
