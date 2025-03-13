import { Request, Response, NextFunction } from 'express';
import { ApiError, isApiError, toApiError } from '../utils/errors';

/**
 * Global error handler middleware for Express
 * Catches all errors and formats them into a consistent API response
 */
export const errorHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log request details for debugging
  console.error(`[ERROR] ${req.method} ${req.path} - ${err.message}`);
  
  // Convert to ApiError if it's not already one
  const apiError = isApiError(err) ? err : toApiError(err);
  
  // Create standardized error response
  const errorResponse = {
    success: false,
    status: apiError.statusCode,
    message: apiError.message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: apiError.stack,
      path: req.path
    })
  };
  
  // Send appropriate status code and error response
  return res.status(apiError.statusCode).json(errorResponse);
};

/**
 * 404 handler middleware for Express - catches all undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new ApiError(
    404,
    `Route not found - ${req.originalUrl}`
  );
  
  next(error);
};

/**
 * Async handler to catch async errors and forward to the error handler
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 