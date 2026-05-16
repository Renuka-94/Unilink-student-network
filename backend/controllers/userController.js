const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getUsers = async (req, res) => {
  try {
    const { search, department } = req.query;
    const query = { _id: { $ne: req.user._id }, role: 'student', isActive: true };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    if (department) query.department = { $regex: department, $options: 'i' };

    const users = await User.find(query).select('-password -connectionRequests').limit(50);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('connections', 'name avatar department year');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, department, year, skills, interests, bio, achievements, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, department, year, skills, interests, bio, achievements, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendConnectionRequest = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot connect with yourself' });
    }

    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found' });

    const alreadyConnected = targetUser.connections.includes(req.user._id);
    if (alreadyConnected) return res.status(400).json({ message: 'Already connected' });

    const alreadyRequested = targetUser.connectionRequests.find(
      (request) => request.from.toString() === req.user._id.toString() && request.status === 'pending'
    );
    if (alreadyRequested) return res.status(400).json({ message: 'Request already sent' });

    targetUser.connectionRequests.push({ from: req.user._id, status: 'pending' });
    await targetUser.save();

    await Notification.create({
      recipient: targetUser._id,
      sender: req.user._id,
      type: 'connection_request',
      message: `${req.user.name} sent you a connection request`,
      link: `/profile/${req.user._id}`
    });

    res.json({ message: 'Connection request sent!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondToConnectionRequest = async (req, res) => {
  try {
    const { action } = req.body;
    const currentUser = await User.findById(req.user._id);
    const reqIndex = currentUser.connectionRequests.findIndex(
      (request) => request.from.toString() === req.params.id
    );
    if (reqIndex === -1) return res.status(404).json({ message: 'Request not found' });

    if (action === 'accept') {
      currentUser.connectionRequests[reqIndex].status = 'accepted';
      currentUser.connections.push(req.params.id);
      await currentUser.save();

      await User.findByIdAndUpdate(req.params.id, {
        $push: { connections: req.user._id }
      });

      await Notification.create({
        recipient: req.params.id,
        sender: req.user._id,
        type: 'connection_accepted',
        message: `${req.user.name} accepted your connection request`,
        link: `/profile/${req.user._id}`
      });
      return res.json({ message: 'Connection accepted!' });
    }

    currentUser.connectionRequests[reqIndex].status = 'rejected';
    await currentUser.save();
    res.json({ message: 'Connection rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getConnectionRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('connectionRequests.from', 'name avatar department year');
    const pending = user.connectionRequests.filter((request) => request.status === 'pending');
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
