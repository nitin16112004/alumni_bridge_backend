const Job = require('../models/Job');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.listJobs = async (req, res) => {
  try {
    const { type, skill, collegeId } = req.query;
    const filter = { isActive: true };
    if (type) filter.type = type;
    if (collegeId) filter.collegeId = collegeId;
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name profilePhoto currentRole')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createJob = async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can post jobs' });
    }
    const { title, company, description, type, skills, applyLink } = req.body;
    const job = await Job.create({
      title,
      company,
      description,
      type,
      skills,
      applyLink,
      postedBy: req.user._id,
      collegeId: req.user.collegeId || null,
    });

    const io = req.app.get('io');
    if (io && req.user.collegeId) {
      const students = await User.find({ collegeId: req.user.collegeId, role: 'student', isApproved: true });
      for (const s of students) {
        await Notification.create({
          userId: s._id,
          type: 'job',
          message: `New ${type} opportunity: ${title} at ${company}`,
          link: '/jobs',
        });
        io.to(`user_${s._id}`).emit('notification', { message: `New ${type}: ${title} at ${company}` });
      }
    }

    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('postedBy', 'name profilePhoto currentRole currentCompany');
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, postedBy: req.user._id });
    if (!job) return res.status(404).json({ message: 'Job not found or unauthorized' });
    Object.assign(job, req.body);
    await job.save();
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    await Job.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
