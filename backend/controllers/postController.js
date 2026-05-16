const Post = require('../models/Post');
const Notification = require('../models/Notification');

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isReported: false })
      .populate('user', 'name avatar department year')
      .populate('comments.user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, image, tags } = req.body;
    if (!content) return res.status(400).json({ message: 'Post content is required' });

    const post = await Post.create({ user: req.user._id, content, image, tags });
    const populated = await post.populate('user', 'name avatar department year');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const liked = post.likes.includes(req.user._id);
    if (liked) {
      post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
    } else {
      post.likes.push(req.user._id);
      if (post.user.toString() !== req.user._id.toString()) {
        await Notification.create({
          recipient: post.user,
          sender: req.user._id,
          type: 'post_like',
          message: `${req.user.name} liked your post`,
          link: `/posts/${post._id}`
        });
      }
    }

    await post.save();
    res.json({ likes: post.likes.length, liked: !liked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });

    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({ user: req.user._id, text });
    await post.save();

    if (post.user.toString() !== req.user._id.toString()) {
      await Notification.create({
        recipient: post.user,
        sender: req.user._id,
        type: 'post_comment',
        message: `${req.user.name} commented on your post`,
        link: `/posts/${post._id}`
      });
    }

    const updated = await Post.findById(req.params.id)
      .populate('user', 'name avatar department')
      .populate('comments.user', 'name avatar');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    await Post.findByIdAndUpdate(req.params.id, { isReported: true, reportReason: reason });
    res.json({ message: 'Post reported. Admins will review it.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
