const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    collegeId: { type: mongoose.Schema.Types.ObjectId, ref: 'College' },
    expertise: [{ type: String }],
    company: { type: String },
    role: { type: String },
    yearsOfExperience: { type: Number, default: 0 },
    bio: { type: String },
    availability: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

mentorSchema.index({ collegeId: 1, availability: 1 });

module.exports = mongoose.model('Mentor', mentorSchema);
