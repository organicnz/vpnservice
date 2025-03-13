/**
 * Custom error classes for the VPN Service API
 * Standardizes error handling and HTTP responses
 */

// Base API Error class that extends Error
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    statusCode: number, 
    message: string, 
    isOperational = true,
    stack = ''
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

// HTTP 400 Bad Request - Invalid input
export class BadRequestError extends ApiError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

// HTTP 401 Unauthorized - Authentication failure
export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') {
    super(401, message);
  }
}

// HTTP 403 Forbidden - Permission denied
export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') {
    super(403, message);
  }
}

// HTTP 404 Not Found - Resource not found
export class NotFoundError extends ApiError {
  constructor(resource = 'Resource') {
    super(404, `${resource} not found`);
  }
}

// HTTP 409 Conflict - Resource conflict
export class ConflictError extends ApiError {
  constructor(message = 'Resource conflict') {
    super(409, message);
  }
}

// HTTP 429 Too Many Requests - Rate limit exceeded
export class TooManyRequestsError extends ApiError {
  constructor(message = 'Too many requests') {
    super(429, message);
  }
}

// HTTP 500 Internal Server Error - Server error
export class InternalServerError extends ApiError {
  constructor(message = 'Internal server error') {
    super(500, message, false);
  }
}

// HTTP 502 Bad Gateway - Upstream service error
export class BadGatewayError extends ApiError {
  constructor(message = 'Bad gateway') {
    super(502, message, false);
  }
}

// HTTP 503 Service Unavailable - Service temporarily unavailable
export class ServiceUnavailableError extends ApiError {
  constructor(message = 'Service unavailable') {
    super(503, message, false);
  }
}

// Helper function to determine if error is a known API error
export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};

// Helper function to convert unknown errors to ApiError
export const toApiError = (error: any): ApiError => {
  if (isApiError(error)) return error;
  
  const message = error.message || 'Something went wrong';
  console.error('Unhandled error:', error);
  
  return new InternalServerError(message);
}; 