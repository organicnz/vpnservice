import rateLimit from 'express-rate-limit';
import { MiddlewareFunction } from '../types/middleware';

export const createRateLimiter = (
  windowMs: number = 15 * 60 * 1000, // 15 minutes
  max: number = 100 // limit each IP to 100 requests per windowMs
): MiddlewareFunction => {
  return rateLimit({
    windowMs,
    max,
    message: {
      status: 'error',
      message: 'Too many requests from this IP, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}; 