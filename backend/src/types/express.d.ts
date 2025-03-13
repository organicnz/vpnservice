import { Request as ExpressRequest, Response as ExpressResponse } from 'express';

declare global {
  namespace Express {
    interface Request extends ExpressRequest {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

// Export an empty object to make this a module
export {}; 