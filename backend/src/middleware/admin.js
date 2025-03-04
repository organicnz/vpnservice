const logger = require('../utils/logger');

/**
 * Admin middleware to restrict access to admin routes
 * Must be used after the auth middleware
 */
module.exports = function(req, res, next) {
  // Check if user exists and is an admin
  if (!req.user || req.user.role !== 'admin') {
    logger.warn(`Non-admin user ${req.user ? req.user.id : 'unknown'} attempted to access admin route`);
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  next();
}; 