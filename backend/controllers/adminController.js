const User = require('../models/User');
const Post = require('../models/Post');
const Event = require('../models/Event');
const Group = require('../models/Group');

exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalEvents, totalGroups, reportedPosts, pendingEvents] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Post.countDocuments(),
      Event.countDocuments({ isApproved: true }),
      Group.countDocuments(),
      Post.countDocuments({ isReported: true }),
      Event.countDocuments({ isApproved: false })
    ]);
    res.json({ totalUsers, totalPosts, totalEvents, totalGroups, reportedPosts, pendingEvents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isReported: true })
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.clearPostReport = async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { isReported: false, reportReason: '' });
    res.json({ message: 'Report cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted by admin' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ isApproved: false })
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
