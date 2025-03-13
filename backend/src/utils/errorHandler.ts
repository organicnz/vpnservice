import { Response } from 'express';
import { AppError } from '../types';

/**
 * Custom application error class
 */
export class ApiError extends Error implements AppError {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string): ApiError {
    return new ApiError(message, 400);
  }

  static unauthorized(message: string): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message: string): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message: string): ApiError {
    return new ApiError(message, 404);
  }

  static internal(message: string): ApiError {
    return new ApiError(message, 500, false);
  }
}

/**
 * Global error handler function
 * @param error Error object
 * @param res Express response object
 */
export const handleError = (error: Error | AppError, res: Response): void => {
  // Default to 500 for unexpected errors
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  let isOperational = false;

  // Check if it's our custom AppError
  if ('statusCode' in error) {
    statusCode = error.statusCode;
    errorMessage = error.message;
    isOperational = error.isOperational;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  // In production, don't expose non-operational error details
  if (process.env.NODE_ENV === 'production' && !isOperational) {
    errorMessage = 'Something went wrong';
  }

  // Log error for debugging
  console.error('ERROR:', {
    message: error.message,
    stack: error.stack,
    isOperational: isOperational,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: 'Error occurred',
    error: errorMessage,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Async error handler wrapper for controller functions
 * @param fn Async controller function
 */
export const asyncHandler = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      next(error);
    });
  };
}; 