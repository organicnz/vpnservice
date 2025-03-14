import { Request, Response, NextFunction } from 'express';
import { verifyToken, getUserById } from '../services/authService';
import { User } from '../types';

// Extend Express Request to include user
declare global {
  // Using import instead of namespace for ES2015 compatibility
namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Authentication middleware to protect routes
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'No token provided',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'Invalid token',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Get user data
    const user = await getUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication failed',
        error: 'User not found',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Authorization middleware to restrict routes to admins only
 */
export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required',
      error: 'No user found in request',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Forbidden',
      error: 'Admin privileges required',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  next();
}; 