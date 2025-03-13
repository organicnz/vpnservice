import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

declare global {
  namespace Express {
    export interface Request<
      P = ParamsDictionary,
      ResBody = any,
      ReqBody = any,
      ReqQuery = ParsedQs,
    > extends ExpressRequest<P, ResBody, ReqBody, ReqQuery> {
      user?: {
        id: string;
        role: string;
        [key: string]: any;
      };
      params: P;
      body: ReqBody;
      query: ReqQuery;
    }
  }
}

// Export an empty object to make this a module
export {}; 