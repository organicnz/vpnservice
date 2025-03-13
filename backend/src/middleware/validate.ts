import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BadRequestError } from '../utils/errors';

/**
 * Validation middleware factory for Express
 * Uses Zod schemas to validate request data
 * 
 * @param schema The Zod schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: AnyZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract data from request
      const data = {
        body: req.body,
        query: req.query,
        params: req.params,
        // Include headers if needed for validation
        // headers: req.headers,
      };

      // Validate data against schema
      schema.parse(data);
      
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        
        next(new BadRequestError(`Validation error: ${JSON.stringify(formattedErrors)}`));
      } else {
        // Pass other errors to the error handler
        next(error);
      }
    }
  };
}; 