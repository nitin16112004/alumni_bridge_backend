const authorize = (...roles) => (req, res, next) => {
  if (req.entityType === 'college') {
    if (roles.includes('college')) return next();
    return res.status(403).json({ message: 'Access denied' });
  }
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = authorize;
