const MentorshipRequest = require('../models/MentorshipRequest');
const Mentor = require('../models/Mentor');
const Notification = require('../models/Notification');

exports.sendRequest = async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can send mentorship requests' });
    }
    const { mentorId, message } = req.body;
    const mentor = await Mentor.findById(mentorId);
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });

    const existing = await MentorshipRequest.findOne({
      studentId: req.user._id,
      mentorId,
      status: { $in: ['pending', 'accepted'] },
    });
    if (existing) {
      const msg = existing.status === 'accepted' ? 'Already connected with this mentor' : 'Request already pending';
      return res.status(400).json({ message: msg });
    }

    const request = await MentorshipRequest.create({
      studentId: req.user._id,
      mentorId,
      message,
    });

    await Notification.create({
      userId: mentor.userId,
      type: 'mentorship',
      message: `${req.user.name} sent you a mentorship request`,
      link: '/alumni/requests',
    });

    const io = req.app.get('io');
    if (io) io.to(`user_${mentor.userId}`).emit('notification', { message: `New mentorship request from ${req.user.name}` });

    res.status(201).json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSentRequests = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find({ studentId: req.user._id })
      .populate({ path: 'mentorId', populate: { path: 'userId', select: 'name email profilePhoto' } });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getReceivedRequests = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user._id });
    if (!mentor) return res.status(404).json({ message: 'No mentor profile found' });

    const requests = await MentorshipRequest.find({ mentorId: mentor._id })
      .populate('studentId', 'name email profilePhoto bio skills');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondToRequest = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be accepted or rejected' });
    }

    const request = await MentorshipRequest.findById(req.params.requestId).populate('mentorId');
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (String(request.mentorId.userId) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    request.status = status;
    await request.save();

    const msg = status === 'accepted'
      ? `${req.user.name} accepted your mentorship request!`
      : `${req.user.name} declined your mentorship request.`;

    await Notification.create({
      userId: request.studentId,
      type: 'mentorship',
      message: msg,
      link: '/mentorship',
    });

    const io = req.app.get('io');
    if (io) io.to(`user_${request.studentId}`).emit('notification', { message: msg });

    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
