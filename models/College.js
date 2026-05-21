const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const collegeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    domain: { type: String },
    logo: { type: String },
    pendingUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    approvedAlumni: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    approvedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

collegeSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12);
  next();
});

collegeSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('College', collegeSchema);
