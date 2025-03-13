import { Request, Response, NextFunction } from 'express';

export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type ErrorMiddlewareFunction = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

export type CacheKeyFunction = (req: Request) => string; 