const jwt = require('jsonwebtoken');
const User = require('../models/User');
const College = require('../models/College');

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.entityType === 'college') {
      const college = await College.findById(decoded.id);
      if (!college) return res.status(401).json({ message: 'College not found' });
      req.college = college;
      req.entityType = 'college';
    } else {
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ message: 'User not found' });
      req.user = user;
      req.entityType = 'user';
    }

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = authenticate;
