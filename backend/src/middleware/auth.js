/**
 * Authentication middleware to protect routes using Supabase JWT
 */
module.exports = async function(req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '') || 
               req.header('x-auth-token');
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  
  try {
    if (!global.supabase) {
      return res.status(503).json({ 
        message: 'Authentication service unavailable', 
        error: 'Supabase client not initialized' 
      });
    }
    
    // Verify token using Supabase
    const { data: { user }, error } = await global.supabase.auth.getUser(token);
    
    if (error) {
      return res.status(401).json({ message: 'Invalid token', error: error.message });
    }
    
    if (!user) {
      return res.status(401).json({ message: 'User not found or token invalid' });
    }
    
    // Add user info to request
    req.user = user;
    next();
  } catch (error) {
    console.error(`Auth middleware error: ${error.message}`);
    
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 