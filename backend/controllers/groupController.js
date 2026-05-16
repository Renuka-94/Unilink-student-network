const Group = require('../models/Group');

exports.getGroups = async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category && category !== 'all') query.category = category;

    const groups = await Group.find(query)
      .populate('creator', 'name avatar')
      .populate('members', 'name avatar department')
      .sort({ createdAt: -1 });
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('creator', 'name avatar department')
      .populate('members', 'name avatar department year')
      .populate('posts.user', 'name avatar');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGroup = async (req, res) => {
  try {
    const { name, description, category, isPrivate } = req.body;
    if (!name || !description) {
      return res.status(400).json({ message: 'Name and description are required' });
    }

    const exists = await Group.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (exists) return res.status(400).json({ message: 'Group name already taken' });

    const group = await Group.create({
      name,
      description,
      category,
      isPrivate,
      creator: req.user._id,
      members: [req.user._id]
    });
    const populated = await group.populate('creator', 'name avatar');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.members.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already a member' });
    }

    group.members.push(req.user._id);
    await group.save();
    res.json({ message: `Joined ${group.name}!` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.leaveGroup = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    group.members = group.members.filter((member) => member.toString() !== req.user._id.toString());
    await group.save();
    res.json({ message: 'Left group' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGroupPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ message: 'Content is required' });

    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (!group.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Join the group first to post' });
    }

    group.posts.push({ user: req.user._id, content });
    await group.save();

    const updated = await Group.findById(req.params.id).populate('posts.user', 'name avatar');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
