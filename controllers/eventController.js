const Event = require('../models/Event');
const Notification = require('../models/Notification');
const User = require('../models/User');

exports.listEvents = async (req, res) => {
  try {
    const { collegeId } = req.query;
    const filter = {};
    if (collegeId) filter.collegeId = collegeId;

    const events = await Event.find(filter)
      .populate('organizer', 'name profilePhoto')
      .sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const event = await Event.create({
      title,
      description,
      date,
      location,
      organizer: req.user._id,
      collegeId: req.user.collegeId || null,
    });

    const io = req.app.get('io');
    if (io && req.user.collegeId) {
      const members = await User.find({ collegeId: req.user.collegeId, isApproved: true });
      for (const m of members) {
        await Notification.create({
          userId: m._id,
          type: 'event',
          message: `New event: ${title}`,
          link: '/events',
        });
        io.to(`user_${m._id}`).emit('notification', { message: `New event: ${title}` });
      }
    }

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name profilePhoto currentRole')
      .populate('registrations', 'name profilePhoto');
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.registrations.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    event.registrations.push(req.user._id);
    await event.save();
    res.json({ message: 'Registered successfully', count: event.registrations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
