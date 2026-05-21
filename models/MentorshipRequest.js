const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    message: { type: String },
  },
  { timestamps: true }
);

mentorshipRequestSchema.index({ studentId: 1, mentorId: 1, status: 1 });
mentorshipRequestSchema.index({ mentorId: 1, status: 1 });

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
