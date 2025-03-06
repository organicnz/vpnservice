const logger = require('../utils/logger');

/**
 * Admin middleware to restrict access to admin routes
 * Must be used after the auth middleware
 */
module.exports = function(req, res, next) {
  // Check if user exists and has admin role in user metadata
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Check admin role in user metadata
  const isAdmin = req.user.app_metadata?.role === 'admin' || 
                  req.user.user_metadata?.role === 'admin';
                  
  if (!isAdmin) {
    console.warn(`Non-admin user ${req.user.id} attempted to access admin route`);
    return res.status(403).json({ message: 'Access denied. Admin only.' });
  }
  
  next();
}; 