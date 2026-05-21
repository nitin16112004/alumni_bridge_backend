const Mentor = require('../models/Mentor');

exports.listMentors = async (req, res) => {
  try {
    const { expertise, company, collegeId } = req.query;
    const filter = { isActive: true };

    if (collegeId) filter.collegeId = collegeId;
    if (company) filter.company = new RegExp(company, 'i');
    if (expertise) filter.expertise = { $in: [new RegExp(expertise, 'i')] };

    const mentors = await Mentor.find(filter)
      .populate('userId', 'name email profilePhoto bio skills currentRole')
      .populate('collegeId', 'name');

    res.json(mentors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .populate('userId', 'name email profilePhoto bio skills currentRole graduationYear')
      .populate('collegeId', 'name domain');
    if (!mentor) return res.status(404).json({ message: 'Mentor not found' });
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createMentor = async (req, res) => {
  try {
    if (req.user.role !== 'alumni') {
      return res.status(403).json({ message: 'Only alumni can create mentor profiles' });
    }

    const { expertise, company, role, yearsOfExperience, bio, availability } = req.body;

    // findOneAndUpdate with upsert avoids race-condition duplicate-key 500s
    const mentor = await Mentor.findOneAndUpdate(
      { userId: req.user._id },
      { userId: req.user._id, collegeId: req.user.collegeId, expertise, company, role, yearsOfExperience, bio, availability },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(mentor);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Mentor profile already exists' });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.updateMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ _id: req.params.id, userId: req.user._id });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found or unauthorized' });

    const { expertise, company, role, yearsOfExperience, bio, availability, isActive } = req.body;
    Object.assign(mentor, { expertise, company, role, yearsOfExperience, bio, availability, isActive });
    await mentor.save();
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!mentor) return res.status(404).json({ message: 'Mentor not found or unauthorized' });
    res.json({ message: 'Mentor profile deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyMentorProfile = async (req, res) => {
  try {
    const mentor = await Mentor.findOne({ userId: req.user._id });
    if (!mentor) return res.status(404).json({ message: 'No mentor profile found' });
    res.json(mentor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
