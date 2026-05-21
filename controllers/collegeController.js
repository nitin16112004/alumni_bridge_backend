const College = require('../models/College');
const User = require('../models/User');
const Notification = require('../models/Notification');

exports.getCollegeInfo = async (req, res) => {
  try {
    const college = await College.findById(req.college._id).select('-password');
    res.json(college);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.listColleges = async (req, res) => {
  try {
    const colleges = await College.find({}).select('name domain logo');
    res.json(colleges);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPendingUsers = async (req, res) => {
  try {
    const college = await College.findById(req.college._id).populate('pendingUsers', 'name email role graduationYear createdAt');
    res.json(college.pendingUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.collegeId || user.collegeId.toString() !== req.college._id.toString()) {
      return res.status(403).json({ message: 'User does not belong to your college' });
    }

    user.isApproved = true;
    await user.save();

    const arrayField = user.role === 'alumni' ? 'approvedAlumni' : 'approvedStudents';
    await College.findByIdAndUpdate(req.college._id, {
      $pull: { pendingUsers: userId },
      $addToSet: { [arrayField]: userId },
    });

    await Notification.create({
      userId,
      type: 'approval',
      message: `Your registration has been approved by ${req.college.name}!`,
      link: '/dashboard',
    });

    const io = req.app.get('io');
    if (io) io.to(`user_${userId}`).emit('notification', { message: `Approved by ${req.college.name}` });

    res.json({ message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.collegeId || user.collegeId.toString() !== req.college._id.toString()) {
      return res.status(403).json({ message: 'User does not belong to your college' });
    }

    await College.findByIdAndUpdate(req.college._id, {
      $pull: { pendingUsers: userId },
    });

    await Notification.create({
      userId,
      type: 'approval',
      message: `Your registration was not approved by ${req.college.name}.`,
      link: '/register',
    });

    const io = req.app.get('io');
    if (io) io.to(`user_${userId}`).emit('notification', { message: `Not approved by ${req.college.name}` });

    res.json({ message: 'User rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
