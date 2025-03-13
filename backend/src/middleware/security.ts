import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { TooManyRequestsError } from '../utils/errors';

// Environment variables with defaults
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '15', 10) * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || '100', 10); // 100 requests per window
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080'];

/**
 * Apply security middleware to Express application
 * @param app Express application instance
 */
export const configureSecurityMiddleware = (app: express.Application): void => {
  // Enable helmet for security headers
  app.use(helmet());
  
  // Configure CORS
  app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list
      if (ALLOWED_ORIGINS.indexOf(origin) !== -1 || ALLOWED_ORIGINS.includes('*')) {
        return callback(null, true);
      }
      
      // Otherwise, reject the request
      return callback(new Error('CORS policy violation'), false);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));
  
  // Configure rate limiting
  const limiter = rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    max: RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: (req, res) => {
      const error = new TooManyRequestsError('Rate limit exceeded. Please try again later.');
      return res.status(429).json({
        success: false,
        status: 429,
        message: error.message
      });
    }
  });
  
  // Apply rate limiting to all API routes
  app.use('/api', limiter);
  
  // Disable X-Powered-By header
  app.disable('x-powered-by');
  
  // Set secure cookies
  app.set('trust proxy', 1);
}; 