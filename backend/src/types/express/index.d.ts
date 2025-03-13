import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      [key: string]: any;
    }

    interface Request<
      P = ParamsDictionary,
      ResBody = any,
      ReqBody = any,
      ReqQuery = ParsedQs,
      Locals extends Record<string, any> = Record<string, any>
    > {
      user?: User;
      params: P;
      body: ReqBody;
      query: ReqQuery;
    }
  }
}

export {}; 