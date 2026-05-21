const Discussion = require('../models/Discussion');

exports.listDiscussions = async (req, res) => {
  try {
    const { collegeId, tag } = req.query;
    const filter = {};
    if (collegeId) filter.collegeId = collegeId;
    if (tag) filter.tags = tag;

    const discussions = await Discussion.find(filter)
      .populate('authorId', 'name profilePhoto role')
      .sort({ createdAt: -1 });
    res.json(discussions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;
    const discussion = await Discussion.create({
      title,
      content,
      tags,
      authorId: req.user._id,
      collegeId: req.user.collegeId || null,
    });
    await discussion.populate('authorId', 'name profilePhoto role');
    res.status(201).json(discussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id)
      .populate('authorId', 'name profilePhoto role')
      .populate('comments.authorId', 'name profilePhoto role');
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });
    res.json(discussion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    discussion.comments.push({ authorId: req.user._id, content });
    await discussion.save();
    await discussion.populate('comments.authorId', 'name profilePhoto role');
    res.status(201).json(discussion.comments[discussion.comments.length - 1]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.upvoteDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    if (!discussion) return res.status(404).json({ message: 'Discussion not found' });

    const idx = discussion.upvotes.indexOf(req.user._id);
    if (idx === -1) {
      discussion.upvotes.push(req.user._id);
    } else {
      discussion.upvotes.splice(idx, 1);
    }
    await discussion.save();
    res.json({ upvotes: discussion.upvotes.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
