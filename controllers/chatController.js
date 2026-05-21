const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .populate('participants', 'name email profilePhoto role')
      .sort({ lastMessageAt: -1 });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.startConversation = async (req, res) => {
  try {
    const { participantId } = req.body;
    const existing = await Conversation.findOne({
      participants: { $all: [req.user._id, participantId] },
    });
    if (existing) return res.json(existing);

    const conv = await Conversation.create({
      participants: [req.user._id, participantId],
    });
    await conv.populate('participants', 'name email profilePhoto role');
    res.status(201).json(conv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findById(id);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const isMember = conversation.participants.some(p => String(p) === String(req.user._id));
    if (!isMember) return res.status(403).json({ message: 'Access denied' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({ conversationId: id })
      .populate('senderId', 'name profilePhoto')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { id: conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found' });

    const message = await Message.create({ conversationId, senderId: req.user._id, content });
    await message.populate('senderId', 'name profilePhoto');

    conversation.lastMessage = content;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const io = req.app.get('io');
    if (io) io.to(`conv_${conversationId}`).emit('receive-message', message);

    const otherId = conversation.participants.find(p => String(p) !== String(req.user._id));
    if (otherId) {
      await Notification.create({
        userId: otherId,
        type: 'message',
        message: `New message from ${req.user.name}`,
        link: `/chat`,
      });
      if (io) io.to(`user_${otherId}`).emit('notification', { message: `New message from ${req.user.name}` });
    }

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
