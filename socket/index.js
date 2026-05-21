const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication error'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = String(decoded.id);
      socket.entityType = decoded.entityType || 'user';
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    socket.join(`user_${socket.userId}`);

    socket.on('join-conversation', (conversationId) => {
      socket.join(`conv_${conversationId}`);
    });

    socket.on('leave-conversation', (conversationId) => {
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send-message', async ({ conversationId, content }) => {
      try {
        const message = await Message.create({
          conversationId,
          senderId: socket.userId,
          content,
        });
        await message.populate('senderId', 'name profilePhoto');

        const conversation = await Conversation.findByIdAndUpdate(
          conversationId,
          { lastMessage: content, lastMessageAt: new Date() },
          { new: true }
        );

        io.to(`conv_${conversationId}`).emit('receive-message', message);

        // Push notification to every other participant
        const senderName = message.senderId?.name || 'Someone';
        conversation.participants.forEach((participantId) => {
          if (String(participantId) !== socket.userId) {
            io.to(`user_${participantId}`).emit('notification', {
              type: 'message',
              message: `${senderName}: ${content.length > 50 ? content.slice(0, 50) + '…' : content}`,
              conversationId,
            });
          }
        });
      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    socket.on('typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('typing', { userId: socket.userId });
    });

    socket.on('stop-typing', ({ conversationId }) => {
      socket.to(`conv_${conversationId}`).emit('stop-typing', { userId: socket.userId });
    });

    socket.on('mark-read', async ({ conversationId }) => {
      await Message.updateMany(
        { conversationId, readBy: { $nin: [socket.userId] } },
        { $addToSet: { readBy: socket.userId } }
      );
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
      io.emit('user-status', { userId: socket.userId, online: false });
    });
  });
};

module.exports = initSocket;
